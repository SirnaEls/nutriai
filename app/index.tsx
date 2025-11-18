import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../src/store/auth";
import Logo from "../components/Logo";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isInitialized && user) {
      router.replace("/(tabs)");
    }
  }, [user, isInitialized]);

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Main content */}
      <View style={styles.content}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Logo size={120} showBackground={false} />
        </View>

        {/* App Title */}
        <Text style={styles.title}>Nutri AI</Text>

        {/* App Subtitle */}
        <Text style={styles.subtitle}>
          IA de calcul nutritionnel personnalisé
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {/* Get Started Button with Gradient */}
        <Pressable
          onPress={handleGetStarted}
          style={({ pressed }) => [
            styles.primaryButtonContainer,
            pressed && styles.primaryButtonPressed,
          ]}
        >
          <LinearGradient
            colors={['#D97757', '#9333EA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Commencer</Text>
          </LinearGradient>
        </Pressable>

        {/* Login Option */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà un compte ?</Text>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            onPress={handleLogin}
          >
            <Text style={styles.secondaryButtonText}>Connectez-vous</Text>
          </Pressable>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 32,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Sansation',
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 20,
  },
  primaryButtonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
});

