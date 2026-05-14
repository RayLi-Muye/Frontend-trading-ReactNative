export const colors = {
  canvas: "#f7f8f5",
  surface: "#ffffff",
  surfaceAlt: "#f2f4ef",
  ink: "#101411",
  muted: "#68716b",
  subtle: "#9aa39d",
  line: "#e2e7df",
  brand: "#00ff6a",
  brandDark: "#116b37",
  brandSoft: "#dff8e8",
  positive: "#19a55a",
  negative: "#cf3b35",
  warning: "#fef0c7",
  warningDark: "#8a5b13",
  purpleSoft: "#eeeaff",
  purple: "#694aff",
  inverse: "#ffffff",
  inverseMuted: "#c9d2cc",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const shadows = {
  card: {
    boxShadow: "0 8px 24px rgba(16, 20, 17, 0.08)",
  },
  pressed: {
    boxShadow: "0 2px 8px rgba(16, 20, 17, 0.08)",
  },
} as const;

