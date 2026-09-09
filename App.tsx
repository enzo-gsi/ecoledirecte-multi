import React, { useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  Mail,
  Settings,
  Utensils,
} from "lucide-react-native";

import { AppProvider, useApp } from "./src/context/AppContext";
import { HeaderSwitcher } from "./src/components/HeaderSwitcher";
import { MFAQuizModal } from "./src/components/MFAQuizModal";
import { HomeScreen } from "./src/screens/HomeScreen";
import { HomeworkScreen } from "./src/screens/HomeworkScreen";
import { GradesScreen } from "./src/screens/GradesScreen";
import { TimetableScreen } from "./src/screens/TimetableScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";
import { FamilyFinanceScreen } from "./src/screens/FamilyFinanceScreen";
import { AccountsScreen } from "./src/screens/AccountsScreen";

type TabType = "home" | "homework" | "grades" | "messages" | "finance" | "timetable" | "accounts";

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const { messages, theme, isDarkMode } = useApp();

  const unreadCount = messages.filter((m) => !m.lu).length;

  const handleTabPress = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onNavigateTab={(t) => handleTabPress(t as TabType)} />;
      case "homework":
        return <HomeworkScreen />;
      case "grades":
        return <GradesScreen />;
      case "messages":
        return <MessagesScreen />;
      case "finance":
        return <FamilyFinanceScreen />;
      case "timetable":
        return <TimetableScreen />;
      case "accounts":
        return <AccountsScreen />;
      default:
        return <HomeScreen onNavigateTab={(t) => handleTabPress(t as TabType)} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      {/* Floating Student Switcher Header (Papillon Style) */}
      <HeaderSwitcher onOpenAccounts={() => handleTabPress("accounts")} />

      {/* Main Screen Body */}
      <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
        {renderScreen()}
      </View>

      {/* Security MFA modal when EcoleDirecte prompts for verification */}
      <MFAQuizModal />

      {/* Native iOS Bottom Tab Bar (5 main tabs) */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.tabBarBg, borderTopColor: theme.tabBarBorder },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress("home")}
        >
          <Home
            size={22}
            color={activeTab === "home" ? theme.primary : theme.textMuted}
            strokeWidth={activeTab === "home" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: theme.textMuted },
              activeTab === "home" && { color: theme.primary, fontWeight: "700" },
            ]}
          >
            Accueil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress("timetable")}
        >
          <Calendar
            size={22}
            color={activeTab === "timetable" ? theme.primary : theme.textMuted}
            strokeWidth={activeTab === "timetable" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: theme.textMuted },
              activeTab === "timetable" && { color: theme.primary, fontWeight: "700" },
            ]}
          >
            Planning
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress("homework")}
        >
          <BookOpen
            size={22}
            color={activeTab === "homework" ? theme.primary : theme.textMuted}
            strokeWidth={activeTab === "homework" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: theme.textMuted },
              activeTab === "homework" && { color: theme.primary, fontWeight: "700" },
            ]}
          >
            Devoirs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress("grades")}
        >
          <GraduationCap
            size={22}
            color={activeTab === "grades" ? theme.primary : theme.textMuted}
            strokeWidth={activeTab === "grades" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: theme.textMuted },
              activeTab === "grades" && { color: theme.primary, fontWeight: "700" },
            ]}
          >
            Notes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress("messages")}
        >
          <View style={styles.iconBadgeWrap}>
            <Mail
              size={22}
              color={activeTab === "messages" ? theme.primary : theme.textMuted}
              strokeWidth={activeTab === "messages" ? 2.5 : 2}
            />
            {unreadCount > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: theme.textMuted },
              activeTab === "messages" && { color: theme.primary, fontWeight: "700" },
            ]}
          >
            Messages
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  screenContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 14 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  iconBadgeWrap: {
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  tabLabelActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
