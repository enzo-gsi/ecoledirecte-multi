import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
} from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { TimetableCard } from "../components/TimetableCard";
import { StudentAvatar } from "../components/StudentAvatar";

export const TimetableScreen: React.FC = () => {
  const { timetable, refreshing, refreshData, isFamilyView, allStudents, theme, activeToken } = useApp();

  const [selectedChildId, setSelectedChildId] = useState<number | "all">("all");
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Calcul dynamique des jours de la semaine (Lundi à Samedi)
  // Le week-end (samedi/dimanche), la semaine affichée par défaut est la semaine à venir
  const days = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Dimanche, 6 = Samedi
    const daysToUpcomingMonday =
      currentDay === 0 ? 1 : currentDay === 6 ? 2 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToUpcomingMonday + weekOffset * 7);

    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const monthNames = [
      "janv.", "févr.", "mars", "avr.", "mai", "juin",
      "juil.", "août", "sept.", "oct.", "nov.", "déc."
    ];

    return labels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return {
        label,
        date: `${yyyy}-${mm}-${dd}`,
        dayNum: String(d.getDate()),
        monthName: monthNames[d.getMonth()],
        isToday:
          d.toISOString().split("T")[0] === new Date().toISOString().split("T")[0],
      };
    });
  }, [weekOffset]);

  // Filtrer les cours par enfant sélectionné en vue Famille
  const coursesForSelectedChild = useMemo(() => {
    if (!isFamilyView || selectedChildId === "all") return timetable;
    return timetable.filter((c) => c.studentId === selectedChildId);
  }, [timetable, isFamilyView, selectedChildId]);

  // Nombre de cours par jour pour la semaine affichée
  const coursesPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of days) {
      counts[d.date] = coursesForSelectedChild.filter(
        (c) => c.start_date && c.start_date.startsWith(d.date)
      ).length;
    }
    return counts;
  }, [days, coursesForSelectedChild]);

  // Sélection du jour par défaut : premier jour avec des cours, ou aujourd'hui si présent, sinon index 0
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayIdx = days.findIndex((d) => d.date === todayStr);
    if (todayIdx >= 0 && (coursesPerDay[days[todayIdx].date] || 0) > 0) {
      return todayIdx;
    }
    const firstActiveIdx = days.findIndex((d) => (coursesPerDay[d.date] || 0) > 0);
    return firstActiveIdx >= 0 ? firstActiveIdx : 0;
  });

  // Auto-ajuster si le jour sélectionné n'a aucun cours mais qu'un autre jour en a
  React.useEffect(() => {
    const currentDayDate = days[selectedDayIndex]?.date;
    const currentCount = currentDayDate ? (coursesPerDay[currentDayDate] || 0) : 0;
    if (currentCount === 0) {
      const firstActiveIdx = days.findIndex((d) => (coursesPerDay[d.date] || 0) > 0);
      if (firstActiveIdx >= 0 && firstActiveIdx !== selectedDayIndex) {
        setSelectedDayIndex(firstActiveIdx);
      }
    }
  }, [coursesPerDay, days]);

  const handleSelectDay = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDayIndex(idx);
  };

  const handlePrevWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeekOffset((prev) => prev - 1);
    setSelectedDayIndex(0);
  };

  const handleNextWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeekOffset((prev) => prev + 1);
    setSelectedDayIndex(0);
  };

  const handleResetCurrentWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWeekOffset(0);
    const todayStr = new Date().toISOString().split("T")[0];
    const idx = days.findIndex((d) => d.date === todayStr);
    setSelectedDayIndex(idx >= 0 ? idx : 0);
  };

  // Trouver la semaine qui a des cours si la semaine actuelle est vide
  const totalCoursesThisWeek = useMemo(() => {
    return Object.values(coursesPerDay).reduce((a, b) => a + b, 0);
  }, [coursesPerDay]);

  const handleJumpToCoursesWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timetable.length === 0) return;
    const firstCourseDate = timetable[0]?.start_date?.split(" ")[0] || timetable[0]?.start_date?.split("T")[0];
    if (!firstCourseDate) return;

    try {
      const targetDate = new Date(firstCourseDate);
      const now = new Date();
      const currentDay = now.getDay();
      const daysToUpcomingMonday =
        currentDay === 0 ? 1 : currentDay === 6 ? 2 : 1 - currentDay;
      const baseMonday = new Date(now);
      baseMonday.setDate(now.getDate() + daysToUpcomingMonday);

      const diffDays = Math.round(
        (targetDate.getTime() - baseMonday.getTime()) / (1000 * 60 * 60 * 24)
      );
      const targetOffset = Math.floor(diffDays / 7);
      setWeekOffset(targetOffset);
      setSelectedDayIndex(0);
    } catch {}
  };

  const currentSelectedDate = days[selectedDayIndex]?.date;
  const filteredCourses = coursesForSelectedChild.filter((item) => {
    if (!item.start_date) return true;
    return item.start_date.startsWith(currentSelectedDate);
  });

  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={theme.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Emploi du temps</Text>
            <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
              Du {firstDay.dayNum} {firstDay.monthName} au {lastDay.dayNum} {lastDay.monthName} (
              {weekOffset === 0
                ? "Semaine en cours"
                : weekOffset > 0
                ? `Semaine +${weekOffset}`
                : `Semaine ${weekOffset}`}
              )
            </Text>
          </View>

          {/* Week Navigation Arrows */}
          <View style={styles.weekNav}>
            <TouchableOpacity
              onPress={handlePrevWeek}
              style={[styles.navBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color={theme.text} />
            </TouchableOpacity>

            {weekOffset !== 0 && (
              <TouchableOpacity
                onPress={handleResetCurrentWeek}
                style={[styles.todayBtn, { backgroundColor: theme.primaryBadgeBg, borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.todayBtnText, { color: theme.primary }]}>Courante</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNextWeek}
              style={[styles.navBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Alternance Enfants en vue Famille */}
      {isFamilyView && allStudents.length > 1 && (
        <View style={styles.childTabsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedChildId("all");
            }}
            style={[
              styles.childTabBtn,
              {
                backgroundColor: selectedChildId === "all" ? theme.primary : theme.card,
                borderColor: selectedChildId === "all" ? theme.primary : theme.border,
              },
            ]}
          >
            <Users size={14} color={selectedChildId === "all" ? "#FFFFFF" : theme.textSecondary} />
            <Text
              style={[
                styles.childTabText,
                { color: selectedChildId === "all" ? "#FFFFFF" : theme.text },
              ]}
            >
              Tous les enfants
            </Text>
          </TouchableOpacity>

          {allStudents.map((s, idx) => {
            const isChildActive = selectedChildId === s.id;
            return (
              <TouchableOpacity
                key={`tt-child-${s.accountIdentifiant || "acc"}-${s.id}-${idx}`}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedChildId(s.id);
                }}
                style={[
                  styles.childTabBtn,
                  {
                    backgroundColor: isChildActive ? theme.primary : theme.card,
                    borderColor: isChildActive ? theme.primary : theme.border,
                  },
                ]}
              >
                <StudentAvatar student={s} token={activeToken} size={20} />
                <Text
                  style={[
                    styles.childTabText,
                    { color: isChildActive ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {s.prenom}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Horizontal Day Selector Pills */}
      <View style={[styles.daysRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {days.map((d, index) => {
          const isSelected = selectedDayIndex === index;
          const count = coursesPerDay[d.date] || 0;
          return (
            <TouchableOpacity
              key={d.date}
              activeOpacity={0.7}
              onPress={() => handleSelectDay(index)}
              style={[
                styles.dayPill,
                isSelected && { backgroundColor: theme.primary },
                d.isToday && !isSelected && { backgroundColor: theme.surface },
              ]}
            >
              <Text style={[styles.dayLabel, { color: theme.textMuted }, isSelected && { color: "#FFFFFF" }]}>
                {d.label}
              </Text>
              <Text style={[styles.dayNum, { color: theme.text }, isSelected && { color: "#FFFFFF" }]}>
                {d.dayNum}
              </Text>
              {count > 0 ? (
                <View style={[styles.countBadge, isSelected && { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                  <Text style={[styles.countBadgeText, isSelected && { color: "#FFFFFF" }]}>
                    {count}
                  </Text>
                </View>
              ) : (
                d.isToday && <View style={[styles.todayDot, { backgroundColor: theme.primary }, isSelected && { backgroundColor: "#FFFFFF" }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Course stats for selected day */}
      <View style={styles.daySummaryRow}>
        <Clock size={14} color={theme.textMuted} />
        <Text style={[styles.daySummaryText, { color: theme.textSecondary }]}>
          {filteredCourses.length === 0
            ? "Aucun cours programmé ce jour"
            : `${filteredCourses.length} cours prévu${filteredCourses.length > 1 ? "s" : ""} ce jour`}
        </Text>
      </View>

      {/* Banner if this week is empty but courses exist in other weeks */}
      {totalCoursesThisWeek === 0 && timetable.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleJumpToCoursesWeek}
          style={[styles.jumpBanner, { backgroundColor: theme.primaryBadgeBg, borderColor: theme.border }]}
        >
          <CalendarIcon size={18} color={theme.primary} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.jumpBannerTitle, { color: theme.primary }]}>
              {timetable.length} cours enregistrés au total
            </Text>
            <Text style={[styles.jumpBannerSubtitle, { color: theme.textSecondary }]}>
              Appuyez pour accéder directement à la semaine avec des cours
            </Text>
          </View>
          <ChevronRight size={16} color={theme.primary} />
        </TouchableOpacity>
      )}

      {/* Courses for the day */}
      <View style={styles.coursesList}>
        {filteredCourses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <CalendarIcon size={38} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Pas de cours ce jour</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Aucun créneau d'enseignement n'est programmé pour le {days[selectedDayIndex]?.label}{" "}
              {days[selectedDayIndex]?.dayNum} {days[selectedDayIndex]?.monthName}.
            </Text>
          </View>
        ) : (
          filteredCourses.map((item, idx) => (
            <TimetableCard
              key={`tt-${item.studentId || 0}-${item.id || idx}-${idx}`}
              item={item}
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 3,
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  dayPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 14,
    position: "relative",
  },
  dayPillSelected: {
    backgroundColor: "#2563EB",
  },
  dayPillToday: {
    backgroundColor: "#F1F5F9",
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  dayLabelSelected: {
    color: "#BFDBFE",
  },
  dayNum: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 2,
  },
  dayNumSelected: {
    color: "#FFFFFF",
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2563EB",
    marginTop: 3,
  },
  todayDotSelected: {
    backgroundColor: "#FFFFFF",
  },
  daySummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  daySummaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  coursesList: {
    gap: 4,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  countBadge: {
    marginTop: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeSelected: {
    backgroundColor: "#1D4ED8",
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },
  countBadgeTextSelected: {
    color: "#FFFFFF",
  },
  jumpBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  jumpBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
  },
  jumpBannerSubtitle: {
    fontSize: 11,
    color: "#3B82F6",
    marginTop: 2,
  },
  childTabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  childTabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  childTabText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
