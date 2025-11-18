# Comment supprimer tous les utilisateurs Firebase

## Problème
Quand vous supprimez la base Firestore, les utilisateurs restent dans **Firebase Authentication** car ce sont deux services séparés.

## Solutions

### Option 1 : Supprimer depuis la Console Firebase (RECOMMANDÉ)

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Authentication** (dans le menu de gauche)
4. Cliquez sur l'onglet **Users**
5. Vous verrez tous les utilisateurs enregistrés
6. Pour supprimer un utilisateur :
   - Cliquez sur les 3 points (⋮) à droite de l'utilisateur
   - Cliquez sur **Delete user**
   - Confirmez la suppression
7. Pour supprimer plusieurs utilisateurs :
   - Cochez les utilisateurs à supprimer
   - Cliquez sur **Delete selected** en haut
   - Confirmez

### Option 2 : Supprimer tous les utilisateurs en une fois (via script)

Si vous avez beaucoup d'utilisateurs, vous pouvez utiliser l'Admin SDK Firebase :

```javascript
// Script Node.js (à exécuter localement)
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function deleteAllUsers() {
  let nextPageToken;
  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    const uids = listUsersResult.users.map(user => user.uid);
    
    if (uids.length > 0) {
      await admin.auth().deleteUsers(uids);
      console.log(`Supprimé ${uids.length} utilisateurs`);
    }
    
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
  
  console.log('Tous les utilisateurs ont été supprimés');
}

deleteAllUsers();
```

### Option 3 : Supprimer via l'application (utilisateur connecté)

Un utilisateur connecté peut supprimer son propre compte via la fonction `deleteCurrentUser()` dans `src/services/auth.ts`.

⚠️ **Note** : Cette fonction nécessite que l'utilisateur se soit connecté récemment (dans les dernières heures).

## Important

- **Firebase Authentication** et **Firestore** sont deux services séparés
- Supprimer Firestore ne supprime PAS les utilisateurs d'Authentication
- Supprimer les utilisateurs d'Authentication ne supprime PAS les données Firestore
- Pour une suppression complète, il faut supprimer les deux

## Vérification

Après suppression, essayez de créer un nouveau compte avec le même email. Si vous obtenez encore "email déjà utilisé", c'est que l'utilisateur existe toujours dans Firebase Authentication.

