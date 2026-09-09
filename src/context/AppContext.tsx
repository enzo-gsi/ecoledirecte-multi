import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Account,
  CantineWallet,
  GradeItem,
  HomeworkItem,
  MFAChallenge,
  MessageItem,
  Student,
  SubjectGrades,
  TimetableItem,
  VieScolaireItem,
} from "../types";
import { ecoleDirecteService } from "../services/ecoledirecte";
import {
  DEMO_ACCOUNTS,
  DEMO_CANTINE,
  DEMO_GRADES,
  DEMO_HOMEWORK,
  DEMO_MESSAGES,
  DEMO_TIMETABLE,
  DEMO_VIE_SCOLAIRE,
  StorageService,
} from "../services/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, darkTheme, lightTheme } from "../theme";

interface AppContextType {
  accounts: Account[];
  allStudents: Student[];
  activeStudentId: number | "family";
  activeStudent: Student | null;
  isFamilyView: boolean;
  switchStudent: (id: number | "family") => void;

  homework: HomeworkItem[];
  grades: {
    periodes: any[];
    notes: GradeItem[];
    subjects: SubjectGrades[];
    moyenneGenerale?: string;
    moyenneClasse?: string;
  };
  timetable: TimetableItem[];
  messages: MessageItem[];
  cantineWallets: Record<number, CantineWallet>;
  vieScolaire: Record<number, VieScolaireItem[]>;

  loading: boolean;
  refreshing: boolean;
  refreshData: () => Promise<void>;
  toggleHomework: (homeworkId: number) => Promise<void>;
  markMessageRead: (messageId: number) => void;
  fetchMessageContent: (
    messageId: number,
    studentId?: number,
    familyId?: number,
    recipientType?: "parent" | "eleve"
  ) => Promise<string>;

  addAccount: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; mfa?: MFAChallenge; error?: string }>;
  submitMFA: (choice: string) => Promise<{ success: boolean; error?: string }>;
  mfaChallenge: MFAChallenge | null;
  cancelMFA: () => void;
  removeAccount: (identifiant: string) => Promise<void>;

  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
  activeToken: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const getAccountForStudent = (student: Student, currentAccounts: Account[]): Account | undefined => {
  if (!currentAccounts || currentAccounts.length === 0) return undefined;

  // 1. Check direct match in account.eleves
  const byEleve = currentAccounts.find((a) =>
    a.eleves && Array.isArray(a.eleves) && a.eleves.some((e) => e.id === student.id)
  );
  if (byEleve) return byEleve;

  // 2. Check accountIdentifiant match
  if (student.accountIdentifiant) {
    const byIdent = currentAccounts.find(
      (a) => a.identifiant.toLowerCase() === student.accountIdentifiant?.toLowerCase()
    );
    if (byIdent) return byIdent;
  }

  return currentAccounts[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<number | "family">("family");
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [grades, setGrades] = useState<{
    periodes: any[];
    notes: GradeItem[];
    subjects: SubjectGrades[];
    moyenneGenerale?: string;
    moyenneClasse?: string;
  }>({
    periodes: [],
    notes: [],
    subjects: [],
  });
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [cantineWallets, setCantineWallets] = useState<Record<number, CantineWallet>>({});
  const [vieScolaire, setVieScolaire] = useState<Record<number, VieScolaireItem[]>>({});

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem("@ecoledirecte:theme", next ? "dark" : "light").catch(() => {});
      return next;
    });
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [mfaChallenge, setMfaChallenge] = useState<MFAChallenge | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    let loadedAccounts = await StorageService.getAccounts();

    try {
      const savedTheme = await AsyncStorage.getItem("@ecoledirecte:theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      }
    } catch {}

    // Supprimer les faux comptes de démo Dupont pour que l'utilisateur voie ses propres données réelles
    loadedAccounts = loadedAccounts.filter(
      (a) => a.identifiant !== "dupont.famille1" && a.identifiant !== "dupont.famille2"
    );

    // Connexion immédiate pour tous les comptes enregistrés pour obtenir des tokens frais
    for (const acc of loadedAccounts) {
      if (acc.password && acc.password.length > 0) {
        try {
          const loginRes = await ecoleDirecteService.login(acc.identifiant, acc.password, acc.fa);
          if (loginRes.status === "success") {
            acc.token = loginRes.token;
            if (loginRes.account.eleves && loginRes.account.eleves.length > 0) {
              acc.eleves = loginRes.account.eleves;
            }
          }
        } catch (e) {
          console.warn("Auto login at startup failed for", acc.identifiant, e);
        }
      }
    }

    ecoleDirecteService.registerAccounts(loadedAccounts);
    if (loadedAccounts.length > 0) {
      ecoleDirecteService.setActiveAccount(loadedAccounts[0]);
    }
    ecoleDirecteService.setTokenRefreshListener((updated) => {
      StorageService.addAccount(updated);
      setAccounts((prev) =>
        prev.map((a) => (a.identifiant.toLowerCase() === updated.identifiant.toLowerCase() ? { ...a, token: updated.token } : a))
      );
    });

    await StorageService.saveAccounts(loadedAccounts);
    setAccounts(loadedAccounts);

    const students: Student[] = [];
    for (const acc of loadedAccounts) {
      if (acc.eleves && Array.isArray(acc.eleves)) {
        for (let idx = 0; idx < acc.eleves.length; idx++) {
          const st = { ...acc.eleves[idx] };
          st.accountIdentifiant = acc.identifiant;
          if (!st.id || st.id === 0) {
            st.id = 50000 + (students.length + 1);
          }
          students.push(st);
        }
      }
    }
    setAllStudents(students);
    setAllStudents(students);

    const savedActiveId = await StorageService.getActiveStudentId();
    if (savedActiveId === "family") {
      setActiveStudentId("family");
    } else if (students.some((s) => s.id === savedActiveId)) {
      setActiveStudentId(savedActiveId);
    } else if (students.length > 0) {
      setActiveStudentId(students[0].id);
    } else {
      setActiveStudentId("family");
    }

    setLoading(false);
    fetchCurrentData();
  };

  const ensureAccountToken = async (acc: Account): Promise<string | undefined> => {
    if (!acc.token || acc.token.length < 10) {
      const newToken = await ecoleDirecteService.relogin(acc);
      if (newToken) {
        acc.token = newToken;
        await StorageService.addAccount(acc);
      }
    }
    return acc.token;
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchCurrentData();
    }
  }, [activeStudentId, accounts.length]);

  const activeStudent =
    activeStudentId === "family"
      ? null
      : allStudents.find((s) => s.id === activeStudentId) || null;

  const isFamilyView = activeStudentId === "family";

  const switchStudent = async (id: number | "family") => {
    setActiveStudentId(id);
    await StorageService.saveActiveStudentId(id);
  };

  const fetchCurrentData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setRefreshing(true);
    try {
      // Si l'élève actif est encore sur l'ancien profil démo Lucas (201) ou Emma (202), basculer automatiquement
      if (activeStudentId === 201 || activeStudentId === 202) {
        if (allStudents.length > 0) {
          setActiveStudentId(allStudents[0].id);
          await StorageService.saveActiveStudentId(allStudents[0].id);
          return;
        }
      }

      // Plage de dates élargie : 2 semaines en arrière à 5 semaines en avant
      const now = new Date();
      const startDateObj = new Date(now);
      startDateObj.setDate(now.getDate() - 14);
      const startDate = startDateObj.toISOString().split("T")[0];

      const endDateObj = new Date(now);
      endDateObj.setDate(now.getDate() + 35);
      const endDate = endDateObj.toISOString().split("T")[0];

      if (isFamilyView) {
        let combinedHomework: HomeworkItem[] = [];
        let combinedNotes: GradeItem[] = [];
        let combinedTimetable: TimetableItem[] = [];
        let combinedMessages: MessageItem[] = [];
        let newWallets: Record<number, CantineWallet> = {};
        let newVieScolaire: Record<number, VieScolaireItem[]> = {};
        const seenMessageKeys = new Set<string>();

        // Récupération des données par élève et famille
        for (const student of allStudents) {
          const parentAccount = getAccountForStudent(student, accounts);
          let token = parentAccount?.token;
          if (parentAccount) {
            token = await ensureAccountToken(parentAccount);
          }
          if (!token && parentAccount?.token) {
            token = parentAccount.token;
          }

          if (token && parentAccount) {
            try {
              const [hw, gr, tt, msg, vs, ctn] = await Promise.allSettled([
                ecoleDirecteService.getHomeworks(student.id, token),
                ecoleDirecteService.getGrades(student.id, token),
                ecoleDirecteService.getTimetable(student.id, startDate, endDate, token, parentAccount.id),
                ecoleDirecteService.getMessages(
                  {
                    studentId: student.id,
                    familyId: parentAccount.id,
                    anneeScolaire: parentAccount.anneeScolaireCourante,
                  },
                  token
                ),
                ecoleDirecteService.getSchoolLife(student.id, token),
                ecoleDirecteService.getCantineWallet(student.id, token, parentAccount.id),
              ]);

              if (hw.status === "fulfilled") {
                combinedHomework.push(...hw.value.map((h) => ({ ...h, studentName: student.prenom })));
              }
              if (gr.status === "fulfilled" && gr.value?.notes) {
                combinedNotes.push(...gr.value.notes.map((n) => ({ ...n, studentName: student.prenom })));
              }
              if (tt.status === "fulfilled") {
                combinedTimetable.push(...tt.value.map((t) => ({ ...t, studentName: student.prenom })));
              }
              if (msg.status === "fulfilled") {
                for (const m of msg.value) {
                  const uniqueKey = `${m.recipientType || 'all'}_${m.id}`;
                  if (!seenMessageKeys.has(uniqueKey)) {
                    seenMessageKeys.add(uniqueKey);
                    combinedMessages.push({ ...m, studentName: student.prenom });
                  }
                }
              }
              if (vs.status === "fulfilled") {
                newVieScolaire[student.id] = vs.value;
              }
              if (ctn.status === "fulfilled" && ctn.value) {
                newWallets[student.id] = { ...ctn.value, studentName: student.prenom };
              }
            } catch (e) {
              console.warn("Error fetching data for student", student.id, e);
            }
          } else {
            // Demo fallback
            combinedHomework.push(...(DEMO_HOMEWORK[student.id] || []));
            combinedNotes.push(...(DEMO_GRADES[student.id]?.notes || []));
            combinedTimetable.push(...(DEMO_TIMETABLE[student.id] || []));
            combinedMessages.push(...(DEMO_MESSAGES[student.id] || []));
            if (DEMO_CANTINE[student.id]) newWallets[student.id] = DEMO_CANTINE[student.id];
            if (DEMO_VIE_SCOLAIRE[student.id]) newVieScolaire[student.id] = DEMO_VIE_SCOLAIRE[student.id];
          }
        }

        combinedHomework.sort((a, b) => a.date.localeCompare(b.date));
        combinedNotes.sort((a, b) => b.date.localeCompare(a.date));
        combinedTimetable.sort((a, b) => a.start_date.localeCompare(b.start_date));
        combinedMessages.sort((a, b) => b.date.localeCompare(a.date));

        setHomework(combinedHomework);
        setGrades({
          periodes: [],
          notes: combinedNotes,
          subjects: [],
          moyenneGenerale: undefined,
          moyenneClasse: undefined,
        });
        setTimetable(combinedTimetable);
        setMessages(combinedMessages);
        setCantineWallets(newWallets);
        setVieScolaire(newVieScolaire);
      } else if (activeStudent) {
        // Single student view
        const parentAccount = getAccountForStudent(activeStudent, accounts);
        let token = parentAccount?.token;
        if (parentAccount) {
          token = await ensureAccountToken(parentAccount);
        }
        if (!token && parentAccount?.token) {
          token = parentAccount.token;
        }

        if (token && parentAccount) {
          const [hw, gr, tt, msg, vs, ctn] = await Promise.allSettled([
            ecoleDirecteService.getHomeworks(activeStudent.id, token),
            ecoleDirecteService.getGrades(activeStudent.id, token),
            ecoleDirecteService.getTimetable(activeStudent.id, startDate, endDate, token, parentAccount?.id),
            ecoleDirecteService.getMessages(
              {
                studentId: activeStudent.id,
                familyId: parentAccount?.id,
                anneeScolaire: parentAccount?.anneeScolaireCourante,
              },
              token
            ),
            ecoleDirecteService.getSchoolLife(activeStudent.id, token),
            ecoleDirecteService.getCantineWallet(activeStudent.id, token, parentAccount?.id),
          ]);

          if (hw.status === "fulfilled") setHomework(hw.value || []);
          if (gr.status === "fulfilled") {
            setGrades({
              periodes: gr.value?.periodes || [],
              notes: gr.value?.notes || [],
              subjects: gr.value?.subjects || [],
              moyenneGenerale: gr.value?.moyenneGenerale,
              moyenneClasse: gr.value?.moyenneClasse,
            });
          }
          if (tt.status === "fulfilled") setTimetable(tt.value || []);
          if (msg.status === "fulfilled") setMessages(msg.value || []);
          if (vs.status === "fulfilled") {
            setVieScolaire({ [activeStudent.id]: vs.value || [] });
          }
          if (ctn.status === "fulfilled" && ctn.value) {
            setCantineWallets({ [activeStudent.id]: ctn.value });
          }
        } else {
          // Demo data
          setHomework(DEMO_HOMEWORK[activeStudent.id] || []);
          const demoG = DEMO_GRADES[activeStudent.id] || {};
          setGrades({
            periodes: demoG.periodes || [],
            notes: demoG.notes || [],
            subjects: demoG.subjects || [],
            moyenneGenerale: demoG.moyenneClasse,
            moyenneClasse: demoG.moyenneClasse,
          });
          setTimetable(DEMO_TIMETABLE[activeStudent.id] || []);
          setMessages(DEMO_MESSAGES[activeStudent.id] || []);
          if (DEMO_CANTINE[activeStudent.id]) {
            setCantineWallets({ [activeStudent.id]: DEMO_CANTINE[activeStudent.id] });
          }
          if (DEMO_VIE_SCOLAIRE[activeStudent.id]) {
            setVieScolaire({ [activeStudent.id]: DEMO_VIE_SCOLAIRE[activeStudent.id] });
          }
        }
      }
    } catch (err) {
      console.warn("fetchCurrentData error", err);
    } finally {
      isFetchingRef.current = false;
      setRefreshing(false);
    }
  };

  const toggleHomework = async (homeworkId: number) => {
    const hw = homework.find((h) => h.id === homeworkId);
    if (!hw) return;

    const newStatus = !hw.aFaire.effectue;

    setHomework((prev) =>
      prev.map((item) =>
        item.id === homeworkId
          ? {
              ...item,
              aFaire: {
                ...item.aFaire,
                effectue: newStatus,
              },
            }
          : item
      )
    );

    const student = allStudents.find((s) => s.id === hw.studentId);
    if (student) {
      const parent = accounts.find((a) => a.identifiant === student.accountIdentifiant);
      if (parent?.token) {
        await ecoleDirecteService.setHomeworkStatus(
          student.id,
          homeworkId,
          newStatus,
          parent.token
        );
      }
    }
  };

  const markMessageRead = (messageId: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, lu: true } : m))
    );
  };

  const fetchMessageContent = async (
    messageId: number,
    studentId?: number,
    familyId?: number,
    recipientType?: "parent" | "eleve"
  ): Promise<string> => {
    let token: string | undefined;
    if (studentId) {
      const student = allStudents.find((s) => s.id === studentId);
      const acc = accounts.find((a) => a.identifiant === student?.accountIdentifiant);
      token = acc?.token;
    }
    if (!token && familyId) {
      const acc = accounts.find((a) => a.id === familyId);
      token = acc?.token;
    }
    if (!token && accounts.length > 0) {
      token = accounts[0].token;
    }
    if (!token) {
      token = ecoleDirecteService.getActiveToken();
    }
    if (!token) return "Contenu non disponible.";

    const content = await ecoleDirecteService.getMessageContent(
      messageId,
      token,
      studentId,
      familyId,
      recipientType
    );
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, contenu: content } : m))
    );
    return content;
  };

  const addAccount = async (
    username: string,
    pass: string
  ): Promise<{ success: boolean; mfa?: MFAChallenge; error?: string }> => {
    const res = await ecoleDirecteService.login(username, pass);

    if (res.status === "success") {
      res.account.password = pass;
      const updatedAccounts = await StorageService.addAccount(res.account);
      setAccounts(updatedAccounts);
      ecoleDirecteService.registerAccounts(updatedAccounts);

      const students: Student[] = [];
      for (const acc of updatedAccounts) {
        if (acc.eleves && Array.isArray(acc.eleves)) {
          for (let idx = 0; idx < acc.eleves.length; idx++) {
            const st = { ...acc.eleves[idx] };
            st.accountIdentifiant = acc.identifiant;
            if (!st.id || st.id === 0) {
              st.id = 50000 + (students.length + 1);
            }
            students.push(st);
          }
        }
      }
      setAllStudents(students);

      if (res.account.eleves.length > 0) {
        await switchStudent(res.account.eleves[0].id);
      }

      return { success: true };
    } else if (res.status === "mfa_required") {
      setMfaChallenge(res.challenge);
      return { success: false, mfa: res.challenge };
    } else {
      return { success: false, error: res.message };
    }
  };

  const submitMFA = async (
    choice: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!mfaChallenge) return { success: false, error: "Pas de challenge 2FA en cours" };

    const res = await ecoleDirecteService.answerMFA(mfaChallenge, choice);
    if (res.status === "success") {
      res.account.password = mfaChallenge.password;
      setMfaChallenge(null);
      const updatedAccounts = await StorageService.addAccount(res.account);
      setAccounts(updatedAccounts);
      ecoleDirecteService.registerAccounts(updatedAccounts);

      const students: Student[] = [];
      for (const acc of updatedAccounts) {
        if (acc.eleves && Array.isArray(acc.eleves)) {
          for (let idx = 0; idx < acc.eleves.length; idx++) {
            const st = { ...acc.eleves[idx] };
            st.accountIdentifiant = acc.identifiant;
            if (!st.id || st.id === 0) {
              st.id = 50000 + (students.length + 1);
            }
            students.push(st);
          }
        }
      }
      setAllStudents(students);

      if (res.account.eleves.length > 0) {
        await switchStudent(res.account.eleves[0].id);
      }
      return { success: true };
    } else {
      return { success: false, error: res.message };
    }
  };

  const cancelMFA = () => {
    setMfaChallenge(null);
  };

  const removeAccount = async (identifiant: string) => {
    const updated = await StorageService.removeAccount(identifiant);
    setAccounts(updated);
    ecoleDirecteService.registerAccounts(updated);

    const students: Student[] = [];
    for (const acc of updated) {
      if (acc.eleves && Array.isArray(acc.eleves)) {
        for (const el of acc.eleves) {
          students.push({ ...el, accountIdentifiant: acc.identifiant });
        }
      }
    }
    setAllStudents(students);

    if (activeStudentId !== "family" && !students.some((s) => s.id === activeStudentId)) {
      await switchStudent("family");
    }
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        allStudents,
        activeStudentId,
        activeStudent,
        isFamilyView,
        switchStudent,
        homework,
        grades,
        timetable,
        messages,
        cantineWallets,
        vieScolaire,
        loading,
        refreshing,
        refreshData: fetchCurrentData,
        toggleHomework,
        markMessageRead,
        fetchMessageContent,
        addAccount,
        submitMFA,
        mfaChallenge,
        cancelMFA,
        removeAccount,
        isDarkMode,
        toggleDarkMode,
        theme,
        activeToken: accounts.find((a) => a.token)?.token || ecoleDirecteService.getActiveToken() || "",
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
