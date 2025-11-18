import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfileStore, type ActivityLevel } from "../src/store/profile";

const activityLevels = [
  {
    value: "sedentary" as ActivityLevel,
    label: "Sédentaire",
    description: "Peu ou pas d'exercice",
  },
  {
    value: "light" as ActivityLevel,
    label: "Légèrement actif",
    description: "Exercice léger 1-3 jours/semaine",
  },
  {
    value: "moderate" as ActivityLevel,
    label: "Modérément actif",
    description: "Exercice modéré 3-5 jours/semaine",
  },
  {
    value: "active" as ActivityLevel,
    label: "Très actif",
    description: "Exercice intense 6-7 jours/semaine",
  },
  {
    value: "very_active" as ActivityLevel,
    label: "Extrêmement actif",
    description: "Exercice très intense, travail physique",
  },
];

export default function SelectActivityScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfileStore();

  const handleSelect = (activityLevel: ActivityLevel) => {
    updateProfile({ activityLevel });
  };

  const handleNext = () => {
    if (profile.activityLevel) {
      router.push("/profile-result");
    }
  };

  const handleBack = () => {
    router.back();
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

      <View style={styles.content}>
        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <Text style={styles.title}>Niveau d'activité</Text>
        <Text style={styles.subtitle}>
          Indiquez votre niveau d'activité physique
        </Text>

        <View style={styles.activitiesContainer}>
          {activityLevels.map((level) => {
            const isSelected = profile.activityLevel === level.value;
            return (
              <Pressable
                key={level.value}
                style={({ pressed }) => [
                  styles.activityButton,
                  isSelected && styles.activityButtonActive,
                  pressed && styles.activityButtonPressed,
                ]}
                onPress={() => handleSelect(level.value)}
              >
                <Text
                  style={[
                    styles.activityButtonLabel,
                    isSelected && styles.activityButtonLabelActive,
                  ]}
                >
                  {level.label}
                </Text>
                <Text
                  style={[
                    styles.activityButtonDescription,
                    isSelected && styles.activityButtonDescriptionActive,
                  ]}
                >
                  {level.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Next Button */}
      {profile.activityLevel && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Suivant →</Text>
          </Pressable>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 32,
  },
  activitiesContainer: {
    gap: 12,
  },
  activityButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  activityButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#FFFFFF",
  },
  activityButtonPressed: {
    opacity: 0.8,
  },
  activityButtonLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    marginBottom: 4,
  },
  activityButtonLabelActive: {
    color: "#FFFFFF",
  },
  activityButtonDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  activityButtonDescriptionActive: {
    color: "rgba(255, 255, 255, 0.8)",
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
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonPressed: {
    opacity: 0.9,
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});

