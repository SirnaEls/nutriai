# Nettoyage complet Firebase pour la production

## 🎯 Objectif
Supprimer **TOUS** les utilisateurs de Firebase Authentication pour repartir de zéro en production.

## ⚠️ Important
- **Firestore** et **Firebase Authentication** sont deux services séparés
- Supprimer Firestore ne supprime PAS les utilisateurs d'Authentication
- Pour une suppression complète, il faut supprimer les deux

---

## Méthode 1 : Via la Console Firebase (RECOMMANDÉ pour quelques utilisateurs)

### Étapes :

1. **Allez sur [Firebase Console](https://console.firebase.google.com/)**
2. **Sélectionnez votre projet**
3. **Allez dans Authentication** (menu de gauche)
4. **Cliquez sur l'onglet "Users"**
5. **Supprimer tous les utilisateurs :**
   - **Option A - Un par un :**
     - Cliquez sur les 3 points (⋮) à droite de chaque utilisateur
     - Cliquez sur **"Delete user"**
     - Confirmez
   
   - **Option B - Plusieurs à la fois :**
     - Cochez la case en haut à gauche pour sélectionner tous
     - Cliquez sur **"Delete selected"** en haut
     - Confirmez la suppression

### ✅ Vérification
Après suppression, la liste des utilisateurs doit être vide. Vous pouvez maintenant créer de nouveaux comptes avec les mêmes emails.

---

## Méthode 2 : Via Script Node.js (pour beaucoup d'utilisateurs)

### Prérequis :

1. **Installer Firebase Admin SDK :**
   ```bash
   npm install firebase-admin
   ```

2. **Télécharger la clé de service :**
   - Allez sur Firebase Console > **Paramètres du projet** (⚙️)
   - Allez dans l'onglet **"Comptes de service"**
   - Cliquez sur **"Générer une nouvelle clé privée"**
   - Sauvegardez le fichier JSON (ex: `service-account-key.json`)
   - ⚠️ **IMPORTANT** : Ajoutez ce fichier au `.gitignore` pour ne pas le commiter !

3. **Mettre à jour le script :**
   - Ouvrez `scripts/delete-all-users.js`
   - Modifiez `SERVICE_ACCOUNT_PATH` pour pointer vers votre fichier JSON

4. **Exécuter le script :**
   ```bash
   node scripts/delete-all-users.js
   ```

### ⚠️ Sécurité
- **NE COMMITEZ JAMAIS** le fichier `service-account-key.json` dans Git
- Ajoutez-le au `.gitignore` :
  ```
  service-account-key.json
  *.json
  !package.json
  !tsconfig.json
  ```

---

## Méthode 3 : Supprimer le projet Firebase (RADICAL)

Si vous voulez tout supprimer et repartir de zéro :

1. **Firebase Console** > **Paramètres du projet**
2. **Faites défiler jusqu'en bas**
3. **Cliquez sur "Supprimer le projet"**
4. **Confirmez** (attention, c'est irréversible !)
5. **Créez un nouveau projet Firebase**
6. **Reconfigurez** avec les nouvelles clés

---

## Vérification après nettoyage

1. **Vérifier Authentication :**
   - Firebase Console > Authentication > Users
   - La liste doit être vide

2. **Vérifier Firestore :**
   - Firebase Console > Firestore Database
   - Toutes les collections doivent être vides

3. **Tester la création d'un compte :**
   - Essayez de créer un compte avec un email qui existait avant
   - Ça doit fonctionner sans erreur "email déjà utilisé"

---

## Checklist avant production

- [ ] Tous les utilisateurs supprimés de Firebase Authentication
- [ ] Toutes les collections Firestore vides (ou supprimées)
- [ ] Variables d'environnement configurées correctement
- [ ] Règles de sécurité Firestore configurées
- [ ] Test de création de compte fonctionnel
- [ ] Test de connexion fonctionnel

---

## Commandes utiles

```bash
# Vérifier que le script est prêt
node scripts/delete-all-users.js

# Si erreur de module manquant
npm install firebase-admin

# Vérifier le .gitignore
cat .gitignore | grep service-account
```

