# 🔐 Règles de Sécurité Firestore

Copiez-collez ces règles dans **Firebase Console > Firestore Database > Règles** :

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
    
    // Utilisateurs : lecture/écriture uniquement pour le propriétaire
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Entrées de repas : lecture/écriture uniquement pour le propriétaire
    match /foodEntries/{entryId} {
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Messages de chat : lecture/écriture uniquement pour le propriétaire
    match /chatMessages/{messageId} {
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Entrées de poids : lecture/écriture uniquement pour le propriétaire
    match /weightEntries/{entryId} {
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

## ⚠️ Important

1. **Publiez les règles** après les avoir collées dans Firebase Console
2. Les règles vérifient que `userId` correspond à l'utilisateur authentifié
3. Pour les créations (`request.resource`), on vérifie que le `userId` dans les données correspond à l'utilisateur connecté
4. Pour les lectures (`resource`), on vérifie que le document appartient à l'utilisateur connecté

## 🔍 Vérification

Après avoir mis à jour les règles, testez :
- Créer un message de chat → devrait fonctionner
- Lire ses propres messages → devrait fonctionner
- Lire les messages d'un autre utilisateur → devrait être refusé

