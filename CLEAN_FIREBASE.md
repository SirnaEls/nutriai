# Guide pour nettoyer la base de données Firebase

## 🗑️ Méthode 1 : Via la console Firebase (Recommandé)

1. **Accédez à Firebase Console**
   - Allez sur https://console.firebase.google.com/
   - Sélectionnez votre projet `nutriai-20c35`

2. **Supprimez les collections une par une**
   - Allez dans **Firestore Database**
   - Pour chaque collection, cliquez sur le nom de la collection
   - Sélectionnez tous les documents (ou ceux que vous voulez supprimer)
   - Cliquez sur "Supprimer"

   Collections à nettoyer :
   - `users` : Tous les utilisateurs de test
   - `foodEntries` : Toutes les entrées de repas de test
   - `chatMessages` : Tous les messages de chat de test
   - `weightEntries` : Toutes les entrées de poids de test

## 🗑️ Méthode 2 : Supprimer toutes les collections (Attention !)

Si vous voulez tout supprimer d'un coup :

1. Dans Firestore Database
2. Cliquez sur chaque collection
3. Utilisez le menu "..." → "Supprimer la collection"
4. Confirmez la suppression

**⚠️ ATTENTION** : Cette action est irréversible !

## 🗑️ Méthode 3 : Via Firebase CLI (Avancé)

Si vous avez Firebase CLI installé :

```bash
# Installer Firebase CLI si nécessaire
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser (si pas déjà fait)
firebase init firestore

# Supprimer toutes les données (ATTENTION !)
# Cette commande supprime TOUT dans Firestore
firebase firestore:delete --all-collections --project nutriai-20c35
```

## ✅ Vérification après nettoyage

1. Vérifiez que toutes les collections sont vides
2. Testez la création d'un nouveau compte utilisateur
3. Vérifiez que les données sont bien sauvegardées pour le nouveau compte

## 🔒 Après le nettoyage

Assurez-vous que les règles Firestore sont bien configurées (voir `FIRESTORE_RULES.md`) pour que seuls les utilisateurs authentifiés puissent accéder à leurs propres données.

