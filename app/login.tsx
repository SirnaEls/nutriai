import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuthStore } from "../src/store/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithApple, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  // Vérifier si Apple Sign-In est disponible
  useEffect(() => {
    if (Platform.OS === "ios") {
      // Protection contre les crashes TurboModule sur iPad
      AppleAuthentication.isAvailableAsync()
        .then(setIsAppleAvailable)
        .catch((error) => {
          console.warn("Apple Authentication check failed:", error);
          setIsAppleAvailable(false);
        });
    }
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      if (isSignUp) {
        await useAuthStore.getState().signUp(email, password, displayName || undefined);
        Alert.alert("Succès", "Compte créé avec succès !");
        router.replace("/(tabs)");
      } else {
        await signIn(email, password);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.message !== "Connexion Apple annulée") {
        Alert.alert("Erreur", error.message || "Erreur lors de la connexion avec Apple");
      }
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isSignUp ? "Créer un compte" : "Connexion"}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? "Créez votre compte pour commencer"
                : "Connectez-vous pour continuer"}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Votre prénom"
                  placeholderTextColor="#666"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading
                  ? "Chargement..."
                  : isSignUp
                  ? "Créer mon compte"
                  : "Se connecter"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.switchButton}
              onPress={() => {
                if (isSignUp) {
                  setIsSignUp(false);
                } else {
                  // Rediriger vers l'onboarding pour créer un compte
                  router.push("/onboarding");
                }
              }}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? "Déjà un compte ? Se connecter"
                  : "Pas encore de compte ? S'inscrire"}
              </Text>
            </Pressable>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Bouton Apple Sign-In (iOS uniquement) */}
            {isAppleAvailable && (
              <Pressable
                style={({ pressed }) => [
                  styles.oauthButton,
                  pressed && styles.oauthButtonPressed,
                  isLoading && styles.oauthButtonDisabled,
                ]}
                onPress={handleAppleSignIn}
                disabled={isLoading}
              >
                <FontAwesome name="apple" size={20} color="#FFFFFF" />
                <Text style={styles.oauthButtonText}>Continuer avec Apple</Text>
              </Pressable>
            )}
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
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
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
  switchButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  switchButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  separatorText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "#000000",
  },
  oauthButtonPressed: {
    opacity: 0.8,
  },
  oauthButtonDisabled: {
    opacity: 0.5,
  },
  oauthButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

