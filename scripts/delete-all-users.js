/**
 * Script pour supprimer tous les utilisateurs Firebase Authentication
 * 
 * ⚠️ ATTENTION : Ce script supprime TOUS les utilisateurs de Firebase Authentication
 * 
 * Prérequis :
 * 1. Installer Firebase Admin SDK : npm install firebase-admin
 * 2. Télécharger la clé de service depuis Firebase Console :
 *    - Firebase Console > Paramètres du projet > Comptes de service
 *    - Générer une nouvelle clé privée
 *    - Sauvegarder le fichier JSON
 * 3. Mettre le chemin du fichier JSON dans SERVICE_ACCOUNT_PATH ci-dessous
 * 
 * Usage :
 * node scripts/delete-all-users.js
 */

const admin = require('firebase-admin');
const path = require('path');

// ⚠️ REMPLACEZ PAR LE CHEMIN VERS VOTRE FICHIER DE CLÉ DE SERVICE
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../service-account-key.json');

// Initialiser Firebase Admin
try {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  console.log('✅ Firebase Admin initialisé');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Firebase Admin:');
  console.error('   Assurez-vous d\'avoir téléchargé la clé de service et mis à jour SERVICE_ACCOUNT_PATH');
  console.error('   Fichier attendu:', SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

/**
 * Supprimer tous les utilisateurs Firebase Authentication
 */
async function deleteAllUsers() {
  console.log('\n🔄 Début de la suppression de tous les utilisateurs...\n');
  
  let totalDeleted = 0;
  let nextPageToken;
  
  try {
    do {
      // Lister les utilisateurs (1000 par page max)
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      const users = listUsersResult.users;
      
      if (users.length === 0) {
        console.log('✅ Aucun utilisateur à supprimer');
        break;
      }
      
      // Extraire les UIDs
      const uids = users.map(user => user.uid);
      const emails = users.map(user => user.email || 'N/A');
      
      console.log(`📋 Trouvé ${users.length} utilisateur(s) à supprimer:`);
      emails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email}`);
      });
      
      // Supprimer les utilisateurs
      await admin.auth().deleteUsers(uids);
      totalDeleted += uids.length;
      
      console.log(`✅ ${uids.length} utilisateur(s) supprimé(s)\n`);
      
      // Récupérer le token pour la page suivante
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`\n🎉 Terminé ! Total: ${totalDeleted} utilisateur(s) supprimé(s)`);
    console.log('\n✅ Vous pouvez maintenant créer de nouveaux comptes avec les mêmes emails');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la suppression:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
deleteAllUsers()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

