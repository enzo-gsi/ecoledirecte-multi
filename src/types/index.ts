export interface Student {
  id: number;
  nom: string;
  prenom: string;
  classe: {
    id?: number;
    code?: string;
    libelle?: string;
  };
  photo?: string;
  nomEtablissement: string;
  accountIdentifiant: string;
}

export interface Account {
  id: number;
  identifiant: string;
  nom: string;
  prenom: string;
  typeCompte: string; // "1" = Famille/Parent, "E" = Elève
  nomEtablissement: string;
  token?: string;
  password?: string;
  anneeScolaireCourante?: string;
  fa?: {
    cn: string;
    cv: string;
  };
  eleves: Student[];
}

export interface HomeworkItem {
  id: number;
  matiere: string;
  codeMatiere: string;
  aFaire: {
    id: number;
    contenu: string;
    donneLe: string;
    effectue: boolean;
    rendreEnLigne?: boolean;
  };
  date: string; // YYYY-MM-DD
  interrogation?: boolean;
  studentId: number;
  studentName?: string;
}

export interface GradeItem {
  id: number;
  devoir: string;
  codeMatiere: string;
  discipline: string;
  date: string;
  valeur: string;
  noteSur: string;
  coef: string;
  nonSignificatif: boolean;
  moyenneClasse?: string;
  min?: string;
  max?: string;
  studentId: number;
  studentName?: string;
}

export interface SubjectGrades {
  codeMatiere: string;
  discipline: string;
  moyenne?: string;
  moyenneClasse?: string;
  notes: GradeItem[];
}

export interface TimetableItem {
  id: number;
  matiere: string;
  codeMatiere: string;
  prof: string;
  salle: string;
  start_date: string; // YYYY-MM-DD HH:mm
  end_date: string;   // YYYY-MM-DD HH:mm
  is_annule?: boolean;
  is_modifie?: boolean;
  couleur?: string;
  studentId: number;
  studentName?: string;
}

export interface MessageItem {
  id: number;
  date: string;
  expediteur: string;
  sujet: string;
  lu: boolean;
  contenu?: string;
  studentId?: number;
  studentName?: string;
  familyId?: number;
  recipientType?: "parent" | "eleve";
}

export interface CantineWallet {
  solde: string;
  numeroBadge?: string;
  repasRestants?: number;
  dernierPassage?: string;
  historique?: Array<{ date: string; libelle: string; montant: string }>;
  studentId: number;
  studentName?: string;
  nonConfigure?: boolean;
}

export interface VieScolaireItem {
  id: number;
  type: "absence" | "retard" | "sanction";
  date: string;
  duree?: string;
  motif?: string;
  justifie: boolean;
  studentId: number;
  studentName?: string;
}

export interface MFAChallenge {
  token: string;
  question: string;
  propositions: string[];
  username: string;
  password: string;
}
