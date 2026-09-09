import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Building2,
  Lock,
  Moon,
  Plus,
  QrCode,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
} from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { StudentAvatar } from "../components/StudentAvatar";

export const AccountsScreen: React.FC = () => {
  const {
    accounts,
    addAccount,
    removeAccount,
    isDarkMode,
    toggleDarkMode,
    theme,
    activeToken,
  } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddAccount = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Veuillez saisir votre identifiant et mot de passe.");
      return;
    }

    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const res = await addAccount(username.trim(), password.trim());
    setLoading(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUsername("");
      setPassword("");
      Alert.alert("Compte ajouté !", "Le compte ÉcoleDirecte a été connecté avec succès.");
    } else if (res.mfa) {
      // MFA Quiz modal will pop up automatically via AppContext
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(res.error || "Impossible de se connecter.");
    }
  };

  const handleDelete = (identifiant: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Supprimer le compte",
      `Voulez-vous vraiment déconnecter le compte "${identifiant}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await removeAccount(identifiant);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Gestion des Comptes</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          Ajoutez autant d'écoles et de comptes ÉcoleDirecte que nécessaire.
        </Text>
      </View>

      {/* Préférences d'affichage (Mode Sombre) */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PRÉFÉRENCES D'AFFICHAGE</Text>
      <View style={[styles.accountCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.themeRow}>
          <View style={[styles.accountIcon, { backgroundColor: isDarkMode ? "rgba(167, 139, 250, 0.2)" : "#FEF3C7" }]}>
            {isDarkMode ? <Moon size={20} color="#A78BFA" /> : <Sun size={20} color="#D97706" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.etabName, { color: theme.text }]}>Mode sombre</Text>
            <Text style={[styles.accountUser, { color: theme.textSecondary }]}>
              {isDarkMode ? "Thème sombre activé" : "Thème clair actif"}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Comptes actuellement enregistrés */}
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>COMPTES ENREGISTRÉS ({accounts.length})</Text>

      {accounts.map((acc) => (
        <View key={acc.identifiant} style={[styles.accountCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.accountHeader}>
            <View style={[styles.accountIcon, { backgroundColor: theme.primaryBadgeBg }]}>
              <Building2 size={20} color={theme.primary} />
            </View>
            <View style={styles.accountText}>
              <Text style={[styles.etabName, { color: theme.text }]}>{acc.nomEtablissement}</Text>
              <Text style={[styles.accountUser, { color: theme.textSecondary }]}>
                Identifiant : <Text style={[styles.boldText, { color: theme.text }]}>{acc.identifiant}</Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleDelete(acc.identifiant, acc.nomEtablissement)}
              style={[styles.deleteButton, { backgroundColor: theme.isDark ? "rgba(239, 68, 68, 0.2)" : "#FEF2F2" }]}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Liste des enfants rattachés à ce compte */}
          <View style={[styles.studentsList, { borderTopColor: theme.border }]}>
            <Text style={[styles.studentsListTitle, { color: theme.textMuted }]}>ÉLÈVE(S) RATTACHÉ(S) :</Text>
            {acc.eleves?.map((student, sIdx) => (
              <View key={`acc-${acc.identifiant}-student-${student.id}-${sIdx}`} style={styles.studentRow}>
                <View style={{ marginRight: 10 }}>
                  <StudentAvatar student={student} token={acc.token || activeToken} size={28} />
                </View>
                <Text style={[styles.studentRowName, { color: theme.text }]}>
                  {student.prenom} {student.nom}
                </Text>
                <Text style={[styles.studentRowClass, { color: theme.textSecondary }]}>
                  ({student.classe?.libelle || "Classe non spécifiée"})
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Formulaire d'ajout d'un compte */}
      <View style={[styles.addCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.addCardHeader}>
          <View style={[styles.addIconWrap, { backgroundColor: theme.primaryBadgeBg }]}>
            <Plus size={18} color={theme.primary} />
          </View>
          <Text style={[styles.addCardTitle, { color: theme.text }]}>Connecter un nouveau compte</Text>
        </View>

        <Text style={[styles.addCardDesc, { color: theme.textSecondary }]}>
          Entrez les identifiants ÉcoleDirecte de l'établissement du second enfant.
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input Identifiant */}
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <User size={18} color={theme.textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Identifiant ÉcoleDirecte"
            placeholderTextColor={theme.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Input Mot de passe */}
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Mot de passe"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Security badge */}
        <View style={styles.securityRow}>
          <Shield size={14} color="#059669" />
          <Text style={styles.securityText}>
            Vos identifiants sont chiffrés et stockés uniquement sur cet appareil.
          </Text>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddAccount}
          disabled={loading}
          style={[
            styles.submitButton,
            { backgroundColor: theme.primary },
            loading && styles.submitButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Ajouter le compte</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* How to run on iPhone */}
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: theme.isDark ? "rgba(37, 99, 235, 0.12)" : "#EFF6FF",
            borderColor: theme.isDark ? "rgba(37, 99, 235, 0.3)" : "#BFDBFE",
          },
        ]}
      >
        <View style={styles.infoCardHeader}>
          <Smartphone size={20} color={theme.primary} />
          <Text style={[styles.infoCardTitle, { color: theme.isDark ? "#93C5FD" : "#1E40AF" }]}>
            Lancer sur votre iPhone
          </Text>
        </View>
        <Text style={[styles.infoStep, { color: theme.isDark ? "#BFDBFE" : "#1E3A8A" }]}>
          1. Téléchargez gratuitement l'application <Text style={[styles.boldText, { color: theme.text }]}>Expo Go</Text> depuis l'App Store d'Apple sur votre iPhone.
        </Text>
        <Text style={[styles.infoStep, { color: theme.isDark ? "#BFDBFE" : "#1E3A8A" }]}>
          2. Depuis votre terminal PC, tapez : <Text style={[styles.codeText, { backgroundColor: theme.isDark ? "rgba(37, 99, 235, 0.3)" : "#DBEAFE", color: theme.isDark ? "#93C5FD" : "#1E40AF" }]}>npx expo start</Text>
        </Text>
        <Text style={[styles.infoStep, { color: theme.isDark ? "#BFDBFE" : "#1E3A8A" }]}>
          3. Ouvrez l'appareil photo de votre iPhone et scannez le QR code affiché. L'application native s'ouvrira immédiatement !
        </Text>
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
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountText: {
    flex: 1,
  },
  etabName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  accountUser: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  boldText: {
    fontWeight: "700",
    color: "#1E293B",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  studentsList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
  },
  studentsListTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  studentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginRight: 8,
  },
  studentRowName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginRight: 6,
  },
  studentRowClass: {
    fontSize: 12,
    color: "#64748B",
  },

  // Add Card
  addCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  addCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  addIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  addCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  addCardDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 16,
  },
  errorBanner: {
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#0F172A",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E40AF",
  },
  infoStep: {
    fontSize: 13,
    color: "#1E3A8A",
    lineHeight: 20,
    marginBottom: 8,
  },
  codeText: {
    fontFamily: "monospace",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 4,
    borderRadius: 4,
    fontWeight: "700",
  },
});
