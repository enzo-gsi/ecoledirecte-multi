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
import { CheckCircle2, Circle } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { HomeworkCard } from "../components/HomeworkCard";
import { HomeworkItem } from "../types";

export const HomeworkScreen: React.FC = () => {
  const { homework, refreshing, refreshData, toggleHomework, isFamilyView, theme } = useApp();
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const handleFilter = (f: "all" | "pending" | "done") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(f);
  };

  const filteredHomework = homework.filter((item) => {
    if (filter === "pending") return !item.aFaire.effectue;
    if (filter === "done") return !!item.aFaire.effectue;
    return true;
  });

  const totalCount = homework.length;
  const doneCount = homework.filter((h) => h.aFaire.effectue).length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Group by date
  const grouped: Record<string, HomeworkItem[]> = {};
  for (const item of filteredHomework) {
    if (!grouped[item.date]) {
      grouped[item.date] = [];
    }
    grouped[item.date].push(item);
  }

  const formatSectionHeader = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === tomorrow) return "Pour demain";

    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={theme.primary} />
      }
    >
      {/* Title & Progress */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Cahier de texte</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          {totalCount === 0
            ? "Aucun devoir à afficher"
            : `${doneCount} sur ${totalCount} devoirs terminés (${progressPercent}%)`}
        </Text>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.success }]} />
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[
            styles.filterPill,
            { backgroundColor: theme.card, borderColor: theme.border },
            filter === "all" && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
          onPress={() => handleFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              { color: theme.textSecondary },
              filter === "all" && styles.filterTextActive,
            ]}
          >
            Tous ({totalCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            { backgroundColor: theme.card, borderColor: theme.border },
            filter === "pending" && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
          onPress={() => handleFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              { color: theme.textSecondary },
              filter === "pending" && styles.filterTextActive,
            ]}
          >
            À faire ({totalCount - doneCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            { backgroundColor: theme.card, borderColor: theme.border },
            filter === "done" && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
          onPress={() => handleFilter("done")}
        >
          <Text
            style={[
              styles.filterText,
              { color: theme.textSecondary },
              filter === "done" && styles.filterTextActive,
            ]}
          >
            Terminés ({doneCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grouped lists */}
      {Object.keys(grouped).length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Tout est fait !</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {filter === "done"
              ? "Aucun devoir terminé pour le moment."
              : "Aucun devoir ne correspond à ce filtre."}
          </Text>
        </View>
      ) : (
        Object.keys(grouped).map((date) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={[styles.dateGroupTitle, { color: theme.textMuted }]}>{formatSectionHeader(date)}</Text>
            {grouped[date].map((item, idx) => (
              <HomeworkCard
                key={`hw-${item.studentId || 0}-${item.id || idx}-${idx}`}
                item={item}
                onToggle={toggleHomework}
                showStudentBadge={isFamilyView}
              />
            ))}
          </View>
        ))
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
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateGroupTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
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
