export interface Theme {
  isDark: boolean;
  background: string;
  card: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryBadgeBg: string;
  accent: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  inputBg: string;
  tabBarBg: string;
  tabBarBorder: string;
  cardShadow: string;
}

export const lightTheme: Theme = {
  isDark: false,
  background: "#F8FAFC",
  card: "#FFFFFF",
  surface: "#F1F5F9",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  primary: "#2563EB",
  primaryLight: "#3B82F6",
  primaryBadgeBg: "#EFF6FF",
  accent: "#8B5CF6",
  success: "#10B981",
  successBg: "#ECFDF5",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  danger: "#EF4444",
  dangerBg: "#FEF2F2",
  inputBg: "#F8FAFC",
  tabBarBg: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
  cardShadow: "rgba(15, 23, 42, 0.05)",
};

export const darkTheme: Theme = {
  isDark: true,
  background: "#0F172A",
  card: "#1E293B",
  surface: "#334155",
  border: "#334155",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#64748B",
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  primaryBadgeBg: "rgba(59, 130, 246, 0.15)",
  accent: "#A78BFA",
  success: "#10B981",
  successBg: "rgba(16, 185, 129, 0.15)",
  warning: "#FBBF24",
  warningBg: "rgba(245, 158, 11, 0.15)",
  danger: "#F87171",
  dangerBg: "rgba(239, 68, 68, 0.15)",
  inputBg: "#0B1120",
  tabBarBg: "#1E293B",
  tabBarBorder: "#334155",
  cardShadow: "rgba(0, 0, 0, 0.4)",
};
