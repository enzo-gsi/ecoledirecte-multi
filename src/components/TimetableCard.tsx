import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MapPin, User as UserIcon } from "lucide-react-native";
import { TimetableItem } from "../types";
import { getSubjectTheme } from "../services/subjectColors";
import { useApp } from "../context/AppContext";

interface Props {
  item: TimetableItem;
  showStudentBadge?: boolean;
}

export const TimetableCard: React.FC<Props> = ({ item, showStudentBadge = false }) => {
  const { theme: appTheme } = useApp();
  const theme = getSubjectTheme(item.matiere, item.codeMatiere);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split(" ");
    if (parts.length > 1) {
      return parts[1].substring(0, 5);
    }
    return dateStr;
  };

  const startTime = formatTime(item.start_date);
  const endTime = formatTime(item.end_date);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: appTheme.card, borderColor: appTheme.border },
        item.is_annule && (appTheme.isDark ? { backgroundColor: "rgba(239, 68, 68, 0.15)" } : styles.cardAnnule),
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: item.is_annule ? "#EF4444" : theme.color }]} />

      <View style={styles.cardContent}>
        {/* Top: Time and Student Badge */}
        <View style={styles.topRow}>
          <Text style={[styles.timeText, { color: appTheme.textMuted }, item.is_annule && styles.timeAnnule]}>
            {startTime} — {endTime}
          </Text>

          {showStudentBadge && item.studentName && (
            <View style={styles.studentBadge}>
              <Text style={styles.studentBadgeText}>{item.studentName}</Text>
            </View>
          )}

          {item.is_annule && (
            <View style={styles.annuleBadge}>
              <Text style={styles.annuleBadgeText}>COURS ANNULÉ</Text>
            </View>
          )}

          {item.is_modifie && !item.is_annule && (
            <View style={styles.modifieBadge}>
              <Text style={styles.modifieBadgeText}>MODIFIÉ</Text>
            </View>
          )}
        </View>

        {/* Subject Title */}
        <Text style={[styles.subjectTitle, { color: appTheme.text }, item.is_annule && styles.subjectAnnule]}>
          {theme.emoji} {item.matiere}
        </Text>

        {/* Details: Room and Teacher */}
        <View style={styles.detailsRow}>
          {item.salle ? (
            <View style={styles.detailItem}>
              <MapPin size={13} color={appTheme.textMuted} />
              <Text style={[styles.detailText, { color: appTheme.textSecondary }]}>{item.salle}</Text>
            </View>
          ) : null}

          {item.prof ? (
            <View style={styles.detailItem}>
              <UserIcon size={13} color={appTheme.textMuted} />
              <Text style={[styles.detailText, { color: appTheme.textSecondary }]}>{item.prof}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardAnnule: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
    opacity: 0.85,
  },
  accentBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  timeAnnule: {
    textDecorationLine: "line-through",
    color: "#EF4444",
  },
  studentBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  studentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4338CA",
  },
  annuleBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: "auto",
  },
  annuleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  modifieBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: "auto",
  },
  modifieBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subjectAnnule: {
    color: "#991B1B",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});
