# 🎨 Configuration de l'icône d'application pour l'App Store

## ✅ État actuel

Votre application est configurée avec :
- **Icône iOS/Android** : `assets/images/icon.png` (1024x1024px) ✅
- **Icône adaptative Android** : `assets/images/adaptive-icon.png` ✅
- **Splash screen** : `assets/images/splash-icon.png` ✅

## 📋 Spécifications requises pour l'Apple App Store

### Icône iOS (`icon.png`)
- **Taille** : 1024x1024px (vous avez déjà la bonne taille ✅)
- **Format** : PNG (vous avez déjà le bon format ✅)
- **Couleurs** : Pas de transparence (fond opaque requis)
- **Design** :
  - Pas de coins arrondis (Apple les ajoute automatiquement)
  - Pas de texte "App Store" ou mentions légales
  - Design simple et reconnaissable à petite taille
  - Zone sûre : gardez les éléments importants dans un carré de 900x900px au centre

### Icône adaptative Android (`adaptive-icon.png`)
- **Taille** : 1024x1024px
- **Format** : PNG avec transparence
- **Zone sûre** : 768x768px au centre (les coins seront masqués)

## 🔍 Vérification

Votre `icon.png` actuel fait **1024x1024px**, ce qui est parfait pour l'App Store.

**Question importante** : Est-ce que votre `icon.png` actuel utilise le même logo que `logo.png` (les cercles concentriques) ?

## 🎯 Recommandations pour la production

### Option 1 : Utiliser le logo actuel comme icône

Si votre `icon.png` utilise déjà le logo avec les cercles concentriques :
1. ✅ Vérifiez qu'il n'y a pas de transparence (fond opaque)
2. ✅ Vérifiez que le logo est centré et bien visible
3. ✅ Testez l'icône à petite taille (sur l'écran d'accueil)

### Option 2 : Créer une icône dédiée à partir du logo

Si vous voulez créer une icône optimisée à partir de votre logo :

1. **Préparez l'icône iOS** :
   - Prenez votre logo (cercles concentriques)
   - Ajoutez un fond opaque (blanc ou couleur de votre choix)
   - Redimensionnez à 1024x1024px
   - Centrez le logo dans un carré de 900x900px
   - Exportez en PNG sans transparence

2. **Préparez l'icône Android** :
   - Même logo mais avec transparence
   - Zone sûre de 768x768px au centre
   - Exportez en PNG avec transparence

## 📝 Checklist avant soumission App Store

- [ ] `icon.png` fait 1024x1024px ✅ (vérifié)
- [ ] `icon.png` utilise le logo de l'application
- [ ] `icon.png` a un fond opaque (pas de transparence)
- [ ] Le logo est centré et visible à petite taille
- [ ] `adaptive-icon.png` est configuré pour Android
- [ ] Test de l'icône sur un appareil réel

## 🛠️ Commandes utiles

### Vérifier les dimensions de l'icône
```bash
# macOS
sips -g pixelWidth -g pixelHeight assets/images/icon.png

# Linux
identify assets/images/icon.png
```

### Redimensionner une icône (si nécessaire)
```bash
# macOS avec sips
sips -z 1024 1024 logo.png --out assets/images/icon.png

# Avec ImageMagick
convert logo.png -resize 1024x1024 -background white -alpha remove assets/images/icon.png
```

## 🚀 Prochaines étapes

1. **Vérifiez visuellement** que `assets/images/icon.png` correspond à votre logo
2. **Testez l'icône** en créant un build de prévisualisation :
   ```bash
   eas build --platform ios --profile preview
   ```
3. **Installez le build** sur un appareil iOS réel pour voir l'icône sur l'écran d'accueil
4. **Ajustez si nécessaire** avant de soumettre à l'App Store

## ⚠️ Notes importantes

- Apple rejette les applications avec des icônes qui ne respectent pas les guidelines
- L'icône doit être unique et ne pas ressembler à d'autres apps
- Testez toujours l'icône sur un appareil réel avant la soumission
- L'icône apparaîtra dans l'App Store, sur l'écran d'accueil, et dans les résultats de recherche

