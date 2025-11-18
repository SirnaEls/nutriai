import { Platform } from 'react-native';

/**
 * Helper pour obtenir le nom de police avec fallback sécurisé
 * Évite les crashes si une police n'est pas chargée
 */
export function getFontFamily(fontName: string, fallback: string = 'System'): string {
  // Sur iOS, utiliser System comme fallback par défaut pour éviter les crashes
  if (Platform.OS === 'ios') {
    // Liste des polices qui sont chargées sur iOS
    const iosAvailableFonts = ['Raleway', 'SpaceMono'];
    
    if (iosAvailableFonts.includes(fontName)) {
      return fontName;
    }
    
    // Pour toutes les autres polices sur iOS, utiliser le fallback
    return fallback;
  }
  
  // Sur Android, toutes les polices sont disponibles
  return fontName;
}

/**
 * Polices avec fallbacks sécurisés
 */
export const SafeFonts = {
  // Titre principal (Nutri AI)
  title: Platform.OS === 'ios' ? 'System' : 'Sansation',
  
  // Corps du texte
  body: 'Raleway',
  
  // Boutons - Regular
  buttonRegular: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  
  // Boutons - SemiBold
  buttonSemiBold: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  
  // Boutons - Bold
  buttonBold: Platform.OS === 'ios' ? 'System' : 'Inter-Bold',
  
  // Fallback par défaut
  fallback: 'System',
} as const;

