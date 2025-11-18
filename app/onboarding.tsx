import { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuthStore } from "../src/store/auth";
import Logo from "../components/Logo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type OnboardingScreenData = {
  icon: string;
  iconSecondary?: string;
  title: string;
  subtitle: string;
};

const onboardingData: OnboardingScreenData[] = [
  {
    icon: "bullseye",
    title: "Suivez vos objectifs",
    subtitle: "Définissez et atteignez vos objectifs nutritionnels personnalisés",
  },
  {
    icon: "android",
    title: "Un suivi simplifié par L'IA",
    subtitle: "Enregistrer vos repas via un chat avec notre IA",
  },
  {
    icon: "user",
    iconSecondary: "star",
    title: "Un Coach personnel",
    subtitle: "Bénéficiez de conseils personnalisés basés sur vos habitudes",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { user, isInitialized } = useAuthStore();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isInitialized && user) {
      router.replace("/(tabs)");
    }
  }, [user, isInitialized]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentPage + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleCreateProfile = () => {
    router.push("/create-profile");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Bouton retour */}
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
        onPress={handleGoBack}
      >
        <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
      </Pressable>

      {/* Background pattern */}
      <View style={styles.patternContainer}>
        {Array.from({ length: 50 }).map((_, i) => {
          const row = Math.floor(i / 12);
          const col = i % 12;
          const offsetX = (col * 35) % 100;
          const offsetY = 55 + row * 6;
          const size = 32 + (i % 3) * 4;
          return (
            <View
              key={i}
              style={[
                styles.circle,
                {
                  left: `${offsetX}%`,
                  top: `${offsetY}%`,
                  opacity: 0.08 - (i % 4) * 0.015,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
              ]}
            />
          );
        })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((screen, index) => (
          <View key={index} style={styles.screen}>
            <View style={styles.content}>
              {/* Icon selon la page */}
              <View style={styles.iconContainer}>
                {index === 0 ? (
                  // Page objectifs - icône cible/objectif
                  <View style={styles.iconCircle}>
                    <LinearGradient
                      colors={['#D97757', '#9333EA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconGradient}
                    >
                      <FontAwesome name="bullseye" size={60} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                ) : index === 1 ? (
                  // Page IA - icône robot/IA
                  <View style={styles.iconCircle}>
                    <LinearGradient
                      colors={['#D97757', '#9333EA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconGradient}
                    >
                      <FontAwesome name="android" size={60} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                ) : (
                  // Page coach - icône utilisateur avec étoile
                  <View style={styles.iconCircle}>
                    <LinearGradient
                      colors={['#D97757', '#9333EA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconGradient}
                    >
                      <View style={styles.iconWithStar}>
                        <FontAwesome name="user" size={60} color="#FFFFFF" />
                        <View style={styles.starBadge}>
                          <FontAwesome name="star" size={20} color="#FFD700" />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={styles.title}>{screen.title}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>{screen.subtitle}</Text>
            </View>

            {/* Bouton sur le dernier écran */}
            {index === onboardingData.length - 1 && (
              <View style={styles.footer}>
                <View style={styles.pagination}>
                  {onboardingData.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.paginationDot,
                        i === currentPage && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
                <Pressable
                  onPress={handleCreateProfile}
                  style={({ pressed }) => [
                    styles.createButtonContainer,
                    pressed && styles.createButtonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={['#D97757', '#9333EA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createButton}
                  >
                    <Text style={styles.createButtonText}>Créer son profil</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots - shown on first 2 screens */}
      {currentPage < onboardingData.length - 1 && (
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, i) => (
            <View
              key={i}
              style={[
                styles.paginationDot,
                i === currentPage && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  patternContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    backgroundColor: "#333",
  },
  scrollView: {
    flex: 1,
  },
  screen: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWithStar: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  starBadge: {
    position: "absolute",
    top: -5,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  paginationContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    gap: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  createButtonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  createButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonPressed: {
    opacity: 0.9,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  backButtonPressed: {
    opacity: 0.7,
  },
});

