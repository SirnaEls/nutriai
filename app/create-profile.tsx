import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useProfileStore, type Gender } from "../src/store/profile";

export default function CreateProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfileStore();
  const [localGender, setLocalGender] = useState<Gender | null>(profile.gender);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [height, setHeight] = useState(
    profile.height ? profile.height.toString() : ""
  );
  const [weight, setWeight] = useState(
    profile.weight ? profile.weight.toString() : ""
  );
  const [age, setAge] = useState(
    profile.age ? profile.age.toString() : ""
  );

  const handleNext = () => {
    updateProfile({
      gender: localGender,
      firstName,
      height: height ? parseInt(height) : null,
      weight: weight ? parseFloat(weight) : null,
      age: age ? parseInt(age) : null,
    });
    router.push("/select-objective");
  };

  const handleGoBack = () => {
    router.back();
  };

  const isFormValid =
    localGender &&
    firstName.trim() !== "" &&
    height &&
    weight &&
    age &&
    parseInt(height) > 0 &&
    parseFloat(weight) > 0 &&
    parseInt(age) > 0;

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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            <Text style={styles.title}>Création de son profil</Text>

            {/* Gender Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Genre</Text>
              <View style={styles.genderContainer}>
                <Pressable
                  style={[
                    styles.genderButton,
                    localGender === "male" && styles.genderButtonActive,
                  ]}
                  onPress={() => setLocalGender("male")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      localGender === "male" && styles.genderButtonTextActive,
                    ]}
                  >
                    Homme
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.genderButton,
                    localGender === "female" && styles.genderButtonActive,
                  ]}
                  onPress={() => setLocalGender("female")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      localGender === "female" &&
                        styles.genderButtonTextActive,
                    ]}
                  >
                    Femme
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* First Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Entrez votre prénom"
                placeholderTextColor="#666"
                autoCapitalize="words"
              />
            </View>

            {/* Height */}
            <View style={styles.section}>
              <Text style={styles.label}>Taille</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, styles.inputWithUnitField]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>cm</Text>
              </View>
            </View>

            {/* Weight */}
            <View style={styles.section}>
              <Text style={styles.label}>Poids</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, styles.inputWithUnitField]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unit}>Kg</Text>
              </View>
            </View>

            {/* Age */}
            <View style={styles.section}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>

        {/* Next Button */}
        {isFormValid && (
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#FFFFFF",
  },
  genderButtonText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  genderButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputWithUnitField: {
    flex: 1,
  },
  unit: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
    minWidth: 40,
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

