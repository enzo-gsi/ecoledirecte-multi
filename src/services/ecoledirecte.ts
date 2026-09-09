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
} from "../types/index";

const API_BASE = "https://api.ecoledirecte.com/v3";
const API_VERSION = "8.0.0";
const USER_AGENT =
  "BlocksDirecte/1.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148  EDMOBILE v" +
  API_VERSION;

export function cleanJSON(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  const cleaned: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        cleaned[key] = cleanJSON(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  return cleaned;
}

// CP1252 / Windows-1252 mapping for decimal codes 128..159 (frequent in French school softwares)
const CP1252_MAP: Record<number, string> = {
  128: "€", 130: "‚", 131: "ƒ", 132: "„", 133: "…", 134: "†", 135: "‡",
  136: "ˆ", 137: "‰", 138: "Š", 139: "‹", 140: "Œ", 142: "Ž",
  145: "‘", 146: "’", 147: "“", 148: "”", 149: "•", 150: "–", 151: "—",
  152: "˜", 153: "™", 154: "š", 155: "›", 156: "œ", 158: "ž", 159: "Ÿ",
};

const NAMED_HTML_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", hellip: "…",
  bull: "•", ndash: "–", mdash: "—", oelig: "œ", OElig: "Œ", euro: "€",
  laquo: "«", raquo: "»", deg: "°",
  agrave: "à", Agrave: "À", aacute: "á", Aacute: "Á", acirc: "â", Acirc: "Â",
  atilde: "ã", Atilde: "Ã", auml: "ä", Auml: "Ä", aring: "å", Aring: "Å",
  aelig: "æ", AElig: "Æ", ccedil: "ç", Ccedil: "Ç",
  egrave: "è", Egrave: "È", eacute: "é", Eacute: "É", ecirc: "ê", Ecirc: "Ê",
  euml: "ë", Euml: "Ë", igrave: "ì", Igrave: "Ì", iacute: "í", Iacute: "Í",
  icirc: "î", Icirc: "Î", iuml: "ï", Iuml: "Ï", ntilde: "ñ", Ntilde: "Ñ",
  ograve: "ò", Ograve: "Ò", oacute: "ó", Oacute: "Ó", ocirc: "ô", Ocirc: "Ô",
  otilde: "õ", Otilde: "Õ", ouml: "ö", Ouml: "Ö",
  ugrave: "ù", Ugrave: "Ù", uacute: "ú", Uacute: "Ú", ucirc: "û", Ucirc: "Û",
  uuml: "ü", Uuml: "Ü", yacute: "ý", Yacute: "Ý", yuml: "ÿ",
};

export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return CP1252_MAP[code] || String.fromCharCode(code);
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return CP1252_MAP[code] || String.fromCharCode(code);
    })
    .replace(/&([a-zA-Z]+);/g, (match, entity) => {
      return NAMED_HTML_ENTITIES[entity] !== undefined ? NAMED_HTML_ENTITIES[entity] : match;
    });
}

// Base64 helper compatible with Hermes/React Native & robust UTF-8 decoding
export function base64Decode(str: string): string {
  if (!str) return "";
  try {
    const cleaned = String(str).replace(/\s/g, "");
    let rawBinary = "";

    if (typeof atob === "function") {
      rawBinary = atob(cleaned);
    } else {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let padCleaned = cleaned.replace(/=+$/, "");
      for (
        let bc = 0, bs: number | undefined, buffer: number | undefined, idx = 0;
        (buffer = padCleaned.charCodeAt(idx++));
        ~buffer && ((bs = bc % 4 ? (bs! * 64) + buffer : buffer), bc++ % 4)
          ? (rawBinary += String.fromCharCode(255 & (bs! >> ((-2 * bc) & 6))))
          : 0
      ) {
        buffer = chars.indexOf(String.fromCharCode(buffer));
      }
    }

    // Try decoding standard UTF-8 sequence
    try {
      const utf8Text = decodeURIComponent(escape(rawBinary));
      return decodeHtmlEntities(utf8Text);
    } catch {
      // Fallback: Latin-1/CP1252 raw binary
      return decodeHtmlEntities(rawBinary);
    }
  } catch {
    return decodeHtmlEntities(str);
  }
}

export function base64Encode(str: string): string {
  try {
    const utf8Str = unescape(encodeURIComponent(str));
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    for (
      let block = 0, charCode: number, idx = 0, map = chars;
      utf8Str.charAt(idx | 0) || ((map = "="), idx % 1);
      output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
    ) {
      charCode = utf8Str.charCodeAt((idx += 3 / 4));
      if (charCode > 0xff) throw new Error("Invalid character");
      block = (block << 8) | charCode;
    }
    return output;
  } catch {
    return btoa(unescape(encodeURIComponent(str)));
  }
}

export function stripHtml(html: string): string {
  if (!html) return "";
  const withoutTags = html
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeHtmlEntities(withoutTags).trim();
}

class EcoleDirecteClient {
  private activeToken: string = "";
  private knownAccount: Account | null = null;
  private registeredAccounts: Map<string, Account> = new Map();
  private reloginPromises: Map<string, Promise<string | null>> = new Map();
  private onTokenRefresh?: (account: Account) => void;

  setTokenRefreshListener(callback: (account: Account) => void) {
    this.onTokenRefresh = callback;
  }

  getActiveToken(): string {
    return this.activeToken;
  }

  registerAccount(account: Account) {
    if (!account || !account.identifiant) return;
    const key = account.identifiant.toLowerCase();
    this.registeredAccounts.set(key, { ...account });
    if (!this.knownAccount) {
      this.knownAccount = account;
    }
    if (account.token) {
      this.activeToken = account.token;
    }
  }

  registerAccounts(accounts: Account[]) {
    if (Array.isArray(accounts)) {
      for (const acc of accounts) {
        this.registerAccount(acc);
      }
    }
  }

  setActiveAccount(account: Account) {
    this.registerAccount(account);
    if (account.token) {
      this.activeToken = account.token;
    }
  }

  resolveAccountForRequest(endpoint: string, token?: string): Account | null {
    // 1. By token match
    if (token) {
      for (const acc of this.registeredAccounts.values()) {
        if (acc.token === token) return acc;
      }
    }

    // 2. By student ID in endpoint (e.g. /eleves/123/ or /E/123/)
    const studentMatch = endpoint.match(/\/(?:eleves|E)\/(\d+)/i);
    if (studentMatch && studentMatch[1]) {
      const sId = parseInt(studentMatch[1], 10);
      for (const acc of this.registeredAccounts.values()) {
        if (acc.eleves && acc.eleves.some((e) => e.id === sId)) {
          return acc;
        }
      }
    }

    // 3. By family ID in endpoint (e.g. /familles/123/)
    const familyMatch = endpoint.match(/\/familles\/(\d+)/i);
    if (familyMatch && familyMatch[1]) {
      const fId = parseInt(familyMatch[1], 10);
      for (const acc of this.registeredAccounts.values()) {
        if (acc.id === fId) return acc;
      }
    }

    // 4. Default fallback to known account or first registered
    return this.knownAccount || (this.registeredAccounts.values().next().value ?? null);
  }

  private async request(
    endpoint: string,
    verb: "get" | "post" | "put" | "delete" | "getall" = "post",
    payload: any = {},
    token?: string,
    extraParams?: string,
    headersOverride?: Record<string, string>,
    isRetry: boolean = false
  ): Promise<{ data: any; code: number; message?: string; token?: string; headers: Headers }> {
    const hasVerbe = endpoint.includes("verbe=") || (extraParams && extraParams.includes("verbe="));
    const hasV = endpoint.includes("v=") || (extraParams && extraParams.includes("v="));

    const queryParts: string[] = [];
    if (!hasVerbe) {
      queryParts.push(`verbe=${verb}`);
    }
    if (!hasV) {
      queryParts.push(`v=${API_VERSION}`);
    }
    if (extraParams) {
      queryParts.push(extraParams);
    }

    const queryString = queryParts.join("&");
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = queryString ? `${API_BASE}${endpoint}${sep}${queryString}` : `${API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      ...headersOverride,
    };

    const effectiveToken = token || this.activeToken;
    if (effectiveToken && !headers["X-Token"] && !headers["2fa-token"] && !headers["2FA-Token"]) {
      headers["X-Token"] = effectiveToken;
    }

    // Formatage officiel de BlocksDirecte / Papillon avec URLSearchParams
    const body = new URLSearchParams({
      data: JSON.stringify(cleanJSON(payload)),
    }).toString();

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const resToken =
      res.headers.get("x-token") ||
      res.headers.get("X-Token") ||
      res.headers.get("2fa-token") ||
      res.headers.get("2FA-Token") ||
      undefined;

    if (resToken && resToken.length > 10) {
      const matched = this.resolveAccountForRequest(endpoint, effectiveToken);
      if (matched) {
        matched.token = resToken;
        this.registerAccount(matched);
        if (this.onTokenRefresh) {
          this.onTokenRefresh(matched);
        }
      }
      if (!token || (matched && this.knownAccount && matched.identifiant === this.knownAccount.identifiant)) {
        this.activeToken = resToken;
        if (this.knownAccount) {
          this.knownAccount.token = resToken;
        }
      }
    }

    let json: any = {};
    try {
      json = await res.json();
    } catch {
      json = { code: res.status, message: "Erreur de format de réponse." };
    }

    // Auto-reconnexion transparente protégée par Mutex par compte (une seule connexion par compte)
    if (
      !isRetry &&
      (json.code === 520 || json.code === 525 || (typeof json.message === "string" && json.message.toLowerCase().includes("token"))) &&
      !endpoint.includes("login.awp") &&
      !endpoint.includes("doubleauth.awp")
    ) {
      const targetAccount = this.resolveAccountForRequest(endpoint, effectiveToken) || this.knownAccount;
      if (targetAccount && targetAccount.password) {
        console.log(`[REQUEST] Token expiré ou invalide (code ${json.code}) sur ${endpoint}. Reconnexion automatique pour ${targetAccount.identifiant}...`);
        const freshToken = await this.relogin(targetAccount);
        if (freshToken) {
          // Réessayer une SEULE fois avec le token valide pour ce compte
          return this.request(endpoint, verb, payload, freshToken, extraParams, headersOverride, true);
        }
      }
    }

    return {
      data: json.data,
      code: json.code,
      message: json.message,
      token: resToken || json.token,
      headers: res.headers,
    };
  }

  /**
   * Connexion principale avec support GTK et 2FA
   */
  async login(
    username: string,
    password: string,
    fa?: { cn: string; cv: string }
  ): Promise<
    | { status: "success"; account: Account; token: string }
    | { status: "mfa_required"; challenge: MFAChallenge }
    | { status: "error"; message: string }
  > {
    try {
      const payload: any = {
        identifiant: username,
        motdepasse: password,
        isRelogin: false,
        uuid: "",
      };

      if (fa?.cn && fa?.cv) {
        payload.fa = [{ cn: fa.cn, cv: fa.cv }];
        payload.cn = fa.cn;
        payload.cv = fa.cv;
      }

      const res = await this.request(
        "/login.awp",
        "post",
        payload
      );

      if (res.code === 200) {
        const primaryAccount = res.data.accounts[0];
        const token = res.token || "";

        // Récupération exhaustive de tous les enfants rattachés au(x) compte(s)
        const eleves: Student[] = [];
        for (let aIdx = 0; aIdx < res.data.accounts.length; aIdx++) {
          const edAccount = res.data.accounts[aIdx];
          const nomEtab =
            edAccount.profile?.nomEtablissement ||
            edAccount.nomEtablissement ||
            "Établissement non spécifié";

          if (
            edAccount.profile?.eleves &&
            Array.isArray(edAccount.profile.eleves) &&
            edAccount.profile.eleves.length > 0
          ) {
            const cleanPhoto = (p?: string) => {
              if (!p || p === "undefined" || typeof p !== "string") return undefined;
              const trimmed = p.trim();
              if (!trimmed) return undefined;
              if (trimmed.startsWith("//")) return `https:${trimmed}`;
              if (!trimmed.startsWith("http")) return `https://${trimmed}`;
              return trimmed;
            };

            // Compte Parent
            for (let i = 0; i < edAccount.profile.eleves.length; i++) {
              const el = edAccount.profile.eleves[i];
              const parsedId = Number(el.id || el.idEleve || el.eleveId) || (50000 + (aIdx * 10) + i + 1);
              eleves.push({
                id: parsedId,
                nom: el.nom || edAccount.nom,
                prenom: el.prenom || `Élève ${i + 1}`,
                classe: el.classe || { libelle: "Classe non renseignée" },
                photo: cleanPhoto(el.photo),
                nomEtablissement: el.nomEtablissement || nomEtab,
                accountIdentifiant: username,
              });
            }
          } else {
            // Compte Élève direct
            const cleanPhoto = (p?: string) => {
              if (!p || p === "undefined" || typeof p !== "string") return undefined;
              const trimmed = p.trim();
              if (!trimmed) return undefined;
              if (trimmed.startsWith("//")) return `https:${trimmed}`;
              if (!trimmed.startsWith("http")) return `https://${trimmed}`;
              return trimmed;
            };
            const parsedId = Number(edAccount.id || edAccount.idEleve) || (50000 + aIdx + 1);
            eleves.push({
              id: parsedId,
              nom: edAccount.nom,
              prenom: edAccount.prenom,
              classe: edAccount.profile?.classe || { libelle: "" },
              photo: cleanPhoto(edAccount.profile?.photo || edAccount.photo),
              nomEtablissement: nomEtab,
              accountIdentifiant: username,
            });
          }
        }

        const account: Account = {
          id: primaryAccount.id,
          identifiant: username,
          nom: primaryAccount.nom,
          prenom: primaryAccount.prenom,
          typeCompte: primaryAccount.typeCompte,
          nomEtablissement:
            primaryAccount.profile?.nomEtablissement ||
            primaryAccount.nomEtablissement ||
            "Établissement non spécifié",
          anneeScolaireCourante: primaryAccount.anneeScolaireCourante,
          token,
          password,
          fa,
          eleves,
        };

        return { status: "success", account, token };
      } else if (res.code === 250) {
        // Double authentification requise (QCM 2FA)
        const token2FA =
          res.headers.get("2fa-token") ||
          res.headers.get("2FA-Token") ||
          res.token ||
          "";

        const mfaData = await this.getMFAQuestions(token2FA);

        return {
          status: "mfa_required",
          challenge: {
            token: token2FA,
            question: mfaData.question,
            propositions: mfaData.propositions,
            username,
            password,
          },
        };
      } else {
        return {
          status: "error",
          message: res.message || "Identifiant ou mot de passe incorrect.",
        };
      }
    } catch (err: any) {
      return {
        status: "error",
        message: err.message || "Erreur de connexion à ÉcoleDirecte.",
      };
    }
  }

  async getMFAQuestions(token2FA: string): Promise<{ question: string; propositions: string[] }> {
    const res = await this.request(
      "/connexion/doubleauth.awp",
      "get",
      {},
      undefined,
      undefined,
      {
        "2FA-Token": token2FA,
      }
    );

    if (res.code === 200 && res.data && res.data.question) {
      const question = base64Decode(res.data.question);
      const propositions = (res.data.propositions || []).map((p: string) => base64Decode(p));
      return { question, propositions };
    }
    throw new Error("Impossible de récupérer la question de sécurité.");
  }

  async answerMFA(
    challenge: MFAChallenge,
    selectedChoice: string
  ): Promise<
    | { status: "success"; account: Account; token: string }
    | { status: "error"; message: string }
  > {
    try {
      const b64Choice = base64Encode(selectedChoice);
      const res = await this.request(
        "/connexion/doubleauth.awp",
        "post",
        { choix: b64Choice },
        undefined,
        undefined,
        {
          "2FA-Token": challenge.token,
        }
      );

      if (res.code === 200 && res.data?.cn && res.data?.cv) {
        const fa = { cn: res.data.cn, cv: res.data.cv };
        // Relogin avec tokens fa de confiance
        const loginRes = await this.login(challenge.username, challenge.password, fa);
        if (loginRes.status === "success") {
          loginRes.account.fa = fa;
          return loginRes;
        }
        return { status: "error", message: "Erreur lors de la finalisation de la connexion." };
      } else {
        return { status: "error", message: res.message || "Réponse de sécurité incorrecte." };
      }
    } catch (err: any) {
      return { status: "error", message: err.message || "Erreur lors de la validation." };
    }
  }

  /**
   * Reconnexion silencieuse avec les clés 2FA mémorisées (protégée par Mutex par compte)
   */
  async relogin(account: Account): Promise<string | null> {
    const key = (account.identifiant || "").toLowerCase();
    if (!key) return null;
    const existingPromise = this.reloginPromises.get(key);
    if (existingPromise) {
      console.log(`[RELOGIN] Reconnexion déjà en cours pour ${account.identifiant}, attente du résultat...`);
      return existingPromise;
    }

    const reloginPromise = (async () => {
      try {
        const username = account.identifiant;
        const pass = account.password || "";
        if (!username || !pass) return null;

        const fa = account.fa;

        console.log(`[RELOGIN] Reconnexion unique en cours pour ${username}...`);
        const res = await this.login(username, pass, fa);
        if (res.status === "success") {
          account.token = res.token;
          account.password = pass;
          account.fa = fa;
          this.registerAccount(account);
          if (this.knownAccount && username === this.knownAccount.identifiant) {
            this.activeToken = res.token;
            this.knownAccount.token = res.token;
          }
          if (this.onTokenRefresh) {
            this.onTokenRefresh(account);
          }
          console.log(`[RELOGIN] Reconnexion réussie pour ${username}, nouveau token unique obtenu.`);
          return res.token;
        }
      } catch (e) {
        console.warn(`[RELOGIN] Échec reconnexion automatique pour ${account.identifiant}`, e);
      } finally {
        this.reloginPromises.delete(key);
      }
      return null;
    })();

    this.reloginPromises.set(key, reloginPromise);
    return reloginPromise;
  }

  /**
   * Cahier de texte / Devoirs
   */
  async getHomeworks(studentId: number, token: string): Promise<HomeworkItem[]> {
    const res = await this.request(`/Eleves/${studentId}/cahierdetexte.awp`, "get", {}, token);

    if (res.code !== 200 || !res.data) {
      return [];
    }

    const result: HomeworkItem[] = [];
    const rawDates = res.data;
    const dateKeys = Object.keys(rawDates);

    // Récupération en parallèle du détail de chaque date pour obtenir les vraies consignes
    const dateDetailsMap = new Map<string, any>();
    try {
      const detailsList = await Promise.all(
        dateKeys.map(async (dateKey) => {
          try {
            const detailRes = await this.request(
              `/Eleves/${studentId}/cahierdetexte/${dateKey}.awp`,
              "get",
              {},
              token
            );
            return { dateKey, data: detailRes.code === 200 ? detailRes.data : null };
          } catch {
            return { dateKey, data: null };
          }
        })
      );
      for (const d of detailsList) {
        if (d.data) dateDetailsMap.set(d.dateKey, d.data);
      }
    } catch (errDetails) {
      console.warn("[HW] Erreur lors du chargement des détails par date", errDetails);
    }

    for (const dateKey of dateKeys) {
      const detailedData = dateDetailsMap.get(dateKey);
      const dayTasks = rawDates[dateKey];

      if (detailedData && Array.isArray(detailedData.matieres) && detailedData.matieres.length > 0) {
        for (let idx = 0; idx < detailedData.matieres.length; idx++) {
          const m = detailedData.matieres[idx];
          const hasAf = !!m.aFaire;
          const matchesTask =
            Array.isArray(dayTasks) &&
            dayTasks.some(
              (t: any) =>
                (t.idDevoir && (t.idDevoir === m.id || t.idDevoir === m.aFaire?.idDevoir)) ||
                (t.matiere && t.matiere === m.matiere)
            );

          // Garder uniquement les cours qui ont un devoir à faire ou listé dans l'aperçu
          if (!hasAf && !matchesTask) continue;

          const af = m.aFaire;
          let description = "";

          if (af?.contenu) {
            description = stripHtml(base64Decode(af.contenu));
          }
          if (!description && af?.contenuDeSeance?.contenu) {
            description = stripHtml(base64Decode(af.contenuDeSeance.contenu));
          }
          if (!description && m.contenuDeSeance?.contenu) {
            description = stripHtml(base64Decode(m.contenuDeSeance.contenu));
          }
          if (!description || description.trim() === "<br>") {
            description = "Consulter le cahier de texte pour les détails.";
          }

          const devoirId = Number(af?.idDevoir || m.id || idx + 1);
          const isDone = af?.effectue !== undefined ? !!af.effectue : false;
          const donneLe = af?.donneLe || dateKey;

          result.push({
            id: devoirId,
            matiere: m.matiere || m.entityLibelle || "Devoir",
            codeMatiere: m.codeMatiere || "",
            aFaire: {
              id: devoirId,
              contenu: description,
              donneLe,
              effectue: isDone,
              rendreEnLigne: af?.rendreEnLigne,
            },
            date: dateKey,
            interrogation: !!m.interrogation,
            studentId,
          });
        }
      } else if (Array.isArray(dayTasks)) {
        // Fallback sur le résumé global
        for (let idx = 0; idx < dayTasks.length; idx++) {
          const task = dayTasks[idx];
          result.push({
            id: task.idDevoir || task.id || idx + 1,
            matiere: task.matiere || "Devoir",
            codeMatiere: task.codeMatiere || "",
            aFaire: {
              id: task.idDevoir || task.id || idx + 1,
              contenu: "Consulter le cahier de texte pour les détails.",
              donneLe: task.donneLe || "",
              effectue: !!task.effectue,
              rendreEnLigne: task.rendreEnLigne,
            },
            date: dateKey,
            interrogation: task.interrogation,
            studentId,
          });
        }
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  async setHomeworkStatus(
    studentId: number,
    homeworkId: number,
    isDone: boolean,
    token: string
  ): Promise<boolean> {
    const payload = isDone
      ? { idDevoirsEffectues: [homeworkId], idDevoirsNonEffectues: [] }
      : { idDevoirsEffectues: [], idDevoirsNonEffectues: [homeworkId] };

    const res = await this.request(
      `/Eleves/${studentId}/cahierdetexte.awp`,
      "put",
      payload,
      token
    );
    return res.code === 200;
  }

  /**
   * Notes & Moyennes
   */
  async getGrades(
    studentId: number,
    token: string
  ): Promise<{
    periodes: any[];
    notes: GradeItem[];
    subjects: SubjectGrades[];
    moyenneGenerale?: string;
    moyenneClasse?: string;
  }> {
    const res = await this.request(
      `/eleves/${studentId}/notes.awp`,
      "get",
      { anneeScolaire: "" },
      token
    );

    if (res.code !== 200 || !res.data) {
      return { periodes: [], notes: [], subjects: [] };
    }

    const notesList: GradeItem[] = [];
    const subjectsMap = new Map<string, SubjectGrades>();

    const rawNotes = res.data.notes || [];
    for (const n of rawNotes) {
      const item: GradeItem = {
        id: n.id,
        devoir: n.devoir || n.libelleDevoir || "Évaluation",
        codeMatiere: n.codeMatiere || "",
        discipline: n.discipline || n.libelleMatiere || "Matière",
        date: n.date || n.dateSaisie || "",
        valeur: n.valeur || "",
        noteSur: n.noteSur || "20",
        coef: n.coef || "1",
        nonSignificatif: !!n.nonSignificatif,
        moyenneClasse: n.moyenneClasse,
        min: n.min,
        max: n.max,
        studentId,
      };
      notesList.push(item);

      if (!subjectsMap.has(item.codeMatiere)) {
        subjectsMap.set(item.codeMatiere, {
          codeMatiere: item.codeMatiere,
          discipline: item.discipline,
          notes: [],
        });
      }
      subjectsMap.get(item.codeMatiere)?.notes.push(item);
    }

    const currentPeriod = (res.data.periodes || [])[0];
    const ensembleMoyenne = currentPeriod?.ensembleMatieres;

    if (ensembleMoyenne?.disciplines) {
      for (const disc of ensembleMoyenne.disciplines) {
        if (subjectsMap.has(disc.codeMatiere)) {
          const sub = subjectsMap.get(disc.codeMatiere)!;
          sub.moyenne = disc.moyenne;
          sub.moyenneClasse = disc.moyenneClasse;
        }
      }
    }

    return {
      periodes: res.data.periodes || [],
      notes: notesList.sort((a, b) => b.date.localeCompare(a.date)),
      subjects: Array.from(subjectsMap.values()),
      moyenneGenerale: ensembleMoyenne?.moyenneGenerale,
      moyenneClasse: ensembleMoyenne?.moyenneClasse,
    };
  }

  /**
   * Emploi du temps
   */
  async getTimetable(
    studentId: number,
    startDate: string,
    endDate: string,
    token: string,
    _familyId?: number
  ): Promise<TimetableItem[]> {
    const payload = {
      dateDebut: startDate,
      dateFin: endDate,
      avecTrous: false,
    };

    // Candidates d'endpoints officiels ÉcoleDirecte
    const candidates: Array<{ endpoint: string; verb: "get" | "post" }> = [
      { endpoint: `/E/${studentId}/emploidutemps.awp`, verb: "get" },
      { endpoint: `/eleves/${studentId}/emploidutemps.awp`, verb: "get" },
      { endpoint: `/E/${studentId}/emploidutemps.awp`, verb: "post" },
    ];

    let foundData: any = null;

    for (const c of candidates) {
      try {
        const currentToken = token || this.activeToken;
        const res = await this.request(c.endpoint, c.verb, payload, currentToken);
        if (res.code === 200 && res.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data.cours)
            ? res.data.cours
            : Array.isArray(res.data.lessons)
            ? res.data.lessons
            : Array.isArray(res.data.data)
            ? res.data.data
            : [];
          foundData = list;
          break;
        }
      } catch (e) {
        console.warn(`[EDT] Erreur sur ${c.endpoint}`, e);
      }
    }

    if (!foundData || !Array.isArray(foundData)) {
      return [];
    }

    const items: TimetableItem[] = [];
    for (const c of foundData) {
      const startDateRaw =
        c.start_date ||
        c.startDate ||
        c.start ||
        (c.date && c.heureDebut ? `${c.date} ${c.heureDebut}` : c.date) ||
        "";
      const endDateRaw =
        c.end_date ||
        c.endDate ||
        c.end ||
        (c.date && c.heureFin ? `${c.date} ${c.heureFin}` : "") ||
        "";

      items.push({
        id: c.id,
        matiere: c.matiere || c.text || c.libelleMatiere || c.discipline || "Cours",
        codeMatiere: c.codeMatiere || "",
        prof: c.prof || c.enseignant || c.nomProfesseur || "",
        salle: c.salle || c.nomSalle || "",
        start_date: startDateRaw,
        end_date: endDateRaw,
        is_annule: !!c.is_annule || !!c.isAnnule || !!c.annule,
        is_modifie: !!c.is_modifie || !!c.isModifie || !!c.modifie,
        couleur: c.color || c.couleur || "#2563EB",
        studentId,
      });
    }

    return items.sort((a, b) => a.start_date.localeCompare(b.start_date));
  }

  /**
   * Messagerie ÉcoleDirecte (compatible Parents / Familles et Élèves)
   */
  async getMessages(
    target: number | { studentId?: number; familyId?: number; anneeScolaire?: string },
    token: string,
    legacyFamilyId?: number
  ): Promise<MessageItem[]> {
    let studentId: number | undefined;
    let familyId: number | undefined;
    let anneeScolaire: string | undefined;

    if (typeof target === "number") {
      studentId = target;
      if (legacyFamilyId) familyId = legacyFamilyId;
    } else if (target) {
      studentId = target.studentId;
      familyId = target.familyId;
      anneeScolaire = target.anneeScolaire;
    }

    const allMessages: MessageItem[] = [];
    const seenKeys = new Set<string>();

    const extra = "force=false&typeRecuperation=received&idClasseur=0&orderBy=date&order=desc&query=&onlyRead=&page=0&itemsPerPage=100&getAll=0";

    const endpointsToTry: Array<{
      ep: string;
      recipientType: "parent" | "eleve";
      targetStudentId?: number;
      targetFamilyId?: number;
    }> = [];

    if (familyId) {
      endpointsToTry.push({
        ep: `/familles/${familyId}/messages.awp`,
        recipientType: "parent",
        targetFamilyId: familyId,
        targetStudentId: studentId,
      });
    }
    if (studentId) {
      endpointsToTry.push({
        ep: `/eleves/${studentId}/messages.awp`,
        recipientType: "eleve",
        targetStudentId: studentId,
        targetFamilyId: familyId,
      });
    }

    for (const { ep, recipientType, targetStudentId, targetFamilyId } of endpointsToTry) {
      try {
        const currentToken = token || this.activeToken;
        const res = await this.request(ep, "get", { anneeMessages: "" }, currentToken, extra);

        const raw =
          res.data?.messages?.received ||
          res.data?.messages ||
          res.data?.received ||
          (Array.isArray(res.data) ? res.data : []);

        if (Array.isArray(raw)) {
          for (const m of raw) {
            const uniqueKey = `${recipientType}_${m.id}`;
            if (m && m.id && !seenKeys.has(uniqueKey)) {
              seenKeys.add(uniqueKey);

              const expediteurName = decodeHtmlEntities(
                [m.from?.civilite, m.from?.prenom, m.from?.nom].filter(Boolean).join(" ") ||
                m.from?.name ||
                m.expediteur ||
                m.sender?.name ||
                m.nomExpediteur ||
                "Établissement"
              );

              const rawSubject = m.subject || m.objet || m.libelle || m.titre || "Sans objet";
              const decodedSubject = decodeHtmlEntities(rawSubject);

              allMessages.push({
                id: m.id,
                date: m.date || m.dateEnvoi || m.dateCreation || m.dateReception || "",
                expediteur: expediteurName,
                sujet: decodedSubject,
                lu: m.read !== undefined ? !!m.read : m.lu !== undefined ? !!m.lu : true,
                contenu: m.content
                  ? stripHtml(base64Decode(m.content))
                  : m.contenu
                  ? decodeHtmlEntities(m.contenu)
                  : m.apercu
                  ? decodeHtmlEntities(m.apercu)
                  : undefined,
                studentId: targetStudentId,
                familyId: targetFamilyId,
                recipientType,
              });
            }
          }
        }
      } catch (e) {
        console.warn(`[MESSAGES] Erreur sur ${ep}`, e);
      }
    }

    return allMessages.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getMessageContent(
    messageId: number,
    token: string,
    studentId?: number,
    familyId?: number,
    recipientType?: "parent" | "eleve"
  ): Promise<string> {
    if (recipientType === "eleve" && studentId) {
      try {
        const res = await this.request(
          `/eleves/${studentId}/messages/${messageId}.awp`,
          "get",
          { anneeMessages: "" },
          token,
          "mode=destinataire"
        );
        if (res.code === 200 && res.data?.content) {
          return stripHtml(base64Decode(res.data.content));
        }
      } catch {}
    }

    if (familyId) {
      try {
        const res = await this.request(
          `/familles/${familyId}/messages/${messageId}.awp`,
          "get",
          { anneeMessages: "" },
          token,
          "mode=destinataire"
        );
        if (res.code === 200 && res.data?.content) {
          return stripHtml(base64Decode(res.data.content));
        }
      } catch {}
    }

    if (studentId) {
      try {
        const res = await this.request(
          `/eleves/${studentId}/messages/${messageId}.awp`,
          "get",
          { anneeMessages: "" },
          token,
          "mode=destinataire"
        );
        if (res.code === 200 && res.data?.content) {
          return stripHtml(base64Decode(res.data.content));
        }
      } catch {}
    }

    return "Contenu non disponible.";
  }

  /**
   * Vie scolaire
   */
  async getSchoolLife(studentId: number, token: string): Promise<VieScolaireItem[]> {
    const res = await this.request(`/eleves/${studentId}/viescolaire.awp`, "get", {}, token);

    if (res.code !== 200 || !res.data) {
      return [];
    }

    const items: VieScolaireItem[] = [];
    const absencesRetards = res.data.absencesRetards || [];

    for (const item of absencesRetards) {
      items.push({
        id: item.id,
        type: item.typeElement === "RETARD" ? "retard" : "absence",
        date: item.displayDate || item.date || "",
        duree: item.duree || "",
        motif: item.motif || "Non précisé",
        justifie: !!item.justifie,
        studentId,
      });
    }

    const sanctions = res.data.sanctionsEncouragements || [];
    for (const s of sanctions) {
      items.push({
        id: s.id,
        type: "sanction",
        date: s.date || "",
        motif: s.motif || s.libelle || "Sanction",
        justifie: true,
        studentId,
      });
    }

    return items;
  }

  /**
   * Cantine & Porte-monnaie (Support exhaustif des comptes Parents et Élèves)
   */
  async getCantineWallet(
    studentId: number,
    token: string,
    familyId?: number
  ): Promise<CantineWallet | null> {
    try {
      const endpointsToTry: Array<{ ep: string; verb: "get" | "post" }> = [
        { ep: "/comptes/detail.awp", verb: "get" },
        { ep: "/comptes/sansdetails.awp", verb: "get" },
      ];

      if (familyId) {
        endpointsToTry.push(
          { ep: `/familles/${familyId}/comptes.awp`, verb: "get" },
          { ep: `/familles/${familyId}/portemonnaie.awp`, verb: "get" }
        );
      }
      endpointsToTry.push(
        { ep: `/eleves/${studentId}/comptes.awp`, verb: "get" },
        { ep: `/eleves/${studentId}/portemonnaie.awp`, verb: "get" }
      );

      for (const item of endpointsToTry) {
        try {
          const currentToken = token || this.activeToken;
          const res = await this.request(item.ep, item.verb, {}, currentToken);

          if (res.code === 200 && res.data) {
            const rawComptes: any[] = [];
            if (Array.isArray(res.data.comptes)) rawComptes.push(...res.data.comptes);
            if (Array.isArray(res.data.soldes)) rawComptes.push(...res.data.soldes);
            if (Array.isArray(res.data.porteMonnaie)) rawComptes.push(...res.data.porteMonnaie);
            if (Array.isArray(res.data.portemonnaie)) rawComptes.push(...res.data.portemonnaie);
            if (Array.isArray(res.data)) rawComptes.push(...res.data);

            if (rawComptes.length > 0) {
              // 1. Compte restauration expressément associé à cet élève par son identifiant élève
              let picked = rawComptes.find(
                (c) =>
                  (Number(c.idEleve) === studentId || Number(c.id) === studentId) &&
                  (c.codeCompte === "PMRESTAURATION" ||
                    `${c.libelle || ""}`.toLowerCase().includes("restauration") ||
                    `${c.libelleCompte || ""}`.toLowerCase().includes("restauration"))
              );

              // 2. Compte portemonnaie expressément rattaché à cet élève
              if (!picked) {
                picked = rawComptes.find(
                  (c) =>
                    (Number(c.idEleve) === studentId || Number(c.id) === studentId) &&
                    (c.typeCompte === "portemonnaie" ||
                      `${c.libelle || ""}`.toLowerCase().includes("porte-monnaie") ||
                      `${c.libelle || ""}`.toLowerCase().includes("portemonnaie") ||
                      c.isPMPayable === true)
                );
              }

              // 3. Tout compte rattaché à cet élève ayant un solde
              if (!picked) {
                picked = rawComptes.find(
                  (c) =>
                    (Number(c.idEleve) === studentId || Number(c.id) === studentId) &&
                    (c.solde !== undefined || c.soldeActuel !== undefined || c.soldePorteMonnaie !== undefined || c.montant !== undefined)
                );
              }

              // 4. Si non trouvé par studentId (cas fréquent : compte avec un seul élève où l'établissement met idEleve=0 ou non spécifié)
              if (!picked) {
                picked = rawComptes.find(
                  (c) =>
                    (!c.idEleve || Number(c.idEleve) === 0 || Number(c.idEleve) === studentId) &&
                    (c.codeCompte === "PMRESTAURATION" ||
                      `${c.libelle || ""}`.toLowerCase().includes("restauration") ||
                      `${c.libelleCompte || ""}`.toLowerCase().includes("restauration") ||
                      c.typeCompte === "portemonnaie" ||
                      `${c.libelle || ""}`.toLowerCase().includes("porte-monnaie") ||
                      `${c.libelle || ""}`.toLowerCase().includes("portemonnaie") ||
                      c.isPMPayable === true)
                );
              }

              // 5. Tout compte avec un solde présent qui n'est pas expressément attribué à un autre id élève
              if (!picked) {
                picked = rawComptes.find(
                  (c) =>
                    (!c.idEleve || Number(c.idEleve) === 0 || Number(c.idEleve) === studentId) &&
                    (c.solde !== undefined || c.soldeActuel !== undefined || c.soldePorteMonnaie !== undefined || c.montant !== undefined)
                );
              }

              if (picked) {
                const rawVal =
                  picked.solde ??
                  picked.soldeActuel ??
                  picked.soldePorteMonnaie ??
                  picked.montant;
                const num =
                  typeof rawVal === "number"
                    ? rawVal
                    : parseFloat(String(rawVal || 0).replace(",", ".")) || 0;
                const soldeFormatted = `${num.toFixed(2).replace(".", ",")} €`;
                const repasRestants = num > 0 ? Math.floor(num / 4.5) : 0;
                const numeroBadge = String(
                  picked.codeCompte ||
                    picked.numeroBadge ||
                    picked.codeBadge ||
                    (picked.id ? `ED-${picked.id}` : `ED-${studentId}`)
                );

                // Aplatissement des écritures (y compris sous-écritures)
                const flatEcritures: Array<{
                  date: string;
                  libelle: string;
                  montant: string;
                  sortDate: string;
                }> = [];
                const topEcritures = Array.isArray(picked.ecritures) ? picked.ecritures : [];

                for (const e of topEcritures) {
                  if (Array.isArray(e.ecritures) && e.ecritures.length > 0) {
                    for (const sub of e.ecritures) {
                      const mNum =
                        typeof sub.montant === "number"
                          ? sub.montant
                          : parseFloat(String(sub.montant).replace(",", ".")) || 0;
                      const sign = mNum > 0 ? "+" : "";
                      flatEcritures.push({
                        date: sub.date || e.date || "",
                        sortDate: sub.date || e.date || "",
                        libelle: sub.libelle || e.libelle || "Consommation self",
                        montant: `${sign}${mNum.toFixed(2).replace(".", ",")} €`,
                      });
                    }
                  } else {
                    const mNum =
                      typeof e.montant === "number"
                        ? e.montant
                        : parseFloat(String(e.montant).replace(",", ".")) || 0;
                    const sign = mNum > 0 ? "+" : "";
                    flatEcritures.push({
                      date: e.date || "",
                      sortDate: e.date || "",
                      libelle: e.libelle || "Opération",
                      montant: `${sign}${mNum.toFixed(2).replace(".", ",")} €`,
                    });
                  }
                }

                // Tri décroissant par date
                flatEcritures.sort((a, b) => b.sortDate.localeCompare(a.sortDate));

                const historique = flatEcritures.slice(0, 10).map((h) => ({
                  date: h.date,
                  libelle: h.libelle,
                  montant: h.montant,
                }));

                const dernierPassage =
                  historique.length > 0 && historique[0].date
                    ? historique[0].date
                    : "Récemment";

                return {
                  solde: soldeFormatted,
                  numeroBadge,
                  repasRestants,
                  dernierPassage,
                  historique,
                  studentId,
                  nonConfigure: false,
                };
              }
            }
          }
        } catch (errEp) {
          console.warn(`[CANTINE] Erreur sur ${item.ep}`, errEp);
        }
      }

      // Si après tous les endpoints aucun porte-monnaie n'a été trouvé
      return {
        solde: "0,00 €",
        numeroBadge: `ED-${studentId}`,
        repasRestants: 0,
        dernierPassage: "Aucun passage",
        historique: [],
        studentId,
        nonConfigure: true,
      };
    } catch (e) {
      console.warn("[CANTINE] Erreur générale récupération solde cantine", e);
    }
    return null;
  }
}

export const ecoleDirecteService = new EcoleDirecteClient();
