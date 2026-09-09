import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { HomeworkItem } from "../types";
import { getSubjectTheme } from "../services/subjectColors";
import { useApp } from "../context/AppContext";

interface Props {
  item: HomeworkItem;
  onToggle: (id: number) => void;
  showStudentBadge?: boolean;
}

export const HomeworkCard: React.FC<Props> = ({ item, onToggle, showStudentBadge = false }) => {
  const { theme: appTheme } = useApp();
  const [expanded, setExpanded] = useState(false);
  const isDone = !!item.aFaire.effectue;
  const theme = getSubjectTheme(item.matiere, item.codeMatiere);

  const handlePressCheckbox = () => {
    Haptics.notificationAsync(
      isDone
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    onToggle(item.id);
  };

  const handleToggleExpand = () => {
    Haptics.selectionAsync();
    setExpanded(!expanded);
  };

  // Format date: "Pour demain", "Pour aujourd'hui", or "Pour lun. 7 sept."
  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return "";
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (dateStr === todayStr) return "Pour aujourd'hui";
    if (dateStr === tomorrowStr) return "Pour demain";

    try {
      const d = new Date(dateStr);
      return `Pour ${d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })}`;
    } catch {
      return `Pour le ${dateStr}`;
    }
  };

  const contentText = item.aFaire.contenu || "Aucune consigne particulière spécifiée.";
  const isLong = contentText.length > 90 || contentText.includes("\n");

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleToggleExpand}
      style={[
        styles.card,
        { backgroundColor: appTheme.card, borderColor: appTheme.border },
        isDone && (appTheme.isDark ? { opacity: 0.6 } : styles.cardDone),
      ]}
    >
      <View style={styles.cardHeader}>
        {/* Subject Pill */}
        <View style={[styles.subjectPill, { backgroundColor: theme.badgeBg }]}>
          <Text style={styles.emojiText}>{theme.emoji}</Text>
          <Text style={[styles.subjectName, { color: theme.color }]} numberOfLines={1}>
            {item.matiere}
          </Text>
        </View>

        {/* Student Badge if in Family View */}
        {showStudentBadge && item.studentName && (
          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>{item.studentName}</Text>
          </View>
        )}

        {/* Due date tag */}
        <View style={[styles.dateTag, { backgroundColor: appTheme.surface }]}>
          <Text
            style={[
              styles.dateText,
              { color: appTheme.textSecondary },
              item.interrogation && styles.interroText,
            ]}
          >
            {item.interrogation ? "⚠️ Interro • " : ""}
            {formatDueDate(item.date)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {/* Text content */}
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text
            style={[
              styles.contentText,
              { color: appTheme.text },
              isDone && styles.contentDone,
            ]}
            numberOfLines={expanded ? undefined : 3}
          >
            {contentText}
          </Text>

          {isLong && (
            <View style={styles.expandRow}>
              <Text style={[styles.expandText, { color: appTheme.primary }]}>
                {expanded ? "Réduire" : "Voir tout le devoir"}
              </Text>
              {expanded ? (
                <ChevronUp size={14} color={appTheme.primary} />
              ) : (
                <ChevronDown size={14} color={appTheme.primary} />
              )}
            </View>
          )}
        </View>

        {/* Circular Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePressCheckbox}
          style={[
            styles.checkbox,
            isDone
              ? styles.checkboxChecked
              : [styles.checkboxUnchecked, { borderColor: appTheme.border }],
          ]}
        >
          {isDone && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDone: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  subjectPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  emojiText: {
    fontSize: 12,
    marginRight: 5,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  studentBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  studentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4338CA",
  },
  dateTag: {
    marginLeft: "auto",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  interroText: {
    color: "#DC2626",
    fontWeight: "700",
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  contentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#1E293B",
    marginRight: 14,
  },
  contentDone: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxUnchecked: {
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
  },
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
