import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Award, ChevronDown, ChevronUp, TrendingUp } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { GradeCard } from "../components/GradeCard";
import { getGradeColor, getSubjectTheme } from "../services/subjectColors";

export const GradesScreen: React.FC = () => {
  const { grades, refreshing, refreshData, isFamilyView, activeStudent, theme } = useApp();
  const [viewMode, setViewMode] = useState<"subjects" | "timeline">("subjects");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const subjectsList = grades?.subjects || [];
  const notesList = grades?.notes || [];

  const handleToggleSubject = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSubjects((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const handleViewMode = (mode: "subjects" | "timeline") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(mode);
  };

  const genAvgColor = getGradeColor(grades?.moyenneGenerale || "15", "20");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={theme.primary} />
      }
    >
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Notes & Moyennes</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          {isFamilyView ? "Vue consolidée des évaluations" : "1er Trimestre • Année en cours"}
        </Text>
      </View>

      {/* Moyenne Générale Card (Only in single student view) */}
      {!isFamilyView && grades?.moyenneGenerale && (
        <View style={[styles.generalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.generalHeader}>
            <View style={[styles.generalIcon, { backgroundColor: theme.primaryBadgeBg }]}>
              <Award size={20} color={theme.primary} />
            </View>
            <View style={styles.generalTitles}>
              <Text style={[styles.generalLabel, { color: theme.textSecondary }]}>MOYENNE GÉNÉRALE</Text>
              <Text style={[styles.generalStudentName, { color: theme.text }]}>{activeStudent?.prenom}</Text>
            </View>

            <View style={[styles.generalBadge, { backgroundColor: `${genAvgColor}18` }]}>
              <Text style={[styles.generalAvgValue, { color: genAvgColor }]}>
                {grades.moyenneGenerale}
              </Text>
              <Text style={styles.generalAvgSur}>/20</Text>
            </View>
          </View>

          {grades.moyenneClasse && (
            <View style={[styles.classComparison, { borderTopColor: theme.border }]}>
              <TrendingUp size={14} color={theme.textMuted} />
              <Text style={[styles.classComparisonText, { color: theme.textSecondary }]}>
                Moyenne de classe : <Text style={[styles.boldText, { color: theme.text }]}>{grades.moyenneClasse}/20</Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* View mode toggle */}
      {!isFamilyView && subjectsList.length > 0 && (
        <View style={[styles.toggleRow, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "subjects" && [styles.toggleBtnActive, { backgroundColor: theme.card }],
            ]}
            onPress={() => handleViewMode("subjects")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: theme.textSecondary },
                viewMode === "subjects" && [styles.toggleTextActive, { color: theme.text }],
              ]}
            >
              Par matière ({subjectsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "timeline" && [styles.toggleBtnActive, { backgroundColor: theme.card }],
            ]}
            onPress={() => handleViewMode("timeline")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: theme.textSecondary },
                viewMode === "timeline" && [styles.toggleTextActive, { color: theme.text }],
              ]}
            >
              Chronologique ({notesList.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content depending on view mode */}
      {viewMode === "subjects" && !isFamilyView ? (
        subjectsList.map((sub, sIdx) => {
          const subjectTheme = getSubjectTheme(sub.discipline, sub.codeMatiere);
          const isExpanded = expandedSubjects[sub.codeMatiere] ?? true;
          const subAvgColor = getGradeColor(sub.moyenne || "12", "20");
          const subNotes = sub.notes || [];

          return (
            <View
              key={`subj-${sub.codeMatiere || "m"}-${sub.discipline || sIdx}-${sIdx}`}
              style={[styles.subjectBlock, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              {/* Subject Accordion Header */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleToggleSubject(sub.codeMatiere)}
                style={styles.subjectHeader}
              >
                <View style={[styles.subjectIconWrap, { backgroundColor: subjectTheme.badgeBg }]}>
                  <Text style={styles.subjectEmoji}>{subjectTheme.emoji}</Text>
                </View>

                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectTitle, { color: theme.text }]}>{sub.discipline}</Text>
                  {sub.moyenneClasse && (
                    <Text style={[styles.subjectClasseAvg, { color: theme.textSecondary }]}>
                      Classe: {sub.moyenneClasse}/20
                    </Text>
                  )}
                </View>

                {sub.moyenne && (
                  <View style={[styles.subAvgBadge, { backgroundColor: `${subAvgColor}15` }]}>
                    <Text style={[styles.subAvgText, { color: subAvgColor }]}>
                      {sub.moyenne}
                    </Text>
                    <Text style={styles.subAvgTotal}>/20</Text>
                  </View>
                )}

                <View style={styles.chevronWrap}>
                  {isExpanded ? (
                    <ChevronUp size={18} color={theme.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={theme.textMuted} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Grades list for this subject */}
              {isExpanded && (
                <View style={[styles.gradesList, { borderTopColor: theme.border }]}>
                  {subNotes.map((grade, gIdx) => (
                    <GradeCard
                      key={`sub-grade-${grade.studentId || 0}-${grade.id || gIdx}-${gIdx}`}
                      grade={grade}
                      showSubjectPill={false}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })
      ) : (
        /* Timeline View */
        notesList.map((grade, gIdx) => (
          <GradeCard
            key={`timeline-grade-${grade.studentId || 0}-${grade.id || gIdx}-${gIdx}`}
            grade={grade}
            showSubjectPill={true}
            showStudentBadge={isFamilyView}
          />
        ))
      )}

      {notesList.length === 0 && (
        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune note enregistrée</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Les nouvelles notes apparaîtront ici dès leur publication par les professeurs.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  generalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  generalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  generalIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  generalTitles: {
    flex: 1,
  },
  generalLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  generalStudentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  generalBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  generalAvgValue: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  generalAvgSur: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    marginLeft: 2,
  },
  classComparison: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
  },
  classComparisonText: {
    fontSize: 12,
    color: "#64748B",
  },
  boldText: {
    fontWeight: "700",
    color: "#1E293B",
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  toggleTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },
  subjectBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subjectEmoji: {
    fontSize: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  subjectClasseAvg: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  subAvgBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  subAvgText: {
    fontSize: 16,
    fontWeight: "800",
  },
  subAvgTotal: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    marginLeft: 2,
  },
  chevronWrap: {
    padding: 4,
  },
  gradesList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#F8FAFC",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
});
