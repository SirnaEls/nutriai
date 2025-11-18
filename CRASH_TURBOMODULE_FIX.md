# 🔧 Fix Crash TurboModule Hermes - Version 1.0.5 (Build 8)

## 🐛 Problème identifié

**Crash log** : `crashlog-413B6F2F-B2E3-454E-9E1D-A1838C89D485.ips`

### Symptômes
- **Exception** : `EXC_BAD_ACCESS (SIGSEGV)` avec `KERN_INVALID_ADDRESS`
- **Thread fautif** : `com.meta.react.turbomodulemanager.queue`
- **Stack trace** :
  - `hermes::vm::DictPropertyMap::lookupEntryFor`
  - `hermes::vm::HiddenClass::findProperty`
  - `hermes::vm::JSObject::getComputedPrimitiveDescriptor`
  - `hermes::vm::JSObject::putComputedWithReceiver_RJS`
  - `facebook::hermes::HermesRuntimeImpl::setPropertyValue`
  - `facebook::react::TurboModuleConvertUtils::convertNSExceptionToJSError`
  - `facebook::react::ObjCTurboModule::performVoidMethodInvocation`

### Cause
Le crash se produit lorsqu'un module natif Expo (probablement `expo-apple-authentication`, `expo-web-browser`, ou `expo-splash-screen`) lève une exception Objective-C qui est convertie en erreur JavaScript. Hermes crash pendant cette conversion, causant un accès mémoire invalide.

**Appareil** : iPad (modelCode: "iPad14,8", iPad Pro M4)  
**OS** : iPhone OS 26.1 (iOS 18.1)  
**Version** : 1.0.5 (Build 7)

## ✅ Corrections appliquées

### 1. Désactivation de la New Architecture
- `app.config.ts` : `newArchEnabled: false` (déjà fait précédemment)
- La New Architecture (TurboModules + Fabric) cause des instabilités avec certains modules Expo sur iPad/iOS 18

### 2. Protection des appels aux modules natifs

#### `app/login.tsx`
- Ajout d'un `.catch()` sur `AppleAuthentication.isAvailableAsync()` pour éviter les crashes si le module lève une exception

#### `src/services/auth.ts`
- Protection de `WebBrowser.maybeCompleteAuthSession()` avec try/catch au niveau du module
- Protection de `AppleAuthentication.isAvailableAsync()` dans `signInWithApple()`
- Protection de `AppleAuthentication.signInAsync()` avec gestion spécifique des erreurs

#### `app/_layout.tsx`
- Protection de `SplashScreen.preventAutoHideAsync()` avec try/catch
- Protection de `SplashScreen.hideAsync()` avec try/catch et `.catch()` pour les erreurs asynchrones

### 3. Version incrémentée
- **Version** : `1.0.5` (inchangée)
- **Build Number iOS** : `7` → `8`
- **Version Code Android** : `7` → `8`

## 📝 Fichiers modifiés

1. `app/login.tsx` - Protection `AppleAuthentication.isAvailableAsync()`
2. `src/services/auth.ts` - Protections `WebBrowser` et `AppleAuthentication`
3. `app/_layout.tsx` - Protections `SplashScreen`
4. `app.config.ts` - Build number incrémenté

## 🧪 Tests recommandés

Avant de soumettre à nouveau :

1. **Tester sur iPad réel (iOS 18.1)** :
   - Installer le build sur un iPad
   - Vérifier que l'app démarre sans crash
   - Tester la connexion Apple (si disponible)
   - Tester tous les écrans
   - Vérifier que le splash screen se cache correctement

2. **Tester sur iPhone** :
   - Vérifier que tout fonctionne toujours correctement
   - Tester la connexion Apple
   - Vérifier le rendu du texte

3. **Tester sur Android** :
   - Vérifier que les polices personnalisées fonctionnent toujours
   - Vérifier que l'app démarre correctement

## 🚀 Prochaines étapes

1. **Nettoyer les artefacts iOS** (si build local) :
   ```bash
   cd ios && rm -rf Pods build && pod install
   ```

2. **Créer le build de production** :
   ```bash
   eas build --platform ios --profile production
   ```

3. **Tester sur TestFlight** :
   - Installer le build sur un iPad réel
   - Tester tous les scénarios critiques

4. **Soumettre à l'App Store** :
   ```bash
   eas submit --platform ios --profile production
   ```

## 📌 Notes importantes

- Les protections ajoutées permettent à l'app de continuer à fonctionner même si un module natif lève une exception
- Les erreurs sont loggées dans la console pour le debugging
- L'app utilisera des fallbacks (polices système, désactivation de fonctionnalités) si nécessaire
- Une fois qu'Expo et les dépendances seront complètement compatibles avec la New Architecture, on pourra réactiver `newArchEnabled: true`

## 🔍 Monitoring

Après la soumission, surveiller :
- Les crash logs dans App Store Connect
- Les retours utilisateurs sur TestFlight
- Les métriques de stabilité de l'app

