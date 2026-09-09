import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  Mail,
  Sparkles,
  Utensils,
} from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { HomeworkCard } from "../components/HomeworkCard";
import { GradeCard } from "../components/GradeCard";
import { TimetableCard } from "../components/TimetableCard";
import { StudentAvatar } from "../components/StudentAvatar";

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const HomeScreen: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    activeStudent,
    isFamilyView,
    allStudents,
    homework,
    grades,
    timetable,
    messages,
    cantineWallets,
    refreshing,
    refreshData,
    toggleHomework,
    theme,
    activeToken,
  } = useApp();

  const pendingHomework = homework.filter((h) => !h.aFaire.effectue);
  const recentGrades = (grades?.notes || []).slice(0, 3);
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingCourses = (timetable || []).filter((c) => {
    if (!c.start_date) return false;
    return c.start_date >= todayStr;
  });
  const nextCourses = (upcomingCourses.length > 0 ? upcomingCourses : timetable || []).slice(0, 2);
  const unreadMessages = messages.filter((m) => !m.lu);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={theme.primary} />
      }
    >
      {/* Welcome Card */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={[styles.welcomeBadge, { backgroundColor: theme.primaryBadgeBg }]}>
              <Sparkles size={12} color={theme.primary} />
              <Text style={[styles.welcomeBadgeText, { color: theme.primary }]}>
                {isFamilyView ? "ESPACE PARENT FAMILLE" : "TABLEAU DE BORD ÉLÈVE"}
              </Text>
            </View>

            <Text style={[styles.welcomeTitle, { color: theme.text }]}>
              {isFamilyView
                ? "Tous vos enfants réunis"
                : `Bienvenue, ${activeStudent?.prenom || "Élève"}`}
            </Text>

            <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
              {isFamilyView
                ? `${allStudents.map((s) => s.prenom).join(" & ")}${allStudents.length > 0 ? " • " : ""}${allStudents[0]?.nomEtablissement || "Établissement"}`
                : `${activeStudent?.classe?.libelle || ""} • ${activeStudent?.nomEtablissement || ""}`}
            </Text>
          </View>

          {/* Avatars */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {isFamilyView ? (
              allStudents.slice(0, 3).map((student, idx) => (
                <View key={`avatar-${student.id}-${idx}`} style={{ marginLeft: idx > 0 ? -12 : 0 }}>
                  <StudentAvatar student={student} token={activeToken} size={44} />
                </View>
              ))
            ) : (
              activeStudent && <StudentAvatar student={activeStudent} token={activeToken} size={48} />
            )}
          </View>
        </View>

        {/* Quick summary metrics */}
        <View style={[styles.metricsRow, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={styles.metricItem}
            activeOpacity={0.7}
            onPress={() => onNavigateTab("homework")}
          >
            <Text style={[styles.metricNumber, { color: theme.text }]}>{pendingHomework.length}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Devoirs à faire</Text>
          </TouchableOpacity>

          <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.metricItem}
            activeOpacity={0.7}
            onPress={() => onNavigateTab("grades")}
          >
            <Text style={[styles.metricNumber, { color: theme.text }]}>
              {grades?.moyenneGenerale ? `${grades.moyenneGenerale}/20` : `${recentGrades.length}`}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              {grades?.moyenneGenerale ? "Moyenne" : "Notes"}
            </Text>
          </TouchableOpacity>

          <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.metricItem}
            activeOpacity={0.7}
            onPress={() => onNavigateTab("messages")}
          >
            <Text
              style={[
                styles.metricNumber,
                { color: theme.text },
                unreadMessages.length > 0 && { color: theme.primary },
              ]}
            >
              {unreadMessages.length}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Nvx messages</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Raccourci Carte Cantine & Porte-monnaie */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigateTab("finance")}
        style={[styles.cantineBanner, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <View style={[styles.cantineBannerIcon, { backgroundColor: theme.primaryBadgeBg }]}>
          <Utensils size={20} color={theme.primary} />
        </View>
        <View style={styles.cantineBannerText}>
          <Text style={[styles.cantineBannerTitle, { color: theme.text }]}>Restauration & Cantine</Text>
          <Text style={[styles.cantineBannerDesc, { color: theme.textSecondary }]}>
            {isFamilyView
              ? allStudents.map((s) => `${s.prenom}: ${cantineWallets[s.id]?.solde || "0 €"}`).join(" • ")
              : `Solde disponible : ${cantineWallets[activeStudent?.id || 0]?.solde || "0,00 €"}`}
          </Text>
        </View>
        <ChevronRight size={18} color={theme.textMuted} />
      </TouchableOpacity>

      {/* Prochains cours & Planning */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Planning des cours</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigateTab("timetable")}
            style={styles.seeAllBtn}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>Semaine complète</Text>
            <ChevronRight size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {nextCourses.length === 0 ? (
          <TouchableOpacity
            style={[styles.emptyTimetableCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.7}
            onPress={() => onNavigateTab("timetable")}
          >
            <View style={[styles.emptyTimetableIcon, { backgroundColor: theme.primaryBadgeBg }]}>
              <Calendar size={22} color={theme.primary} />
            </View>
            <View style={styles.emptyTimetableText}>
              <Text style={[styles.emptyTimetableTitle, { color: theme.text }]}>Consulter l'emploi du temps</Text>
              <Text style={[styles.emptyTimetableSubtitle, { color: theme.textSecondary }]}>
                Voir les salles, horaires et professeurs pour toute la semaine
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>
        ) : (
          nextCourses.map((item, idx) => (
            <TimetableCard
              key={`home-tt-${item.studentId || 0}-${item.id || idx}-${idx}`}
              item={item}
              showStudentBadge={isFamilyView}
            />
          ))
        )}
      </View>

      {/* Devoirs à faire en priorité */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <BookOpen size={18} color="#E11D48" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Devoirs à rendre</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigateTab("homework")}
            style={styles.seeAllBtn}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>Tout voir ({pendingHomework.length})</Text>
            <ChevronRight size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {pendingHomework.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>Aucun devoir en attente !</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Tout est à jour pour le moment.</Text>
          </View>
        ) : (
          pendingHomework
            .slice(0, 3)
            .map((item, idx) => (
              <HomeworkCard
                key={`home-hw-${item.studentId || 0}-${item.id || idx}-${idx}`}
                item={item}
                onToggle={toggleHomework}
                showStudentBadge={isFamilyView}
              />
            ))
        )}
      </View>

      {/* Dernières notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <GraduationCap size={18} color="#059669" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Dernières notes</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigateTab("grades")}
            style={styles.seeAllBtn}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>Bulletin</Text>
            <ChevronRight size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {recentGrades.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>Aucune note récente enregistrée</Text>
          </View>
        ) : (
          recentGrades.map((grade, idx) => (
            <GradeCard
              key={`home-grade-${grade.studentId || 0}-${grade.id || idx}-${idx}`}
              grade={grade}
              showStudentBadge={isFamilyView}
            />
          ))
        )}
      </View>
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
    paddingBottom: 30,
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    gap: 5,
  },
  welcomeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  metricAlert: {
    color: "#2563EB",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  cantineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cantineBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cantineBannerText: {
    flex: 1,
  },
  cantineBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  cantineBannerDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  emptyTimetableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  emptyTimetableIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTimetableText: {
    flex: 1,
  },
  emptyTimetableTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyTimetableSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});
