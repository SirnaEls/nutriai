import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useProfileStore } from "../src/store/profile";
import Logo from "../components/Logo";

export default function ProfileResultScreen() {
  const router = useRouter();
  const { calculateDailyCalories, calculateMacros } = useProfileStore();

  const dailyCalories = calculateDailyCalories();
  const macros = calculateMacros();

  const handleModifyProfile = () => {
    router.push("/create-profile");
  };

  const handleStartTracking = () => {
    router.push("/signup");
  };

  if (!dailyCalories || !macros) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Erreur: Impossible de calculer les valeurs
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size={100} showBackground={false} />
        </View>

        {/* Calorie Goal */}
        <Text style={styles.calorieText}>{dailyCalories}</Text>
        <Text style={styles.calorieLabel}>Calories</Text>
        <Text style={styles.subtitle}>
          Voici votre objectif journalier
        </Text>

        {/* Macronutrients */}
        <View style={styles.macrosContainer}>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{macros.fat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{macros.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{macros.carbs}g</Text>
            <Text style={styles.macroLabel}>Glucides</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{macros.fiber}g</Text>
            <Text style={styles.macroLabel}>Fibre</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.modifyButton,
            pressed && styles.modifyButtonPressed,
          ]}
          onPress={handleModifyProfile}
        >
          <Text style={styles.modifyButtonText}>Modifier mon profil</Text>
        </Pressable>
        <Pressable
          onPress={handleStartTracking}
          style={({ pressed }) => [
            styles.startButtonContainer,
            pressed && styles.startButtonPressed,
          ]}
        >
          <LinearGradient
            colors={['#D97757', '#9333EA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Commencer mon suivi</Text>
          </LinearGradient>
        </Pressable>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 32,
  },
  calorieText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  calorieLabel: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 40,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  macrosContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  macroBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  macroLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    gap: 12,
  },
  modifyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modifyButtonPressed: {
    opacity: 0.8,
  },
  modifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  startButtonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonPressed: {
    opacity: 0.9,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
});

