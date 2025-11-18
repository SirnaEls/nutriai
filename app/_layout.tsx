import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
// Protection contre les crashes TurboModule sur iPad
try {
  SplashScreen.preventAutoHideAsync();
} catch (error) {
  console.warn("SplashScreen.preventAutoHideAsync failed:", error);
  // Ne pas bloquer l'app si cette initialisation échoue
}

export default function RootLayout() {
  // Charger les polices de manière conditionnelle selon la plateforme
  const fontsToLoad: any = {
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  };
  
  // Sur iOS, charger Raleway avec gestion d'erreur
  // Sur Android, charger toutes les polices
  if (Platform.OS === 'ios') {
    try {
      fontsToLoad['Raleway'] = require('../assets/fonts/Raleway-Regular.ttf');
    } catch (e) {
      console.warn('Raleway font not found, will use System font');
    }
  } else {
    fontsToLoad['Raleway'] = require('../assets/fonts/Raleway-Regular.ttf');
    fontsToLoad['Inter-Regular'] = require('../assets/fonts/Inter-Regular.ttf');
    fontsToLoad['Inter-SemiBold'] = require('../assets/fonts/Inter-SemiBold.ttf');
    fontsToLoad['Inter-Bold'] = require('../assets/fonts/Inter-Bold.ttf');
    fontsToLoad['Sansation'] = require('../assets/fonts/Sansation-Regular.ttf');
  }
  
  const [loaded, error] = useFonts(fontsToLoad);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Ne pas bloquer l'app si une police ne charge pas
      // L'app continuera avec les polices système
    }
  }, [error]);

  useEffect(() => {
    // Attendre un peu plus longtemps pour s'assurer que les polices sont chargées
    // Cela évite les crashes sur iPad
    if (loaded) {
      // Petit délai pour s'assurer que tout est prêt
      const timer = setTimeout(() => {
        // Protection contre les crashes TurboModule sur iPad
        try {
          SplashScreen.hideAsync().catch((error) => {
            console.warn("SplashScreen.hideAsync failed:", error);
          });
        } catch (error) {
          console.warn("SplashScreen.hideAsync sync error:", error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  // Ne pas bloquer le rendu si les polices ne sont pas chargées
  // L'app utilisera les polices système par défaut
  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="create-profile" options={{ headerShown: false }} />
        <Stack.Screen name="select-objective" options={{ headerShown: false }} />
        <Stack.Screen name="select-activity" options={{ headerShown: false }} />
        <Stack.Screen name="profile-result" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
