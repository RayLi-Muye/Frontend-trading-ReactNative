const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const port = Number(process.env.VERIFY_WEB_PORT ?? 4188);
const remoteBaseUrl = process.env.VERIFY_WEB_BASE_URL?.replace(/\/$/, "");
const baseUrl = remoteBaseUrl ?? `http://127.0.0.1:${port}`;
const holdingsKey = "market-demo-portfolio-holdings-v1";
const accountsKey = "market-demo-wallet-accounts-v1";
const ledgerKey = "market-demo-simulated-ledger-v1";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function findChrome() {
  const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));

  if (!chromePath) {
    throw new Error("Chrome executable not found. Set CHROME_PATH to run web demo verification.");
  }

  return chromePath;
}

function contentType(filePath) {
  const extension = path.extname(filePath);

  switch (extension) {
    case ".css":
      return "text/css";
    case ".html":
      return "text/html";
    case ".ico":
      return "image/x-icon";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function resolveStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleanPath = decoded === "/" ? "/index.html" : decoded;
  const directPath = path.join(distDir, cleanPath);
  const htmlPath = path.join(distDir, `${cleanPath}.html`);
  const nestedIndexPath = path.join(distDir, cleanPath, "index.html");

  for (const candidate of [directPath, htmlPath, nestedIndexPath]) {
    if (candidate.startsWith(distDir) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return path.join(distDir, "index.html");
}

function createStaticServer() {
  return http.createServer((request, response) => {
    const filePath = resolveStaticPath(request.url ?? "/");
    response.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function closeServer(server) {
  if (!server) {
    return Promise.resolve();
  }

  return new Promise((resolve) => server.close(resolve));
}

function waitForProcessExit(processHandle) {
  if (processHandle.exitCode !== null || processHandle.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    processHandle.once("exit", resolve);
  });
}

async function waitForDevtools(portNumber) {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    try {
      const targets = await requestJson(`http://127.0.0.1:${portNumber}/json/list`);
      const page = targets.find((target) => target.type === "page");

      if (page) {
        return page;
      }
    } catch {
      await sleep(120);
    }
  }

  throw new Error("Timed out waiting for Chrome DevTools target.");
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let id = 0;

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      const { reject, resolve } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    }
  };

  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      id += 1;
      pending.set(id, { reject, resolve });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  return {
    close: () => socket.close(),
    send,
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    awaitPromise: true,
    expression,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }

  return result.result.value;
}

async function waitFor(client, expression, label, timeout = 8_000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) {
      return;
    }

    await sleep(150);
  }

  throw new Error(`Timed out waiting for ${label}`);
}

async function navigate(client, route) {
  await client.send("Page.navigate", { url: `${baseUrl}${route}` });
  await sleep(350);
}

async function clickLabel(client, label) {
  await evaluate(client, `document.querySelector('[aria-label="${label}"]')?.click()`);
}

function accountBalance(accounts, code) {
  return accounts.find((account) => account.code === code)?.available ?? null;
}

async function storedAccounts(client) {
  return evaluate(client, `JSON.parse(localStorage.getItem('${accountsKey}') || '[]')`);
}

async function storedHoldings(client) {
  return evaluate(client, `JSON.parse(localStorage.getItem('${holdingsKey}') || '[]')`);
}

async function storedLedgerEntries(client) {
  return evaluate(client, `JSON.parse(localStorage.getItem('${ledgerKey}') || '[]')`);
}

async function runVerification(client) {
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 2,
    height: 844,
    mobile: true,
    width: 390,
  });

  await navigate(client, "/");
  await waitFor(client, `document.body.innerText.includes('Enter App')`, "launch splash");
  await clickLabel(client, "Enter main interface");
  await waitFor(client, `document.body.innerText.includes('Cash and Holding')`, "home");
  await waitFor(
    client,
    `document.body.innerText.includes('Market Brief') && document.body.innerText.includes('Local demo') && document.body.innerText.includes('Not financial advice')`,
    "demo market brief",
  );

  await evaluate(client, `localStorage.removeItem('${holdingsKey}'); localStorage.removeItem('${accountsKey}'); localStorage.removeItem('${ledgerKey}');`);

  await navigate(client, "/discover");
  await waitFor(client, `document.body.innerText.includes('Discover') && document.body.innerText.includes('Financial Business')`, "discover content");
  assert(await evaluate(client, `document.body.innerText.includes('Top Movers')`), "Discover should show Top Movers.");

  await navigate(client, "/wallet");
  await waitFor(
    client,
    `document.body.innerText.includes('Wallet') && document.body.innerText.includes('USD Account') && document.body.innerText.includes('Performance Recap') && document.body.innerText.includes('Current virtual value') && document.body.innerText.includes('Starting demo state') && document.body.innerText.includes('Learning Insights') && document.body.innerText.includes('Cash allocation') && document.body.innerText.includes('Top exposure') && document.body.innerText.includes('Trade Journal') && document.body.innerText.includes('No simulated journal entries yet') && document.body.innerText.includes('No simulated ledger entries yet') && document.body.innerText.includes('Not financial advice')`,
    "wallet learning insights",
  );
  await clickLabel(client, "Open USD wallet actions");
  await waitFor(client, `[...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Deposit USD')`, "wallet actions");
  await clickLabel(client, "Deposit USD");
  await waitFor(client, `document.body.innerText.includes('Deposited $500.00 to USD')`, "wallet deposit feedback");
  const afterDeposit = await storedAccounts(client);
  assert(accountBalance(afterDeposit, "USD") === 4160.39, "Deposit should increase USD cash to 4160.39.");

  await clickLabel(client, "Open USD wallet actions");
  await waitFor(client, `[...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Transfer USD')`, "wallet transfer action");
  await clickLabel(client, "Transfer USD");
  await waitFor(client, `document.body.innerText.includes('Transferred $250.00 from USD to AUD')`, "wallet transfer feedback");
  const afterTransfer = await storedAccounts(client);
  assert(accountBalance(afterTransfer, "USD") === 3910.39, "Transfer should reduce USD cash to 3910.39.");
  assert(accountBalance(afterTransfer, "AUD") === 250, "Transfer should increase AUD cash to 250.");

  await navigate(client, "/instrument/NFLX");
  await waitFor(client, `document.body.innerText.includes('NFLX') && document.body.innerText.includes('Trade')`, "NFLX detail");
  await waitFor(
    client,
    `document.body.innerText.includes('Simulated Position') && document.body.innerText.includes('No simulated position') && document.body.innerText.includes('No simulated activity') && document.body.innerText.includes('Not financial advice')`,
    "NFLX empty simulated position summary",
  );
  await clickLabel(client, "Open trade choices");
  await waitFor(
    client,
    `document.body.innerText.includes('Simulated preview only') && document.body.innerText.includes('Concentration warning') && document.body.innerText.includes('Not financial advice')`,
    "concentration preview",
  );

  await navigate(client, "/instrument/BTC");
  await waitFor(client, `document.body.innerText.includes('BTC') && document.body.innerText.includes('Trade')`, "BTC detail");
  await clickLabel(client, "Open trade choices");
  await waitFor(
    client,
    `document.body.innerText.includes('Simulated preview only') && document.body.innerText.includes('Insufficient virtual funds') && document.body.innerText.includes('Virtual ledger debit')`,
    "insufficient funds preview",
  );
  assert(await evaluate(client, `document.querySelector('[aria-label="Place buy order"]')?.disabled === true`), "Buy should be disabled when the preview has insufficient virtual funds.");

  await navigate(client, "/instrument/NVDA");
  await waitFor(client, `document.body.innerText.includes('NVDA') && document.body.innerText.includes('Trade')`, "NVDA detail");
  await clickLabel(client, "Open trade choices");
  await waitFor(client, `document.body.innerText.includes('Simulated preview only') && document.body.innerText.includes('Place Buy Order')`, "buy ticket");
  await clickLabel(client, "Place buy order");
  await waitFor(client, `document.body.innerText.includes('Simulated buy filled') && document.body.innerText.includes('Virtual ledger')`, "simulated buy confirmation");
  await waitFor(
    client,
    `document.body.innerText.includes('Simulated Position') && document.body.innerText.includes('NVDA local learning summary') && document.body.innerText.includes('Quantity') && document.body.innerText.includes('Market value') && document.body.innerText.includes('Avg cost') && document.body.innerText.includes('Latest simulated activity') && document.body.innerText.includes('Not financial advice')`,
    "NVDA populated simulated position summary",
  );
  const holdingsAfterBuy = await storedHoldings(client);
  const accountsAfterBuy = await storedAccounts(client);
  assert(holdingsAfterBuy.some((holding) => holding.symbol === "NVDA"), "NVDA should be added to portfolio after buy.");
  assert(accountBalance(accountsAfterBuy, "USD") < 3910.39, "Buy should reduce USD cash.");

  await navigate(client, "/portfolio");
  await waitFor(client, `document.body.innerText.includes('Assets (6)') && document.body.innerText.includes('NVDA')`, "portfolio NVDA");

  await navigate(client, "/instrument/AMD");
  await waitFor(client, `document.body.innerText.includes('AMD') && document.body.innerText.includes('Trade')`, "AMD detail");
  await clickLabel(client, "Open trade choices");
  await waitFor(client, `document.body.innerText.includes('Place Buy Order')`, "AMD ticket");
  await evaluate(client, `[...document.querySelectorAll('[role="button"]')].find((node) => node.textContent === 'Sell')?.click()`);
  await waitFor(client, `document.body.innerText.includes('Oversell guardrail')`, "AMD oversell preview");
  assert(await evaluate(client, `document.querySelector('[aria-label="Place sell order"]')?.disabled === true`), "Sell should be disabled for unheld AMD.");

  await navigate(client, "/watchlist");
  await waitFor(
    client,
    `document.body.innerText.includes('Watch List') && document.body.innerText.includes('Market') && document.body.innerText.includes('Compare Watchlist') && document.body.innerText.includes('Pinned 5 of 5 demo symbols') && document.body.innerText.includes('NVDA Held') && document.body.innerText.includes('MSFT Held') && document.body.innerText.includes('Local watchlist comparison only') && document.body.innerText.includes('Not financial advice')`,
    "watchlist compare default and holding status",
  );
  await waitFor(
    client,
    `[...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Remove META from compare') && [...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Add BTC to compare') && [...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Open NVDA compare detail')`,
    "watchlist compare controls",
  );
  await clickLabel(client, "Remove META from compare");
  await waitFor(
    client,
    `document.body.innerText.includes('Pinned 4 of 5 demo symbols') && [...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Add META to compare')`,
    "watchlist compare remove",
  );
  await clickLabel(client, "Add BTC to compare");
  await waitFor(
    client,
    `document.body.innerText.includes('Pinned 5 of 5 demo symbols') && document.body.innerText.includes('BTC Not held') && [...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Remove BTC from compare')`,
    "watchlist compare add",
  );
  await clickLabel(client, "Open NVDA compare detail");
  await waitFor(client, `document.body.innerText.includes('NVDA') && document.body.innerText.includes('Trade')`, "watchlist compare instrument path");

  await navigate(client, "/wallet");
  await waitFor(
    client,
    `document.body.innerText.includes('Wallet') && document.body.innerText.includes('Performance Recap') && document.body.innerText.includes('Recent account checkpoint') && document.body.innerText.includes('Best contribution') && document.body.innerText.includes('Worst contribution') && document.body.innerText.includes('Learning Insights') && document.body.innerText.includes('Latest simulated ledger') && document.body.innerText.includes('Trade Journal') && document.body.innerText.includes('Entry recap checklist') && document.body.innerText.includes('Virtual cash flow debit') && document.body.innerText.includes('Simulated Activity') && document.body.innerText.includes('Virtual cash debit') && document.body.innerText.includes('Balance after')`,
    "wallet simulated activity",
  );
  const ledgerAfterBuy = await storedLedgerEntries(client);
  assert(ledgerAfterBuy.length === 1, "Wallet activity should reflect the simulated buy ledger entry.");
  await waitFor(
    client,
    `[...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Filter journal buy') && [...document.querySelectorAll('[aria-label]')].some((node) => node.getAttribute('aria-label') === 'Filter journal nvda')`,
    "journal filters",
  );
  await clickLabel(client, "Filter journal buy");
  await clickLabel(client, "Filter journal nvda");
  await waitFor(
    client,
    `document.body.innerText.includes('Showing NVDA buys') && document.body.innerText.includes('NVDA Buy') && document.body.innerText.includes('Entry recap checklist')`,
    "filtered trade journal recap",
  );

  await clickLabel(client, "Reset demo state");
  await waitFor(
    client,
    `document.body.innerText.includes('Starting demo state') && document.body.innerText.includes('No simulated trades yet') && document.body.innerText.includes('No simulated journal entries yet') && document.body.innerText.includes('No simulated ledger entries yet') && document.body.innerText.includes('Not financial advice')`,
    "wallet reset empty activity",
  );
  const ledgerAfterReset = await storedLedgerEntries(client);
  const accountsAfterReset = await storedAccounts(client);
  const holdingsAfterReset = await storedHoldings(client);
  assert(ledgerAfterReset.length === 0, "Reset should clear simulated ledger entries.");
  assert(accountBalance(accountsAfterReset, "USD") === 3660.39, "Reset should restore initial USD cash.");
  assert(accountBalance(accountsAfterReset, "AUD") === 0, "Reset should restore initial AUD cash.");
  assert(!holdingsAfterReset.some((holding) => holding.symbol === "NVDA"), "Reset should remove the demo NVDA purchase.");
}

async function runDesktopNavigationVerification(client) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 800,
    mobile: false,
    width: 1280,
  });

  await navigate(client, "/discover");
  await waitFor(client, `document.querySelector('iframe')?.contentDocument?.body?.innerText.includes('Discover')`, "desktop discover preview route");

  const navState = await evaluate(
    client,
    `(() => {
      const frameDocument = document.querySelector('iframe')?.contentDocument;
      const labels = ['Home tab', 'Invest tab', 'Watchlist tab', 'Discover tab', 'Search tab'];
      return labels.map((label) => {
        const nodes = [...(frameDocument?.querySelectorAll('[aria-label="' + label + '"]') ?? [])];
        const candidates = nodes.map((candidate) => {
          const rect = candidate.getBoundingClientRect();
          const parent = candidate.parentElement?.getBoundingClientRect();
          return {
            bottom: rect.bottom,
            height: rect.height,
            left: rect.left,
            parentWidth: parent?.width ?? null,
            right: rect.right,
            top: rect.top,
            width: rect.width,
          };
        });
        const node = nodes
          .map((candidate) => ({ candidate, rect: candidate.getBoundingClientRect() }))
          .find(({ rect }) => rect.width > 24 && rect.height > 24)?.candidate ?? nodes[0];
        if (!node) return { label, exists: false };
        const rect = node.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          candidates,
          exists: true,
          height: rect.height,
          label,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        };
      });
    })()`,
  );

  const viewport = await evaluate(client, `(() => {
    const frameDocument = document.querySelector('iframe')?.contentDocument;
    return {
      height: frameDocument?.documentElement?.clientHeight ?? 0,
      width: frameDocument?.documentElement?.clientWidth ?? 0,
    };
  })()`);
  const missing = navState.filter((item) => !item.exists).map((item) => item.label);
  assert(missing.length === 0, `Desktop navigation missing labels: ${missing.join(", ")}`);
  navState.forEach((item) => {
    assert(item.width > 24 && item.height > 24, `${item.label} should have a visible desktop hit area: ${JSON.stringify(item)}`);
    assert(item.top >= 0 && item.bottom <= viewport.height, `${item.label} should be inside the desktop viewport: ${JSON.stringify(item)}`);
    assert(item.left >= 0 && item.right <= viewport.width, `${item.label} should be inside the desktop viewport width: ${JSON.stringify(item)}`);
  });
}

async function runWideTouchShellVerification(client) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 1536,
    mobile: true,
    width: 1078,
  });
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 5,
  });

  await navigate(client, "/");
  await waitFor(client, `document.querySelector('iframe')?.contentDocument?.body?.innerText.includes('Enter App')`, "wide touch preview frame");
  await evaluate(client, `document.querySelector('iframe')?.contentDocument?.querySelector('[aria-label="Enter main interface"]')?.click()`);
  await waitFor(client, `document.querySelector('iframe')?.contentDocument?.body?.innerText.includes('Cash and Holding')`, "wide touch frame home");

  const shellState = await evaluate(
    client,
    `(() => {
      const shell = document.querySelector('iframe')?.getBoundingClientRect();
      const frameDocument = document.querySelector('iframe')?.contentDocument;
      const labels = ['Home tab', 'Invest tab', 'Watchlist tab', 'Discover tab', 'Search tab'];
      return {
        shell: shell ? {
          bottom: shell.bottom,
          height: shell.height,
          left: shell.left,
          right: shell.right,
          top: shell.top,
          width: shell.width,
        } : null,
        viewport: frameDocument ? {
          height: frameDocument.documentElement.clientHeight,
          width: frameDocument.documentElement.clientWidth,
        } : null,
        tabs: labels.map((label) => {
          const node = frameDocument?.querySelector('[aria-label="' + label + '"]');
          const rect = node?.getBoundingClientRect();
          return {
            label,
            rect: rect ? {
              bottom: rect.bottom,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              width: rect.width,
            } : null,
          };
        }),
      };
    })()`,
  );

  assert(shellState.shell, "Wide touch preview should have an app shell.");
  assert(shellState.viewport, "Wide touch preview should expose an iframe viewport.");
  assert(Math.abs(shellState.shell.width - 430) < 1, `Wide touch shell should render at 430px wide: ${JSON.stringify(shellState.shell)}`);
  shellState.tabs.forEach((tab) => {
    assert(tab.rect, `${tab.label} should exist in wide touch preview.`);
    assert(tab.rect.left >= 0, `${tab.label} should stay inside the iframe left edge: ${JSON.stringify({ tab, viewport: shellState.viewport })}`);
    assert(tab.rect.right <= shellState.viewport.width, `${tab.label} should stay inside the iframe right edge: ${JSON.stringify({ tab, viewport: shellState.viewport })}`);
    assert(tab.rect.bottom <= shellState.viewport.height, `${tab.label} should stay inside the iframe bottom edge: ${JSON.stringify({ tab, viewport: shellState.viewport })}`);
  });

  await client.send("Emulation.setTouchEmulationEnabled", { enabled: false });
}

async function runPreviewModeVerification(client) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 1200,
    mobile: false,
    width: 1440,
  });

  await navigate(client, "/");
  await waitFor(client, `document.querySelector('iframe')?.contentDocument?.body?.innerText.includes('Enter App')`, "preview mode frame");

  const modes = [
    { label: "Pad", height: 1024, width: 768 },
    { label: "Wide Pad", height: 768, width: 1024 },
    { label: "Phone", height: 932, width: 430 },
  ];

  for (const mode of modes) {
    await evaluate(client, `[...document.querySelectorAll('button')].find((node) => node.textContent === '${mode.label}')?.click()`);
    await waitFor(
      client,
      `(() => {
        const frame = document.querySelector('iframe');
        return frame?.clientWidth === ${mode.width} && frame?.clientHeight === ${mode.height};
      })()`,
      `${mode.label} preview dimensions`,
    );
    await waitFor(client, `document.querySelector('iframe')?.contentDocument?.body?.innerText.includes('Enter App')`, `${mode.label} preview launch`);
    await evaluate(client, `document.querySelector('iframe')?.contentDocument?.querySelector('[aria-label="Enter main interface"]')?.click()`);
    await waitFor(client, `document.querySelector('iframe')?.contentDocument?.body?.innerText.includes('Cash and Holding')`, `${mode.label} preview home`);

    const state = await evaluate(
      client,
      `(() => {
        const frame = document.querySelector('iframe');
        const doc = frame?.contentDocument;
        const labels = ['Home tab', 'Invest tab', 'Watchlist tab', 'Discover tab', 'Search tab'];
        return {
          frame: frame ? { height: frame.clientHeight, width: frame.clientWidth } : null,
          tabs: labels.map((label) => {
            const rect = doc?.querySelector('[aria-label="' + label + '"]')?.getBoundingClientRect();
            return { label, rect: rect ? { bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right, top: rect.top, width: rect.width } : null };
          }),
        };
      })()`,
    );

    assert(state.frame?.width === mode.width && state.frame?.height === mode.height, `${mode.label} should use the requested iframe size: ${JSON.stringify(state.frame)}`);
    state.tabs.forEach((tab) => {
      assert(tab.rect, `${mode.label} ${tab.label} should exist.`);
      assert(tab.rect.width > 24 && tab.rect.height > 24, `${mode.label} ${tab.label} should remain tappable: ${JSON.stringify(tab)}`);
      assert(tab.rect.left >= 0 && tab.rect.right <= mode.width, `${mode.label} ${tab.label} should stay inside preview width: ${JSON.stringify(tab)}`);
      assert(tab.rect.bottom <= mode.height, `${mode.label} ${tab.label} should stay inside preview height: ${JSON.stringify(tab)}`);
    });
  }
}

async function main() {
  assert(remoteBaseUrl || fs.existsSync(distDir), "dist directory not found. Run npm run export:web before verify:web-demo.");

  const chromePath = findChrome();
  const server = remoteBaseUrl ? null : createStaticServer();
  if (server) {
    await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  }

  const debugPort = port + 1000;
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-web-verify-"));
  const chrome = childProcess.spawn(chromePath, [
    "--headless=new",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-gpu",
    "--no-default-browser-check",
    "--no-first-run",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    `${baseUrl}/`,
  ], {
    stdio: "ignore",
  });

  let client;

  try {
    const page = await waitForDevtools(debugPort);
    client = await connectCdp(page.webSocketDebuggerUrl);
    await runVerification(client);
    await runDesktopNavigationVerification(client);
    await runWideTouchShellVerification(client);
    await runPreviewModeVerification(client);
    console.log("Web demo verification passed.");
  } finally {
    client?.close();
    chrome.kill();
    await Promise.race([waitForProcessExit(chrome), sleep(1200)]);
    await closeServer(server);
    fs.rmSync(userDataDir, { force: true, recursive: true });
  }
}

main().catch((error) => {
  console.error("Web demo verification failed:");
  console.error(error.message);
  process.exit(1);
});
