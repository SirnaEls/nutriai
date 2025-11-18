# 🧪 Tester dans Xcode - Guide rapide

## ✅ Projet ouvert dans Xcode

Le workspace `ecals.xcworkspace` est maintenant ouvert dans Xcode.

## 📱 Étapes pour tester

### 1. Sélectionner un simulateur iPad

En haut de Xcode, dans la barre d'outils :
- Cliquer sur le menu déroulant à côté du bouton "Run"
- Sélectionner un simulateur iPad :
  - **iPad Pro (12.9-inch) (6th generation)** - Recommandé (similaire au crash report)
  - **iPad Air (5th generation)**
  - **iPad mini (6th generation)**

Si aucun simulateur iPad n'apparaît :
1. **Window** > **Devices and Simulators** (⇧⌘2)
2. Cliquer sur **"+"** en bas à gauche
3. Sélectionner :
   - **Device Type** : iPad Pro (12.9-inch) (6th generation)
   - **OS Version** : iOS 18.1 (ou la plus récente)
4. Cliquer **Create**

### 2. Lancer l'app

- Cliquer sur le bouton **"Run"** (▶️) ou appuyer sur **⌘R**
- Xcode va compiler et lancer l'app sur le simulateur

### 3. Vérifier les logs

Pendant le build et l'exécution :
- Ouvrir la console Xcode : **View** > **Debug Area** > **Show Debug Area** (⇧⌘Y)
- Surveiller les erreurs potentielles :
  - `TurboModule`
  - `Hermes`
  - `EXC_BAD_ACCESS`
  - `SIGSEGV`

### 4. Tests à effectuer

Une fois l'app lancée :

- [ ] **Démarrage** : L'app démarre sans crash
- [ ] **Splash screen** : S'affiche et se cache correctement
- [ ] **Polices** : Le texte s'affiche correctement (vérifier visuellement)
- [ ] **Navigation** : Tous les écrans sont accessibles
- [ ] **Connexion Apple** : Tester si disponible (peut ne pas fonctionner dans le simulateur)
- [ ] **Chat IA** : Envoyer un message
- [ ] **Ajout de repas** : Via le chat
- [ ] **Historique** : Voir les repas ajoutés

## 🔍 Vérifier les logs de crash

Si l'app crash :

1. **Window** > **Devices and Simulators** (⇧⌘2)
2. Sélectionner votre simulateur
3. Cliquer sur **"Open Console"**
4. Filtrer par "ecals" ou chercher :
   - `TurboModuleConvertUtils`
   - `Hermes`
   - `EXC_BAD_ACCESS`
   - `SIGSEGV`

## ⚠️ Notes importantes

- **Le simulateur peut ne pas reproduire exactement le crash** qui s'est produit sur un iPad réel
- Si l'app fonctionne dans le simulateur, c'est bon signe, mais **un test sur un iPad réel via TestFlight reste recommandé**
- Les protections ajoutées (try/catch) devraient fonctionner dans le simulateur ET sur un vrai iPad

## 🚀 Après les tests

Si tout fonctionne dans le simulateur :

1. **Créer le build de production** :
   ```bash
   eas build --platform ios --profile production
   ```

2. **Soumettre à TestFlight** :
   ```bash
   eas submit --platform ios --profile production
   ```

3. **Tester sur un iPad réel** via TestFlight (idéal pour valider le fix du crash)

## 📝 Commandes utiles

```bash
# Nettoyer le build (si nécessaire)
cd ios && xcodebuild clean -workspace ecals.xcworkspace -scheme ecals

# Voir les simulateurs disponibles
xcrun simctl list devices

# Redémarrer un simulateur
xcrun simctl shutdown all
xcrun simctl boot "iPad Pro (12.9-inch) (6th generation)"
```

