import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Account,
  CantineWallet,
  GradeItem,
  HomeworkItem,
  MessageItem,
  Student,
  TimetableItem,
  VieScolaireItem,
} from "../types";

const ACCOUNTS_KEY = "@ecoledirecte:accounts";
const ACTIVE_STUDENT_KEY = "@ecoledirecte:active_student";
const CACHE_PREFIX = "@ecoledirecte:cache:";

// Demo accounts with two children in two different schools
export const DEMO_ACCOUNTS: Account[] = [
  {
    id: 101,
    identifiant: "dupont.famille1",
    nom: "DUPONT",
    prenom: "Marc",
    typeCompte: "1",
    nomEtablissement: "Collège Saint-Joseph",
    eleves: [
      {
        id: 201,
        nom: "DUPONT",
        prenom: "Lucas",
        classe: { id: 14, code: "4EME_B", libelle: "4ème B" },
        nomEtablissement: "Collège Saint-Joseph",
        accountIdentifiant: "dupont.famille1",
      },
    ],
  },
  {
    id: 102,
    identifiant: "dupont.famille2",
    nom: "DUPONT",
    prenom: "Marc",
    typeCompte: "1",
    nomEtablissement: "Lycée Victor Hugo",
    eleves: [
      {
        id: 202,
        nom: "DUPONT",
        prenom: "Emma",
        classe: { id: 25, code: "2NDE_1", libelle: "2nde 1" },
        nomEtablissement: "Lycée Victor Hugo",
        accountIdentifiant: "dupont.famille2",
      },
    ],
  },
];

export const DEMO_HOMEWORK: Record<number, HomeworkItem[]> = {
  201: [
    {
      id: 501,
      matiere: "Mathématiques",
      codeMatiere: "MATH",
      aFaire: {
        id: 501,
        contenu: "Exercices 42 et 43 page 118 sur le théorème de Pythagore.",
        donneLe: "2026-09-04",
        effectue: false,
      },
      date: "2026-09-07",
      interrogation: false,
      studentId: 201,
      studentName: "Lucas",
    },
    {
      id: 502,
      matiere: "Français",
      codeMatiere: "FRANC",
      aFaire: {
        id: 502,
        contenu: "Lire les chapitres 3 et 4 du roman 'Le Lion' de Joseph Kessel.",
        donneLe: "2026-09-03",
        effectue: true,
      },
      date: "2026-09-07",
      interrogation: false,
      studentId: 201,
      studentName: "Lucas",
    },
    {
      id: 503,
      matiere: "Histoire-Géo",
      codeMatiere: "HIST",
      aFaire: {
        id: 503,
        contenu: "Apprendre la leçon sur les traites négrières et le commerce triangulaire. Interrogation écrite.",
        donneLe: "2026-09-02",
        effectue: false,
      },
      date: "2026-09-08",
      interrogation: true,
      studentId: 201,
      studentName: "Lucas",
    },
  ],
  202: [
    {
      id: 601,
      matiere: "Physique-Chimie",
      codeMatiere: "PHYS",
      aFaire: {
        id: 601,
        contenu: "Finir le compte-rendu du TP n°1 sur le spectre d'émission de la lumière.",
        donneLe: "2026-09-04",
        effectue: false,
      },
      date: "2026-09-07",
      interrogation: false,
      studentId: 202,
      studentName: "Emma",
    },
    {
      id: 602,
      matiere: "Anglais",
      codeMatiere: "ANGL",
      aFaire: {
        id: 602,
        contenu: "Vocabulary sheet Unit 1 + short paragraph on 'My summer journey' (150 words).",
        donneLe: "2026-09-04",
        effectue: false,
      },
      date: "2026-09-08",
      interrogation: false,
      studentId: 202,
      studentName: "Emma",
    },
  ],
};

const LUCAS_NOTES: GradeItem[] = [
  {
    id: 1,
    devoir: "DS n°1 - Théorème de Pythagore",
    codeMatiere: "MATH",
    discipline: "Mathématiques",
    date: "2026-09-04",
    valeur: "17",
    noteSur: "20",
    coef: "2",
    nonSignificatif: false,
    moyenneClasse: "13.2",
    min: "7",
    max: "19.5",
    studentId: 201,
    studentName: "Lucas",
  },
  {
    id: 2,
    devoir: "Interrogation Flash - Calcul mental",
    codeMatiere: "MATH",
    discipline: "Mathématiques",
    date: "2026-09-02",
    valeur: "16",
    noteSur: "20",
    coef: "0.5",
    nonSignificatif: false,
    moyenneClasse: "12.4",
    min: "6",
    max: "20",
    studentId: 201,
    studentName: "Lucas",
  },
  {
    id: 3,
    devoir: "Rédaction - Portrait réaliste",
    codeMatiere: "FRANC",
    discipline: "Français",
    date: "2026-09-03",
    valeur: "14.5",
    noteSur: "20",
    coef: "2",
    nonSignificatif: false,
    moyenneClasse: "12.9",
    min: "8",
    max: "17",
    studentId: 201,
    studentName: "Lucas",
  },
  {
    id: 4,
    devoir: "Contrôle de repères chronologiques",
    codeMatiere: "HIST",
    discipline: "Histoire-Géo",
    date: "2026-09-01",
    valeur: "15.5",
    noteSur: "20",
    coef: "1",
    nonSignificatif: false,
    moyenneClasse: "13.5",
    min: "9",
    max: "19",
    studentId: 201,
    studentName: "Lucas",
  },
];

const EMMA_NOTES: GradeItem[] = [
  {
    id: 11,
    devoir: "TP Évaluation - Spectroscopie",
    codeMatiere: "PHYS",
    discipline: "Physique-Chimie",
    date: "2026-09-04",
    valeur: "18",
    noteSur: "20",
    coef: "1",
    nonSignificatif: false,
    moyenneClasse: "14.1",
    min: "10",
    max: "19",
    studentId: 202,
    studentName: "Emma",
  },
  {
    id: 12,
    devoir: "Essay: Environmental issues",
    codeMatiere: "ANGL",
    discipline: "Anglais",
    date: "2026-09-03",
    valeur: "15.5",
    noteSur: "20",
    coef: "2",
    nonSignificatif: false,
    moyenneClasse: "13.8",
    min: "8.5",
    max: "18",
    studentId: 202,
    studentName: "Emma",
  },
  {
    id: 13,
    devoir: "QCM Bilan - La cellule vivante",
    codeMatiere: "SVT",
    discipline: "SVT",
    date: "2026-09-02",
    valeur: "16",
    noteSur: "20",
    coef: "1",
    nonSignificatif: false,
    moyenneClasse: "13.9",
    min: "9",
    max: "19.5",
    studentId: 202,
    studentName: "Emma",
  },
];

export const DEMO_GRADES: Record<number, any> = {
  201: {
    moyenneGenerale: "15.42",
    moyenneClasse: "13.10",
    notes: LUCAS_NOTES,
    subjects: [
      {
        codeMatiere: "MATH",
        discipline: "Mathématiques",
        moyenne: "16.50",
        moyenneClasse: "12.80",
        notes: [LUCAS_NOTES[0], LUCAS_NOTES[1]],
      },
      {
        codeMatiere: "FRANC",
        discipline: "Français",
        moyenne: "14.25",
        moyenneClasse: "13.05",
        notes: [LUCAS_NOTES[2]],
      },
      {
        codeMatiere: "HIST",
        discipline: "Histoire-Géo",
        moyenne: "15.50",
        moyenneClasse: "13.50",
        notes: [LUCAS_NOTES[3]],
      },
    ],
  },
  202: {
    moyenneGenerale: "16.10",
    moyenneClasse: "13.80",
    notes: EMMA_NOTES,
    subjects: [
      {
        codeMatiere: "PHYS",
        discipline: "Physique-Chimie",
        moyenne: "17.00",
        moyenneClasse: "13.20",
        notes: [EMMA_NOTES[0]],
      },
      {
        codeMatiere: "ANGL",
        discipline: "Anglais",
        moyenne: "15.50",
        moyenneClasse: "14.00",
        notes: [EMMA_NOTES[1]],
      },
      {
        codeMatiere: "SVT",
        discipline: "SVT",
        moyenne: "15.80",
        moyenneClasse: "14.10",
        notes: [EMMA_NOTES[2]],
      },
    ],
  },
};

export const DEMO_TIMETABLE: Record<number, TimetableItem[]> = {
  201: [
    {
      id: 301,
      matiere: "Mathématiques",
      codeMatiere: "MATH",
      prof: "M. TARDIEU",
      salle: "Salle 104",
      start_date: "2026-09-07 08:30",
      end_date: "2026-09-07 09:30",
      studentId: 201,
      studentName: "Lucas",
    },
    {
      id: 302,
      matiere: "Français",
      codeMatiere: "FRANC",
      prof: "Mme MERCIER",
      salle: "Salle 208",
      start_date: "2026-09-07 09:30",
      end_date: "2026-09-07 10:30",
      studentId: 201,
      studentName: "Lucas",
    },
    {
      id: 303,
      matiere: "Histoire-Géo",
      codeMatiere: "HIST",
      prof: "M. LECLERC",
      salle: "Salle 112",
      start_date: "2026-09-07 10:45",
      end_date: "2026-09-07 11:45",
      studentId: 201,
      studentName: "Lucas",
    },
    {
      id: 304,
      matiere: "Anglais",
      codeMatiere: "ANGL",
      prof: "Mrs SMITH",
      salle: "Labo Langues",
      start_date: "2026-09-07 13:30",
      end_date: "2026-09-07 14:30",
      studentId: 201,
      studentName: "Lucas",
    },
  ],
  202: [
    {
      id: 401,
      matiere: "Physique-Chimie",
      codeMatiere: "PHYS",
      prof: "M. MOREAU",
      salle: "Labo Chimie 2",
      start_date: "2026-09-07 08:00",
      end_date: "2026-09-07 10:00",
      studentId: 202,
      studentName: "Emma",
    },
    {
      id: 402,
      matiere: "Anglais",
      codeMatiere: "ANGL",
      prof: "Mme DUBOIS",
      salle: "Salle 302",
      start_date: "2026-09-07 10:15",
      end_date: "2026-09-07 11:15",
      studentId: 202,
      studentName: "Emma",
    },
    {
      id: 403,
      matiere: "SVT",
      codeMatiere: "SVT",
      prof: "Mme BLANCHARD",
      salle: "Salle SVT 1",
      start_date: "2026-09-07 13:00",
      end_date: "2026-09-07 15:00",
      studentId: 202,
      studentName: "Emma",
    },
  ],
};

export const DEMO_MESSAGES: Record<number, MessageItem[]> = {
  201: [
    {
      id: 701,
      date: "2026-09-05",
      expediteur: "Direction - Collège St-Joseph",
      sujet: "Réunion parents-professeurs de rentrée (4ème)",
      lu: false,
      contenu: "Chers parents d'élèves,\n\nNous vous convions à la réunion de rentrée qui se tiendra le jeudi 18 septembre à 18h00 dans l'amphithéâtre. Les professeurs principaux présenteront les enjeux de l'année de 4ème et les projets pédagogiques.\n\nCordialement,\nLa Direction.",
      studentId: 201,
      studentName: "Lucas",
    },
    {
      id: 702,
      date: "2026-09-03",
      expediteur: "M. TARDIEU (Mathématiques)",
      sujet: "Matériel requis pour le cours de géométrie",
      lu: true,
      contenu: "Bonjour,\n\nMerci de vous assurer que votre enfant dispose bien de son compas, de sa règle graduée et de son équerre pour les séances de la semaine prochaine.\n\nBien à vous,\nM. Tardieu.",
      studentId: 201,
      studentName: "Lucas",
    },
  ],
  202: [
    {
      id: 703,
      date: "2026-09-04",
      expediteur: "Vie Scolaire - Lycée Victor Hugo",
      sujet: "Élection des délégués de parents d'élèves",
      lu: false,
      contenu: "Madame, Monsieur,\n\nLe scrutin pour les élections des représentants des parents d'élèves au conseil d'administration aura lieu le vendredi 10 octobre. Vous pouvez voter par correspondance ou sur place.\n\nL'équipe de vie scolaire.",
      studentId: 202,
      studentName: "Emma",
    },
    {
      id: 704,
      date: "2026-09-02",
      expediteur: "M. MOREAU (Physique)",
      sujet: "Consignes de sécurité en laboratoire",
      lu: true,
      contenu: "Bonjour,\n\nLe port de la blouse en coton 100% est obligatoire dès le prochain cours de TP. Merci de vérifier que votre enfant en est équipé.\n\nBien cordialement,\nM. Moreau.",
      studentId: 202,
      studentName: "Emma",
    },
  ],
};

export const DEMO_CANTINE: Record<number, CantineWallet> = {
  201: {
    solde: "42,80 €",
    numeroBadge: "00294819",
    repasRestants: 9,
    dernierPassage: "Vendredi 4 sept. à 12h15",
    historique: [
      { date: "2026-09-04", libelle: "Passage self midi", montant: "-4,50 €" },
      { date: "2026-09-03", libelle: "Passage self midi", montant: "-4,50 €" },
      { date: "2026-09-01", libelle: "Rechargement en ligne Carte Bancaire", montant: "+50,00 €" },
    ],
    studentId: 201,
    studentName: "Lucas",
  },
  202: {
    solde: "28,50 €",
    numeroBadge: "00384920",
    repasRestants: 6,
    dernierPassage: "Vendredi 4 sept. à 12h40",
    historique: [
      { date: "2026-09-04", libelle: "Passage restauration scolaire", montant: "-4,80 €" },
      { date: "2026-09-02", libelle: "Passage restauration scolaire", montant: "-4,80 €" },
      { date: "2026-08-30", libelle: "Rechargement annuel", montant: "+60,00 €" },
    ],
    studentId: 202,
    studentName: "Emma",
  },
};

export const DEMO_VIE_SCOLAIRE: Record<number, VieScolaireItem[]> = {
  201: [
    {
      id: 801,
      type: "retard",
      date: "2026-09-03 08:38",
      duree: "8 min",
      motif: "Problème de bus de ramassage scolaire",
      justifie: true,
      studentId: 201,
      studentName: "Lucas",
    },
  ],
  202: [
    {
      id: 802,
      type: "absence",
      date: "2026-09-02",
      duree: "Demi-journée",
      motif: "Rendez-vous médical",
      justifie: true,
      studentId: 202,
      studentName: "Emma",
    },
  ],
};

export class StorageService {
  static async getAccounts(): Promise<Account[]> {
    try {
      const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
      if (data) {
        let accounts: Account[] = JSON.parse(data);
        if (Array.isArray(accounts)) {
          // Si un compte réel est enregistré, retirer les faux comptes de démo Dupont
          const hasRealAccount = accounts.some(
            (a) => a.identifiant && !a.identifiant.startsWith("dupont")
          );
          if (hasRealAccount) {
            accounts = accounts.filter((a) => !a.identifiant.startsWith("dupont"));
          }
          return accounts;
        }
      }
      return DEMO_ACCOUNTS;
    } catch {
      return DEMO_ACCOUNTS;
    }
  }

  static async saveAccounts(accounts: Account[]): Promise<void> {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  static async addAccount(account: Account): Promise<Account[]> {
    let accounts = await this.getAccounts();
    // Retirer les comptes de démo dès qu'un vrai compte est ajouté
    if (account.identifiant && !account.identifiant.startsWith("dupont")) {
      accounts = accounts.filter((a) => !a.identifiant.startsWith("dupont"));
    }

    const existingIndex = accounts.findIndex((a) => a.identifiant === account.identifiant);

    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }

    await this.saveAccounts(accounts);
    return accounts;
  }

  static async removeAccount(identifiant: string): Promise<Account[]> {
    let accounts = await this.getAccounts();
    accounts = accounts.filter((a) => a.identifiant !== identifiant);
    await this.saveAccounts(accounts);
    return accounts;
  }

  static async getActiveStudentId(): Promise<number | "family"> {
    try {
      const id = await AsyncStorage.getItem(ACTIVE_STUDENT_KEY);
      if (id === "family") return "family";
      if (id) {
        const parsed = parseInt(id, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      const accs = await this.getAccounts();
      if (accs.length > 0 && accs[0].eleves && accs[0].eleves.length > 0) {
        return accs[0].eleves[0].id;
      }
      return 7104;
    } catch {
      return 7104;
    }
  }

  static async saveActiveStudentId(id: number | "family"): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_STUDENT_KEY, id.toString());
  }

  static async getCached(key: string): Promise<any | null> {
    try {
      const item = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  static async setCached(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
    } catch {}
  }
}
