import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Mail, MailOpen, User, X, Clock, Users, GraduationCap } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { MessageItem } from "../types";

export const MessagesScreen: React.FC = () => {
  const { messages, refreshing, refreshData, isFamilyView, markMessageRead, fetchMessageContent, theme } = useApp();
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [loadingBody, setLoadingBody] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "parents" | "enfants">("all");

  const parentMessages = useMemo(() => {
    return messages.filter((m) => m.recipientType === "parent" || (!m.recipientType && !m.studentId));
  }, [messages]);

  const eleveMessages = useMemo(() => {
    return messages.filter((m) => m.recipientType === "eleve" || (!m.recipientType && !!m.studentId));
  }, [messages]);

  const displayedMessages = useMemo(() => {
    if (activeFilter === "parents") return parentMessages;
    if (activeFilter === "enfants") return eleveMessages;
    return messages;
  }, [activeFilter, parentMessages, eleveMessages, messages]);

  const handleOpenMessage = async (item: MessageItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markMessageRead(item.id);
    setSelectedMessage(item);

    if (!item.contenu) {
      setLoadingBody(true);
      try {
        const body = await fetchMessageContent(item.id, item.studentId, item.familyId, item.recipientType);
        setSelectedMessage((prev: MessageItem | null) =>
          prev && prev.id === item.id ? { ...prev, contenu: body } : prev
        );
      } finally {
        setLoadingBody(false);
      }
    }
  };

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
    <>
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
          <Text style={[styles.screenTitle, { color: theme.text }]}>Messagerie</Text>
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
            Communications des établissements et des professeurs
          </Text>
        </View>

        {/* Séparateur Filtre Parents / Enfants / Tous */}
        <View style={[styles.filterTabsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === "all" && { backgroundColor: theme.primary }]}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFilter("all");
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: activeFilter === "all" ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              Tous ({messages.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "parents" && { backgroundColor: theme.primary },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFilter("parents");
            }}
          >
            <Users
              size={13}
              color={activeFilter === "parents" ? "#FFFFFF" : theme.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterTabText,
                { color: activeFilter === "parents" ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              Parents ({parentMessages.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "enfants" && { backgroundColor: theme.primary },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveFilter("enfants");
            }}
          >
            <GraduationCap
              size={13}
              color={activeFilter === "enfants" ? "#FFFFFF" : theme.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterTabText,
                { color: activeFilter === "enfants" ? "#FFFFFF" : theme.textSecondary },
              ]}
            >
              Enfants ({eleveMessages.length})
            </Text>
          </TouchableOpacity>
        </View>

        {displayedMessages.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Mail size={36} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Boîte de réception vide</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {activeFilter === "parents"
                ? "Aucun message pour les parents."
                : activeFilter === "enfants"
                ? "Aucun message pour les enfants."
                : "Vous n'avez aucun message pour le moment."}
            </Text>
          </View>
        ) : (
          displayedMessages.map((item, idx) => (
            <TouchableOpacity
              key={`msg-${item.recipientType || "all"}-${item.id}-${idx}`}
              activeOpacity={0.7}
              onPress={() => handleOpenMessage(item)}
              style={[
                styles.messageCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                !item.lu && (theme.isDark ? { backgroundColor: "rgba(59, 130, 246, 0.12)", borderColor: theme.primary } : styles.messageCardUnread),
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, !item.lu && styles.iconWrapUnread]}>
                  {!item.lu ? (
                    <Mail size={18} color={theme.primary} />
                  ) : (
                    <MailOpen size={18} color={theme.textMuted} />
                  )}
                </View>

                <View style={styles.senderInfo}>
                  <Text
                    style={[styles.senderName, { color: theme.text }, !item.lu && { fontWeight: "800" }]}
                    numberOfLines={1}
                  >
                    {item.expediteur}
                  </Text>
                  <Text style={[styles.dateText, { color: theme.textMuted }]}>{formatDate(item.date)}</Text>
                </View>

                {/* Badge Destinataire : Parent ou Élève */}
                {item.recipientType === "parent" ? (
                  <View style={styles.parentBadge}>
                    <Users size={10} color="#1D4ED8" style={{ marginRight: 3 }} />
                    <Text style={styles.parentBadgeText}>Parents</Text>
                  </View>
                ) : (
                  <View style={styles.studentBadge}>
                    <GraduationCap size={10} color="#6D28D9" style={{ marginRight: 3 }} />
                    <Text style={styles.studentBadgeText}>
                      {item.studentName ? `Élève • ${item.studentName}` : "Élève"}
                    </Text>
                  </View>
                )}

                {!item.lu && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
              </View>

              <Text
                style={[styles.subjectText, { color: theme.text }, !item.lu && { fontWeight: "700" }]}
                numberOfLines={1}
              >
                {item.sujet}
              </Text>

              {item.contenu && (
                <Text style={[styles.snippetText, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.contenu}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Full Message Detail Modal */}
      <Modal
        visible={!!selectedMessage}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop layer behind the card */}
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={() => setSelectedMessage(null)}
          />

          {/* Modal Card rendered on top as a sibling */}
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIcon, { backgroundColor: theme.primaryBadgeBg }]}>
                <MailOpen size={20} color={theme.primary} />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalExpediteur, { color: theme.text }]}>{selectedMessage?.expediteur}</Text>
                <Text style={[styles.modalDate, { color: theme.textSecondary }]}>
                  <Clock size={11} color={theme.textMuted} /> {selectedMessage?.date}
                  {selectedMessage?.studentName ? ` • Pour ${selectedMessage.studentName}` : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedMessage(null)}
                style={[styles.closeBtn, { backgroundColor: theme.surface }]}
              >
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />

            <Text style={[styles.modalSubject, { color: theme.text }]}>{selectedMessage?.sujet}</Text>

            <ScrollView
              style={styles.modalScrollBody}
              contentContainerStyle={styles.modalScrollBodyContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {loadingBody ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Chargement du message...</Text>
                </View>
              ) : (
                <Text style={[styles.modalBodyText, { color: theme.text }]} selectable>
                  {selectedMessage?.contenu || "Aucun contenu disponible."}
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseBtnBottom, { backgroundColor: theme.primary }]}
              onPress={() => setSelectedMessage(null)}
            >
              <Text style={styles.modalCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  messageCard: {
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
  messageCardUnread: {
    backgroundColor: "#FFFFFF",
    borderColor: "#BFDBFE",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconWrapUnread: {
    backgroundColor: "#EFF6FF",
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  senderNameUnread: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  dateText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  filterTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  parentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  parentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  studentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  studentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6D28D9",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  subjectTextUnread: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  snippetText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginTop: 20,
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
  },

  // Modal Detail
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdropTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalExpediteur: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalDate: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  modalSubject: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    lineHeight: 24,
  },
  modalScrollBody: {
    flex: 1,
    marginVertical: 8,
  },
  modalScrollBodyContent: {
    paddingBottom: 24,
  },
  modalBodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },
  modalCloseBtnBottom: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  modalCloseBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});
