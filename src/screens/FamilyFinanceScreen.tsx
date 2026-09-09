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
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Utensils,
  UserCheck,
} from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { StudentAvatar } from "../components/StudentAvatar";

export const FamilyFinanceScreen: React.FC = () => {
  const {
    cantineWallets,
    vieScolaire,
    allStudents,
    activeStudent,
    isFamilyView,
    refreshing,
    refreshData,
    theme,
    activeToken,
  } = useApp();

  const studentsToShow = isFamilyView
    ? allStudents
    : activeStudent
    ? [activeStudent]
    : allStudents;

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
        <Text style={[styles.screenTitle, { color: theme.text }]}>Cantine & Vie Scolaire</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
          Cartes de cantine, soldes et relevés de vie scolaire
        </Text>
      </View>

      {/* Cartes de Cantine Digitale */}
      <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>CARTE DE CANTINE & RESTAURATION</Text>

      {studentsToShow.map((student, sIdx) => {
        const wallet = cantineWallets[student.id];
        return (
          <View
            key={`cantine-${student.accountIdentifiant || "acc"}-${student.id}-${sIdx}`}
            style={[styles.cantineCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            {/* Student & School Header */}
            <View style={styles.cantineTop}>
              <View style={{ marginRight: 12 }}>
                <StudentAvatar student={student} token={activeToken} size={44} />
              </View>
              <View style={styles.cantineInfo}>
                <Text style={[styles.studentName, { color: theme.text }]}>
                  {student.prenom} {student.nom}
                </Text>
                <Text style={[styles.schoolName, { color: theme.textSecondary }]}>{student.nomEtablissement}</Text>
              </View>

              {/* Solde Badge */}
              <View style={[styles.soldeBadge, { backgroundColor: wallet?.nonConfigure ? theme.surface : "#EFF6FF" }]}>
                <Text style={[styles.soldeAmount, { color: wallet?.nonConfigure ? theme.textMuted : theme.primary }]}>
                  {wallet?.solde || "0,00 €"}
                </Text>
                <Text style={styles.soldeLabel}>
                  {wallet?.nonConfigure ? "Non configuré" : "Solde disponible"}
                </Text>
              </View>
            </View>

            {wallet?.nonConfigure ? (
              <View style={[styles.nonConfigureBox, { backgroundColor: theme.surface }]}>
                <AlertCircle size={16} color={theme.textMuted} />
                <Text style={[styles.nonConfigureText, { color: theme.textSecondary }]}>
                  Aucun porte-monnaie ou carte de cantine actif pour cet élève.
                </Text>
              </View>
            ) : (
              <>
                {/* Repas restants & dernier passage */}
                <View style={[styles.cantineStatsRow, { backgroundColor: theme.surface }]}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{wallet?.repasRestants ?? "—"}</Text>
                    <Text style={[styles.statSub, { color: theme.textSecondary }]}>Repas restants</Text>
                  </View>

                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

                  <View style={styles.statBox}>
                    <Text style={[styles.statValSmall, { color: theme.text }]}>
                      {wallet?.dernierPassage || "Récemment"}
                    </Text>
                    <Text style={[styles.statSub, { color: theme.textSecondary }]}>Dernier passage self</Text>
                  </View>
                </View>

                {/* Transaction history preview */}
                {wallet?.historique && wallet.historique.length > 0 && (
                  <View style={[styles.historyWrap, { borderTopColor: theme.border }]}>
                    <Text style={[styles.historyTitle, { color: theme.textMuted }]}>DERNIERS MOUVEMENTS :</Text>
                    {wallet.historique.map((h, i) => (
                      <View key={`tx-${student.id}-${i}-${h.date}`} style={[styles.historyItem, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.historyDate, { color: theme.textMuted }]}>{h.date}</Text>
                        <Text style={[styles.historyLibelle, { color: theme.text }]} numberOfLines={1}>
                          {h.libelle}
                        </Text>
                        <Text
                          style={[
                            styles.historyMontant,
                            h.montant.startsWith("+") ? styles.montantPlus : styles.montantMoins,
                          ]}
                        >
                          {h.montant}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        );
      })}

      {/* Vie Scolaire (Absences & Retards) */}
      <Text style={[styles.sectionHeader, { marginTop: 24, color: theme.textMuted }]}>
        VIE SCOLAIRE & ASSIDUITÉ
      </Text>

      {studentsToShow.map((student, sIdx) => {
        const events = vieScolaire[student.id] || [];
        return (
          <View
            key={`vs-${student.accountIdentifiant || "acc"}-${student.id}-${sIdx}`}
            style={[styles.vsCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.vsHeader}>
              <View style={{ marginRight: 10 }}>
                <StudentAvatar student={student} token={activeToken} size={28} />
              </View>
              <Text style={[styles.vsStudentTitle, { color: theme.text }]}>
                {student.prenom} {student.nom} ({student.classe?.libelle || "Élève"})
              </Text>
            </View>

            {events.length === 0 ? (
              <View style={styles.vsEmpty}>
                <CheckCircle2 size={18} color="#059669" />
                <Text style={[styles.vsEmptyText, { color: theme.textSecondary }]}>
                  Aucune absence ni retard signalé à ce jour.
                </Text>
              </View>
            ) : (
              events.map((ev, evIdx) => (
                <View
                  key={`ev-${student.id}-${ev.id || evIdx}-${evIdx}`}
                  style={[styles.eventItem, { borderBottomColor: theme.border }]}
                >
                  <View
                    style={[
                      styles.eventTypeBadge,
                      ev.type === "retard" ? styles.badgeRetard : styles.badgeAbsence,
                    ]}
                  >
                    <Text
                      style={[
                        styles.eventTypeText,
                        ev.type === "retard" ? styles.textRetard : styles.textAbsence,
                      ]}
                    >
                      {ev.type === "retard" ? "RETARD" : "ABSENCE"}
                    </Text>
                  </View>

                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventDate, { color: theme.textMuted }]}>{ev.date}</Text>
                    <Text style={[styles.eventMotif, { color: theme.text }]}>{ev.motif}</Text>
                  </View>

                  <View style={styles.justifieBadge}>
                    <Text style={styles.justifieText}>
                      {ev.justifie ? "✓ Justifié" : "⚠️ Non justifié"}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      })}
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  cantineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cantineTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cantineIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cantineInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  schoolName: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  soldeBadge: {
    alignItems: "flex-end",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  soldeAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2563EB",
  },
  soldeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 1,
  },
  cantineStatsRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  statValSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  statSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E2E8F0",
  },
  nonConfigureBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  nonConfigureText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  historyWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  historyDate: {
    fontSize: 11,
    color: "#94A3B8",
    width: 75,
  },
  historyLibelle: {
    fontSize: 12,
    color: "#334155",
    flex: 1,
  },
  historyMontant: {
    fontSize: 12,
    fontWeight: "700",
  },
  montantPlus: {
    color: "#059669",
  },
  montantMoins: {
    color: "#475569",
  },

  // Vie Scolaire Card
  vsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  vsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  vsStudentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  vsEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  vsEmptyText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#F8FAFC",
  },
  eventTypeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  badgeRetard: {
    backgroundColor: "#FEF3C7",
  },
  badgeAbsence: {
    backgroundColor: "#FEE2E2",
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  textRetard: {
    color: "#B45309",
  },
  textAbsence: {
    color: "#DC2626",
  },
  eventInfo: {
    flex: 1,
  },
  eventDate: {
    fontSize: 11,
    color: "#94A3B8",
  },
  eventMotif: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 1,
  },
  justifieBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  justifieText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
});
