import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuthStore } from "../src/store/auth";
import { useProfileStore } from "../src/store/profile";
import { saveUserProfile } from "../src/services/database";
import { logger } from "../src/utils/logger";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();
  const { profile, updateProfile } = useProfileStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    setError(null);

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await signUp(email.trim(), password);
      
      // Sauvegarder le profil dans Firebase après création du compte
      // Le profil a été rempli dans create-profile et select-objective
      // mais n'a pas pu être sauvegardé car l'utilisateur n'était pas connecté
      if (profile && (profile.firstName || profile.gender || profile.height || profile.weight || profile.age || profile.objective)) {
        // Sauvegarder directement via database car l'utilisateur est maintenant connecté
        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await saveUserProfile(user.uid, profile);
            logger.log("Profil sauvegardé dans Firebase après création du compte");
          } catch (error) {
            logger.error("Erreur sauvegarde profil après création compte:", error);
            // On continue même si la sauvegarde échoue
          }
        }
      }
      
      // Après création du compte, aller vers l'app
      router.replace("/(tabs)");
    } catch (error: any) {
      // Gestion des erreurs Firebase
      let errorMessage = "Une erreur est survenue lors de la création du compte";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Adresse email invalide";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Le mot de passe est trop faible";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "" && password.length >= 6 && validateEmail(email.trim());

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
            <Text style={styles.title}>Créer votre compte</Text>
            <Text style={styles.subtitle}>
              Créez votre compte pour sauvegarder vos données
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, error && error.includes("email") && styles.inputError]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  placeholder="votre@email.com"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <TextInput
                  style={[styles.input, error && error.includes("mot de passe") && styles.inputError]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor="#666"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  (!isFormValid || isLoading) && styles.submitButtonDisabled,
                  pressed && styles.submitButtonPressed,
                ]}
                onPress={handleSignup}
                disabled={!isFormValid || isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Création..." : "Créer mon compte"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  inputError: {
    borderColor: "#FF4444",
    borderWidth: 2,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
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

