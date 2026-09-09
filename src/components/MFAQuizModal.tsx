import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ShieldCheck, X } from "lucide-react-native";
import { useApp } from "../context/AppContext";

export const MFAQuizModal: React.FC = () => {
  const { mfaChallenge, submitMFA, cancelMFA } = useApp();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!mfaChallenge) return null;

  const propositions = mfaChallenge.propositions || [];

  const handleSelect = (choice: string) => {
    setSelectedChoice(choice);
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirm = async () => {
    if (!selectedChoice) return;
    setSubmitting(true);
    setErrorMessage(null);

    const res = await submitMFA(selectedChoice);
    setSubmitting(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(res.error || "Réponse incorrecte, veuillez réessayer.");
    }
  };

  return (
    <Modal visible={!!mfaChallenge} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header fixe */}
          <View style={styles.header}>
            <View style={styles.shieldWrap}>
              <ShieldCheck size={22} color="#2563EB" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Sécurité ÉcoleDirecte</Text>
              <Text style={styles.subtitleHeader}>Double authentification</Text>
            </View>
            <TouchableOpacity onPress={cancelMFA} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Corps défilable (Question + Liste des propositions) */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <Text style={styles.subtitle}>
              Sélectionnez la réponse correspondant à votre situation pour autoriser cet iPhone.
            </Text>

            {/* Question Box */}
            <View style={styles.questionBox}>
              <Text style={styles.questionLabel}>QUESTION DE SÉCURITÉ :</Text>
              <Text style={styles.questionText}>
                {mfaChallenge.question || "Veuillez répondre à la question suivante :"}
              </Text>
            </View>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <Text style={styles.choicesLabel}>
              PROPOSITIONS ({propositions.length}) :
            </Text>

            {/* Propositions */}
            <View style={styles.propositionsList}>
              {propositions.map((prop, idx) => {
                const isSelected = selectedChoice === prop;
                return (
                  <TouchableOpacity
                    key={`mfa-prop-${idx}-${prop.substring(0, 10)}`}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(prop)}
                    style={[styles.propItem, isSelected && styles.propItemSelected]}
                  >
                    <View
                      style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text
                      style={[styles.propText, isSelected && styles.propTextSelected]}
                    >
                      {prop}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer FIXE avec bouton de validation toujours visible */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              disabled={!selectedChoice || submitting}
              style={[
                styles.confirmButton,
                (!selectedChoice || submitting) && styles.confirmButtonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText} numberOfLines={1}>
                  {selectedChoice
                    ? `Valider : ${selectedChoice}`
                    : "Sélectionnez une réponse ci-dessus"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    height: "82%", // Hauteur fixe explicite pour permettre à flex: 1 de fonctionner sur le ScrollView
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  shieldWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subtitleHeader: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  questionBox: {
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 14,
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  choicesLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  propositionsList: {
    gap: 8,
  },
  propItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  propItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: "#2563EB",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },
  propText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  propTextSelected: {
    color: "#1E40AF",
    fontWeight: "800",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  confirmButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
