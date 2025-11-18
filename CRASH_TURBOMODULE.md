## Crash iOS 18 / iPad – TurboModule Hermes

**Symptômes observés**
- Crash immédiat au lancement sur iPad (model : `iPad14,8`, iPad Pro M4) – log AppStoreConnect `EXC_BAD_ACCESS (SIGSEGV)`  
- Thread fautif : `com.meta.react.turbomodulemanager.queue`  
- Stack native Hermes : `hermes::vm::DictPropertyMap::lookupEntryFor` → `facebook::react::TurboModuleConvertUtils::convertNSExceptionToJSError`
- Version rejetée : `1.0.5 (7)`

**Analyse**
- Le crash survient avant tout rendu React, pendant l’initialisation des `TurboModules`.
- La pile Hermes montre qu’une exception Objective-C provenant d’un module Expo/React Native est convertie en erreur JavaScript, mais Hermes segfault pendant l’écriture des propriétés de l’objet d’erreur.
- Le problème est reproduit uniquement sur les builds **New Architecture** (TurboModules + Fabric activés) dans l’environnement App Store / iPadOS 18.1.  
  Plusieurs modules Expo (AsyncStorage, WebBrowser, AppleAuth, etc.) utilisent encore le bridge classique et provoquent cette erreur lorsque `RCTNewArchEnabled` est `true`.

**Correctif appliqué dans ce commit**
1. `app.config.ts` : `newArchEnabled` repasse à `false` pour revenir sur l’architecture classique et éviter le code path Hermes instable.
2. `ios/Podfile.properties.json` et `ios/ecals/Info.plist` : clés alignées (`"newArchEnabled": "false"` et `RCTNewArchEnabled=false`) afin que la configuration native suive l’Expo config.

**Actions à réaliser avant nouvelle soumission**
1. Nettoyer les artefacts iOS : `cd ios && rm -rf Pods build && pod install`.
2. Recréer le bundle iOS : `eas build --platform ios --profile production`.
3. Tester sur un iPad réel / simulateur iPadOS 18 pour confirmer que l’app démarre correctement.
4. Soumettre à TestFlight puis à l’App Store (`eas submit --platform ios --profile production`).

**Suivi**
- Une fois qu’Expo/les dépendances seront complètement compatibles New Architecture, on pourra réactiver la clé et regénérer la version.
