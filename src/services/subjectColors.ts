export interface SubjectTheme {
  name: string;
  color: string;
  bgColor: string;
  badgeBg: string;
  emoji: string;
}

const SUBJECT_MAP: Record<string, SubjectTheme> = {
  MATH: {
    name: "Mathématiques",
    color: "#2563EB", // Electric blue
    bgColor: "#EFF6FF",
    badgeBg: "#DBEAFE",
    emoji: "📐",
  },
  FRANC: {
    name: "Français",
    color: "#E11D48", // Rose carmin
    bgColor: "#FFF1F2",
    badgeBg: "#FFE4E6",
    emoji: "📖",
  },
  HIST: {
    name: "Histoire-Géo",
    color: "#D97706", // Ambre
    bgColor: "#FFFBEB",
    badgeBg: "#FEF3C7",
    emoji: "🌍",
  },
  HG: {
    name: "Histoire-Géo",
    color: "#D97706",
    bgColor: "#FFFBEB",
    badgeBg: "#FEF3C7",
    emoji: "🌍",
  },
  SVT: {
    name: "SVT",
    color: "#059669", // Émeraude
    bgColor: "#ECFDF5",
    badgeBg: "#D1FAE5",
    emoji: "🌱",
  },
  PHYS: {
    name: "Physique-Chimie",
    color: "#0891B2", // Cyan
    bgColor: "#ECFEFF",
    badgeBg: "#CFFAFE",
    emoji: "⚡",
  },
  PC: {
    name: "Physique-Chimie",
    color: "#0891B2",
    bgColor: "#ECFEFF",
    badgeBg: "#CFFAFE",
    emoji: "⚡",
  },
  ANGL: {
    name: "Anglais",
    color: "#7C3AED", // Violet
    bgColor: "#F5F3FF",
    badgeBg: "#EDE9FE",
    emoji: "🇬🇧",
  },
  ESP: {
    name: "Espagnol",
    color: "#EA580C", // Orange vif
    bgColor: "#FFF7ED",
    badgeBg: "#FFEDD5",
    emoji: "🇪🇸",
  },
  ALL: {
    name: "Allemand",
    color: "#B45309",
    bgColor: "#FFFBEB",
    badgeBg: "#FEF3C7",
    emoji: "🇩🇪",
  },
  ITAL: {
    name: "Italien",
    color: "#16A34A",
    bgColor: "#F0FDF4",
    badgeBg: "#DCFCE7",
    emoji: "🇮🇹",
  },
  EPS: {
    name: "EPS",
    color: "#0D9488", // Teal
    bgColor: "#F0FDFA",
    badgeBg: "#CCFBF1",
    emoji: "🏃",
  },
  ARTS: {
    name: "Arts Plastiques",
    color: "#DB2777", // Fuchsia
    bgColor: "#FDF2F8",
    badgeBg: "#FCE7F3",
    emoji: "🎨",
  },
  MUSI: {
    name: "Musique",
    color: "#4F46E5", // Indigo
    bgColor: "#EEF2FF",
    badgeBg: "#E0E7FF",
    emoji: "🎵",
  },
  TECH: {
    name: "Technologie",
    color: "#475569", // Slate
    bgColor: "#F8FAFC",
    badgeBg: "#E2E8F0",
    emoji: "💻",
  },
  PHIL: {
    name: "Philosophie",
    color: "#9333EA",
    bgColor: "#FAF5FF",
    badgeBg: "#F3E8FF",
    emoji: "💭",
  },
  SES: {
    name: "SES",
    color: "#0284C7",
    bgColor: "#F0F9FF",
    badgeBg: "#E0F2FE",
    emoji: "📈",
  },
  EMC: {
    name: "EMC",
    color: "#059669",
    bgColor: "#ECFDF5",
    badgeBg: "#D1FAE5",
    emoji: "🏛️",
  },
};

const DEFAULT_THEME: SubjectTheme = {
  name: "Matière",
  color: "#64748B",
  bgColor: "#F8FAFC",
  badgeBg: "#F1F5F9",
  emoji: "📚",
};

export function getSubjectTheme(rawName: string = "", rawCode: string = ""): SubjectTheme {
  const clean = (rawName + " " + rawCode).toUpperCase();

  for (const [key, theme] of Object.entries(SUBJECT_MAP)) {
    if (clean.includes(key)) {
      return {
        ...theme,
        name: rawName || theme.name,
      };
    }
  }

  // Fallback hash for unrecognized subjects to generate consistent vibrant color
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    { color: "#2563EB", bg: "#EFF6FF", badge: "#DBEAFE" },
    { color: "#E11D48", bg: "#FFF1F2", badge: "#FFE4E6" },
    { color: "#059669", bg: "#ECFDF5", badge: "#D1FAE5" },
    { color: "#D97706", bg: "#FFFBEB", badge: "#FEF3C7" },
    { color: "#7C3AED", bg: "#F5F3FF", badge: "#EDE9FE" },
    { color: "#0891B2", bg: "#ECFEFF", badge: "#CFFAFE" },
    { color: "#DB2777", bg: "#FDF2F8", badge: "#FCE7F3" },
  ];
  const chosen = colors[Math.abs(hash) % colors.length];

  return {
    name: rawName || "Autre",
    color: chosen.color,
    bgColor: chosen.bg,
    badgeBg: chosen.badge,
    emoji: "📚",
  };
}

export function formatGradeValue(val: string): { num: number | null; text: string } {
  if (!val) return { num: null, text: "-" };
  const cleaned = val.replace(",", ".");
  const num = parseFloat(cleaned);
  return {
    num: isNaN(num) ? null : num,
    text: val,
  };
}

export function getGradeColor(val: string, max: string = "20"): string {
  const { num } = formatGradeValue(val);
  const maxNum = parseFloat(max.replace(",", ".")) || 20;
  if (num === null) return "#64748B";

  const ratio = (num / maxNum) * 20; // normalize on 20
  if (ratio >= 15) return "#059669"; // Great (Emerald)
  if (ratio >= 12) return "#2563EB"; // Good (Blue)
  if (ratio >= 10) return "#D97706"; // Pass (Amber)
  return "#E11D48";                 // Low (Rose/Red)
}
