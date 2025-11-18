# Règles Firestore pour la Production

## ✅ Règles recommandées (améliorées)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonction helper pour vérifier l'authentification
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Fonction helper pour vérifier que l'utilisateur est le propriétaire
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Fonction helper pour vérifier que le userId dans les données correspond à l'utilisateur connecté
    function isResourceOwner() {
      return isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Fonction helper pour vérifier que le userId dans les nouvelles données correspond à l'utilisateur connecté
    function isRequestResourceOwner() {
      return isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // ==================== PROFILS UTILISATEURS ====================
    // Utilisateurs : lecture/écriture uniquement pour le propriétaire
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // ==================== ENTRIES DE REPAS ====================
    match /foodEntries/{entryId} {
      // Créer : doit être authentifié et le userId doit correspondre
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      
      // Lire : doit être authentifié et le userId doit correspondre
      // Permet aussi les queries avec where("userId", "==", userId)
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Mettre à jour : doit être authentifié et le userId ne doit pas changer
      allow update: if isAuthenticated() 
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;
      
      // Supprimer : doit être authentifié et le userId doit correspondre
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // ==================== MESSAGES DE CHAT ====================
    match /chatMessages/{messageId} {
      // Créer : doit être authentifié et le userId doit correspondre
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      
      // Lire : doit être authentifié et le userId doit correspondre
      // Permet aussi les queries avec where("userId", "==", userId)
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Mettre à jour : doit être authentifié et le userId ne doit pas changer
      allow update: if isAuthenticated() 
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;
      
      // Supprimer : doit être authentifié et le userId doit correspondre
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // ==================== ENTRIES DE POIDS ====================
    match /weightEntries/{entryId} {
      // Créer : doit être authentifié et le userId doit correspondre
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      
      // Lire : doit être authentifié et le userId doit correspondre
      // Permet aussi les queries avec where("userId", "==", userId)
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Mettre à jour : doit être authentifié et le userId ne doit pas changer
      allow update: if isAuthenticated() 
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;
      
      // Supprimer : doit être authentifié et le userId doit correspondre
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🔍 Analyse de vos règles actuelles

### ✅ Points positifs :
1. **Authentification requise** : Toutes les opérations nécessitent une authentification
2. **Isolation des données** : Chaque utilisateur ne peut accéder qu'à ses propres données
3. **Vérification du userId** : Le userId est vérifié lors de la création

### ⚠️ Points à améliorer :

1. **Règles de lecture pour les queries** : 
   - Vos règles actuelles fonctionnent pour lire un document spécifique
   - Mais pour les queries (`where("userId", "==", userId)`), Firestore doit pouvoir évaluer la règle sur plusieurs documents
   - Les règles proposées ci-dessus gèrent cela correctement

2. **Protection contre la modification du userId** :
   - Ajout d'une vérification dans `update` pour empêcher de changer le `userId` d'un document

3. **Séparation claire des opérations** :
   - Séparation explicite de `create`, `read`, `update`, `delete` pour plus de clarté

## 🚀 Règles finales recommandées pour la production

Les règles ci-dessus sont **sécurisées pour la production** et permettent :
- ✅ Création de documents avec vérification du userId
- ✅ Lecture de documents individuels et via queries
- ✅ Mise à jour avec protection contre le changement de userId
- ✅ Suppression uniquement par le propriétaire
- ✅ Isolation complète des données entre utilisateurs

## 📝 Comment appliquer

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Firestore Database** > **Règles**
4. Copiez-collez les règles améliorées ci-dessus
5. Cliquez sur **Publier**

## ✅ Checklist avant production

- [ ] Règles Firestore configurées et publiées
- [ ] Test de création de document fonctionnel
- [ ] Test de lecture via query fonctionnel
- [ ] Test de mise à jour fonctionnel
- [ ] Test de suppression fonctionnel
- [ ] Vérification qu'un utilisateur ne peut pas accéder aux données d'un autre utilisateur

