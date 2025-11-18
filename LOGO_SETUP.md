# 🎨 Guide d'ajout du logo de l'application

## 📋 Fichiers nécessaires

Pour que le logo s'affiche correctement dans l'application, vous devez ajouter votre fichier logo dans le dossier `assets/images/`.

### Fichier principal
- **`assets/images/logo.png`** : Logo principal de l'application (recommandé : 512x512px ou 1024x1024px, format PNG avec fond transparent)

## 📐 Spécifications recommandées pour une QUALITÉ OPTIMALE

### Logo principal - Format haute qualité

Pour une qualité parfaite sur tous les appareils (y compris les écrans Retina), utilisez **3 variantes** :

#### Option 1 : Variantes multiples (RECOMMANDÉ pour qualité maximale)
- **`logo.png`** : Version de base (1024x1024px minimum)
- **`logo@2x.png`** : Version 2x pour écrans Retina (2048x2048px)
- **`logo@3x.png`** : Version 3x pour écrans Retina HD (3072x3072px)

React Native chargera automatiquement la bonne variante selon la densité de l'écran.

#### Option 2 : Une seule image haute résolution
- **`logo.png`** : **2048x2048px minimum** (idéalement 3072x3072px)
- Format : PNG 32-bit avec canal alpha (transparence)
- Compression : Qualité maximale (pas de compression excessive)

### Spécifications techniques détaillées

#### Format et qualité
- **Format** : PNG 32-bit (RGBA) avec fond transparent
- **Profondeur de couleur** : 32-bit (8 bits par canal RGBA)
- **Compression** : Qualité maximale (compression PNG niveau 0-2, pas de compression JPEG)
- **Espace colorimétrique** : sRGB

#### Dimensions recommandées
- **Minimum** : 1024x1024px (pour écrans standards)
- **Recommandé** : 2048x2048px (pour écrans Retina @2x)
- **Optimal** : 3072x3072px (pour écrans Retina HD @3x et futurs écrans)

#### Pourquoi ces dimensions ?
- Le logo s'affiche à 120x120px dans l'app
- Sur un iPhone avec écran @3x, cela nécessite 360x360px réels
- Avec une marge de sécurité et pour éviter le flou, 2048x2048px minimum est recommandé
- Les écrans Retina nécessitent 2x ou 3x la résolution affichée

#### Export depuis votre logiciel de design
- **Figma/Sketch** : Exportez en PNG, qualité 100%, résolution 2x ou 3x
- **Photoshop** : Exportez en PNG-24 avec transparence, résolution 300 DPI minimum
- **Illustrator** : Exportez en PNG haute résolution, 2048x2048px minimum
- **Canva/Outils en ligne** : Exportez en PNG haute résolution (2048x2048px)

### Icônes de l'application (optionnel - déjà existantes)
Si vous souhaitez aussi mettre à jour les icônes de l'app :

- **`icon.png`** : Icône iOS/Android (1024x1024px)
- **`adaptive-icon.png`** : Icône adaptative Android (1024x1024px, zone sûre : 768x768px)
- **`splash-icon.png`** : Icône du splash screen (1024x1024px)
- **`favicon.png`** : Favicon web (32x32px ou 64x64px)

## 🚀 Étapes d'installation

1. **Préparez votre logo en haute qualité**
   
   **Option A : Une seule image haute résolution (plus simple)**
   - Exportez votre logo en PNG 32-bit avec transparence
   - Dimensions : **2048x2048px minimum** (3072x3072px pour qualité maximale)
   - Qualité : Compression minimale (qualité maximale)
   - Nommez-le : `logo.png`
   
   **Option B : Variantes multiples (qualité optimale)**
   - Exportez 3 versions :
     - `logo.png` : 1024x1024px (base)
     - `logo@2x.png` : 2048x2048px (Retina @2x)
     - `logo@3x.png` : 3072x3072px (Retina HD @3x)
   - React Native chargera automatiquement la bonne version

2. **Ajoutez le(s) fichier(s)**
   ```bash
   # Pour une seule image
   cp /chemin/vers/votre/logo.png assets/images/logo.png
   
   # Pour les variantes multiples
   cp /chemin/vers/logo.png assets/images/logo.png
   cp /chemin/vers/logo@2x.png assets/images/logo@2x.png
   cp /chemin/vers/logo@3x.png assets/images/logo@3x.png
   ```

3. **Vérifiez l'intégration**
   - Le composant Logo utilise déjà `logo.png` automatiquement
   - Le logo apparaîtra sur l'écran d'accueil (`app/index.tsx`)
   - Redémarrez le serveur Expo si nécessaire : `npm start` ou `expo start`

## 📱 Où le logo est utilisé

### Écran d'accueil (`app/index.tsx`)
- Le logo s'affiche en haut de l'écran de bienvenue
- Taille : 120x120px
- Avec ombre portée pour un effet visuel

### Composant Logo (`components/Logo.tsx`)
Le composant `Logo` peut être réutilisé partout dans l'application :

```tsx
import Logo from "../components/Logo";

// Utilisation basique
<Logo size={120} />

// Avec fond
<Logo size={120} showBackground={true} />

// Avec style personnalisé
<Logo size={80} style={{ marginBottom: 20 }} />
```

## 🎨 Personnalisation

### Modifier la taille du logo
Dans `app/index.tsx`, modifiez la prop `size` :
```tsx
<Logo size={150} /> // Plus grand
<Logo size={80} />  // Plus petit
```

### Ajouter un fond au logo
```tsx
<Logo size={120} showBackground={true} />
```

### Utiliser le logo ailleurs
Vous pouvez utiliser le composant `Logo` dans n'importe quel écran :
```tsx
import Logo from "../components/Logo";

// Dans votre composant
<View>
  <Logo size={60} />
  <Text>Mon titre</Text>
</View>
```

## 🛠️ Outils pour créer/optimiser votre logo

### Créer le logo
- **Figma** : Exportez en PNG, sélectionnez "2x" ou "3x" dans les options d'export
- **Sketch** : Exportez en PNG, cochez "Export @2x" et "@3x"
- **Photoshop** : Fichier > Export > Export As > PNG-24, résolution 300 DPI
- **Illustrator** : Fichier > Export > Export As > PNG, résolution 300 DPI
- **Canva** : Téléchargez en PNG haute résolution (2048x2048px)

### Redimensionner/optimiser
- **ImageMagick** (ligne de commande) :
  ```bash
  # Redimensionner à 2048x2048px
  convert logo.png -resize 2048x2048 logo.png
  
  # Créer les variantes @2x et @3x
  convert logo.png -resize 2048x2048 logo@2x.png
  convert logo.png -resize 3072x3072 logo@3x.png
  ```
- **Squoosh** (en ligne) : https://squoosh.app/ - Compression PNG optimale
- **TinyPNG** (en ligne) : https://tinypng.com/ - Compression intelligente
- **GIMP** (gratuit) : Export PNG avec qualité maximale

## ⚠️ Notes importantes et problèmes courants

### Qualité du logo

1. **Logo flou ou pixelisé ?**
   - ✅ Vérifiez que votre logo fait au minimum **2048x2048px**
   - ✅ Exportez en PNG 32-bit (pas JPEG)
   - ✅ Utilisez une compression minimale (qualité maximale)
   - ✅ Ajoutez les variantes @2x et @3x pour les écrans Retina

2. **Format recommandé** : PNG 32-bit avec fond transparent pour un meilleur rendu sur fond sombre.

3. **Taille du fichier** : Un logo de 2048x2048px en PNG 32-bit peut faire 1-3 MB, c'est normal. Ne compressez pas trop pour garder la qualité.

4. **Icônes de l'app** : Pour mettre à jour les icônes de l'application (sur l'écran d'accueil iOS/Android), remplacez aussi les fichiers `icon.png`, `adaptive-icon.png`, et `splash-icon.png`.

## 🔄 Après avoir ajouté le logo

1. Redémarrez le serveur Expo si nécessaire
2. Le logo devrait apparaître automatiquement sur l'écran d'accueil
3. Testez sur différents appareils pour vérifier le rendu

## 📝 Exemple de structure de fichiers

```
assets/
  images/
    logo.png          ← Votre logo principal (à ajouter)
    icon.png          ← Icône de l'app (existant)
    adaptive-icon.png ← Icône Android (existant)
    splash-icon.png   ← Splash screen (existant)
    favicon.png       ← Favicon web (existant)
```

