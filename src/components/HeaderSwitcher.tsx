import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Check, ChevronDown, Plus, Users, X } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { StudentAvatar } from "./StudentAvatar";

interface Props {
  onOpenAccounts: () => void;
}

export const HeaderSwitcher: React.FC<Props> = ({ onOpenAccounts }) => {
  const { allStudents, activeStudent, isFamilyView, switchStudent, theme, activeToken } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleSelect = (id: number | "family") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchStudent(id);
    setModalVisible(false);
  };

  return (
    <>
      {/* Floating Header Chip style Papillon */}
      <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpen}
          style={[styles.chipButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          {isFamilyView ? (
            <View style={[styles.avatar, styles.avatarFamily]}>
              <Users size={16} color="#6366F1" />
            </View>
          ) : activeStudent ? (
            <View style={{ marginRight: 10 }}>
              <StudentAvatar student={activeStudent} token={activeToken} size={34} />
            </View>
          ) : (
            <View style={[styles.avatar, styles.avatarStudent]}>
              <Text style={styles.avatarInitial}>E</Text>
            </View>
          )}

          <View style={styles.chipTextContainer}>
            <Text style={[styles.chipTitle, { color: theme.text }]} numberOfLines={1}>
              {isFamilyView ? "Vue Famille" : `${activeStudent?.prenom} ${activeStudent?.nom}`}
            </Text>
            <Text style={[styles.chipSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {isFamilyView
                ? `${allStudents.length} enfants réunis`
                : `${activeStudent?.classe?.libelle || "Élève"} • ${activeStudent?.nomEtablissement}`}
            </Text>
          </View>

          <View style={styles.chevronWrap}>
            <ChevronDown size={16} color={theme.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal / Action Sheet Sélecteur */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Changer de profil</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: theme.surface }]}
              >
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>VOS ENFANTS</Text>

            {/* Liste des élèves */}
            {allStudents.map((student, idx) => {
              const isSelected = !isFamilyView && activeStudent?.id === student.id;
              return (
                <TouchableOpacity
                  key={`switcher-student-${student.accountIdentifiant || "acc"}-${student.id}-${idx}`}
                  style={[
                    styles.studentItem,
                    {
                      backgroundColor: isSelected
                        ? (theme.isDark ? "rgba(59,130,246,0.2)" : "#EFF6FF")
                        : theme.surface,
                      borderColor: isSelected ? theme.primary : "transparent",
                      borderWidth: isSelected ? 1 : 0,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(student.id)}
                >
                  <View style={{ marginRight: 12 }}>
                    <StudentAvatar
                      student={student}
                      token={activeToken}
                      size={44}
                      showBorder={isSelected}
                      borderColor={theme.primary}
                    />
                  </View>

                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: theme.text }]}>
                      {student.prenom} {student.nom}
                    </Text>
                    <Text style={[styles.studentDetails, { color: theme.textSecondary }]}>
                      {student.classe?.libelle || "Élève"} • {student.nomEtablissement}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Vue Famille */}
            <TouchableOpacity
              style={[
                styles.studentItem,
                {
                  backgroundColor: isFamilyView
                    ? (theme.isDark ? "rgba(99,102,241,0.2)" : "#EEF2FF")
                    : theme.surface,
                  borderColor: isFamilyView ? "#6366F1" : "transparent",
                  borderWidth: isFamilyView ? 1 : 0,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handleSelect("family")}
            >
              <View style={[styles.avatarLarge, styles.avatarFamily, { marginRight: 12 }]}>
                <Users size={22} color="#6366F1" />
              </View>

              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: theme.text }]}>Vue Famille (Globale)</Text>
                <Text style={[styles.studentDetails, { color: theme.textSecondary }]}>
                  {allStudents.length} élèves • Emplois du temps & cantine
                </Text>
              </View>

              {isFamilyView && (
                <View style={[styles.checkCircle, { backgroundColor: "#6366F1" }]}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Bouton Gérer les comptes */}
            <TouchableOpacity
              style={[styles.addAccountButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              activeOpacity={0.7}
              onPress={() => {
                setModalVisible(false);
                onOpenAccounts();
              }}
            >
              <Plus size={18} color={theme.primary} />
              <Text style={[styles.addAccountText, { color: theme.primary }]}>Gérer les comptes</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  chipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarStudent: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
  },
  avatarFamily: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1.5,
    borderColor: "#6366F1",
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },
  chipTextContainer: {
    flex: 1,
  },
  chipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  chipSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  chevronWrap: {
    marginLeft: 6,
    padding: 4,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  studentItemSelected: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLargeSelected: {
    backgroundColor: "#2563EB",
  },
  avatarLargeFamily: {
    backgroundColor: "#EEF2FF",
  },
  avatarLargeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  studentDetails: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  addAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addAccountText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },
});
