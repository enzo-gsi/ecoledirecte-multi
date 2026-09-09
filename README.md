# 📱 ÉcoleDirecte Multi (iOS & iPhone)

Application mobile **100% native iOS** (React Native & Expo) conçue pour réunir plusieurs comptes et établissements **ÉcoleDirecte** dans une interface moderne et soignée, inspirée de l'application **Papillon**.

---

## ✨ Fonctionnalités Clés

- 🔄 **Sélecteur d'élèves en un tap** : basculez instantanément entre vos enfants (ex: *Lucas • Collège Saint-Joseph* et *Emma • Lycée Victor Hugo*) sans jamais vous déconnecter ni retaper de mot de passe.
- 🌟 **Vue Famille unifiée** : affichez sur un même écran les devoirs de demain et les dernières notes de tous vos enfants.
- 📚 **Cahier de texte interactif** : cochez vos devoirs comme faits avec retour haptique (vibration iOS native) et synchronisation en direct avec ÉcoleDirecte.
- 📊 **Notes & Moyennes** : visualisation des moyennes générales, moyennes de classe, min/max, coefficients et pastilles de couleur par matière.
- 📅 **Emploi du temps** : planning journalier avec détection des cours annulés ou modifiés.
- 🔐 **Sécurité & Confidentialité totale** : l'application communique en direct avec les serveurs officiels d'ÉcoleDirecte via HTTPS sans aucun serveur tiers intermédiaire. Vos identifiants restent stockés localement sur votre iPhone.
- 🛡️ **Support de la double authentification (2FA/QCM)** : gestion intégrée des questions de sécurité ÉcoleDirecte avec enregistrement du jeton de confiance pour les connexions futures.

---

## 🚀 Comment lancer l'application sur votre iPhone ?

### Étape 1 : Installer Expo Go sur votre iPhone
1. Ouvrez l'**App Store** sur votre iPhone.
2. Recherchez **Expo Go** (application officielle gratuite) et installez-la.

### Étape 2 : Lancer le serveur sur votre PC
Double-cliquez simplement sur **`demarrer.bat`** (ou lancez `npx expo start` dans votre terminal).

### Étape 3 : Scanner le QR Code
1. Assurez-vous que votre iPhone est connecté au même réseau Wi-Fi que votre ordinateur.
2. Ouvrez l'application **Appareil Photo** de votre iPhone et visez le QR Code affiché dans votre terminal.
3. Touchez la bannière jaune **"Ouvrir dans Expo Go"**.
4. L'application native se charge et tourne directement sur votre iPhone !

---

## 🛠️ Architecture Technique

- **Framework** : React Native (SDK Expo 57)
- **Typographie & Design** : Apple iOS Human Interface Guidelines (style Papillon)
- **Icônes** : Lucide React Native
- **Stockage local** : `@react-native-async-storage/async-storage`
- **Haptique** : `expo-haptics`
