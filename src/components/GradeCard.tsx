import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GradeItem } from "../types";
import { getGradeColor, getSubjectTheme } from "../services/subjectColors";
import { useApp } from "../context/AppContext";

interface Props {
  grade: GradeItem;
  showSubjectPill?: boolean;
  showStudentBadge?: boolean;
}

export const GradeCard: React.FC<Props> = ({
  grade,
  showSubjectPill = true,
  showStudentBadge = false,
}) => {
  const { theme: appTheme } = useApp();
  const theme = getSubjectTheme(grade.discipline, grade.codeMatiere);
  const gradeColor = getGradeColor(grade.valeur, grade.noteSur);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: appTheme.card, borderColor: appTheme.border }]}>
      {/* Top row: Subject & Badges */}
      <View style={styles.topRow}>
        {showSubjectPill && (
          <View style={[styles.subjectPill, { backgroundColor: theme.badgeBg }]}>
            <Text style={styles.emojiText}>{theme.emoji}</Text>
            <Text style={[styles.subjectText, { color: theme.color }]} numberOfLines={1}>
              {grade.discipline}
            </Text>
          </View>
        )}

        {showStudentBadge && grade.studentName && (
          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>{grade.studentName}</Text>
          </View>
        )}

        <Text style={[styles.dateText, { color: appTheme.textMuted }]}>{formatDate(grade.date)}</Text>
      </View>

      {/* Main row: Evaluation title & Big Grade badge */}
      <View style={styles.mainRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.devoirTitle, { color: appTheme.text }]} numberOfLines={2}>
            {grade.devoir}
          </Text>
          <View style={styles.metaRow}>
            {grade.coef && grade.coef !== "1" && (
              <View style={[styles.coefBadge, { backgroundColor: appTheme.surface }]}>
                <Text style={[styles.coefText, { color: appTheme.textSecondary }]}>Coef. {grade.coef}</Text>
              </View>
            )}
            {grade.nonSignificatif && (
              <View style={styles.nonSigBadge}>
                <Text style={styles.nonSigText}>Non significatif</Text>
              </View>
            )}
          </View>
        </View>

        {/* Grade Badge */}
        <View style={[styles.gradeBadge, { backgroundColor: `${gradeColor}18` }]}>
          <Text style={[styles.gradeValue, { color: gradeColor }]}>
            {grade.valeur || "-"}
          </Text>
          <Text style={styles.gradeTotal}>/{grade.noteSur || "20"}</Text>
        </View>
      </View>

      {/* Class Statistics Strip */}
      {grade.moyenneClasse && (
        <View style={[styles.statsStrip, { backgroundColor: appTheme.surface }]}>
          <Text style={[styles.statItem, { color: appTheme.textSecondary }]}>
            Classe : <Text style={[styles.statBold, { color: appTheme.text }]}>{grade.moyenneClasse}</Text>
          </Text>
          {grade.min && (
            <Text style={[styles.statItem, { color: appTheme.textSecondary }]}>
              Min : <Text style={[styles.statBold, { color: appTheme.text }]}>{grade.min}</Text>
            </Text>
          )}
          {grade.max && (
            <Text style={[styles.statItem, { color: appTheme.textSecondary }]}>
              Max : <Text style={[styles.statBold, { color: appTheme.text }]}>{grade.max}</Text>
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  subjectPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  emojiText: {
    fontSize: 11,
    marginRight: 4,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: "700",
  },
  studentBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  studentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4338CA",
  },
  dateText: {
    marginLeft: "auto",
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  devoirTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  coefBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coefText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  nonSigBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nonSigText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#B45309",
  },
  gradeBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  gradeValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  gradeTotal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginLeft: 2,
  },
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#F8FAFC",
  },
  statItem: {
    fontSize: 11,
    color: "#64748B",
  },
  statBold: {
    fontWeight: "700",
    color: "#334155",
  },
});
