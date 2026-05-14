export const colors = {
  canvas: "#f5f8f4",
  surface: "#ffffff",
  surfaceAlt: "#f1f3ef",
  ink: "#080b12",
  muted: "#667085",
  subtle: "#98a2b3",
  line: "#e6eaf0",
  brand: "#00ff6a",
  brandAction: "#05b83f",
  brandDark: "#063d20",
  brandSoft: "#e7faee",
  positive: "#0dbb4f",
  negative: "#ff2f3d",
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
