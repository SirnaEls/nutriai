import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfileStore, type Objective } from "../src/store/profile";

const objectives = [
  {
    value: "lose" as Objective,
    label: "Perdre du poids",
  },
  {
    value: "maintain" as Objective,
    label: "Maintenir son poids",
  },
  {
    value: "gain" as Objective,
    label: "Prendre du poids",
  },
];

export default function SelectObjectiveScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfileStore();

  const handleSelect = (objective: Objective) => {
    updateProfile({ objective });
  };

  const handleNext = () => {
    if (profile.objective) {
      router.push("/select-activity");
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

        <Text style={styles.title}>Objectif</Text>

        <View style={styles.objectivesContainer}>
          {objectives.map((obj) => {
            const isSelected = profile.objective === obj.value;
            return (
              <Pressable
                key={obj.value}
                style={({ pressed }) => [
                  styles.objectiveButton,
                  isSelected && styles.objectiveButtonActive,
                  pressed && styles.objectiveButtonPressed,
                ]}
                onPress={() => handleSelect(obj.value)}
              >
                <Text
                  style={[
                    styles.objectiveButtonText,
                    isSelected && styles.objectiveButtonTextActive,
                  ]}
                >
                  {obj.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Next Button */}
      {profile.objective && (
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
    marginBottom: 32,
  },
  objectivesContainer: {
    gap: 16,
  },
  objectiveButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  objectiveButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#FFFFFF",
  },
  objectiveButtonPressed: {
    opacity: 0.8,
  },
  objectiveButtonText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  objectiveButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

