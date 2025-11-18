import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useProfileStore } from "../src/store/profile";
import { useAuthStore } from "../src/store/auth";
import { logger } from "../src/utils/logger";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, calculateDailyCalories, resetProfile } = useProfileStore();
  const { signOut } = useAuthStore();

  const dailyGoal = calculateDailyCalories() || 2300;

  const handleModifyProfile = () => {
    router.push("/create-profile");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      resetProfile();
      router.replace("/");
    } catch (error) {
      logger.error("Erreur déconnexion:", error);
    }
  };

  const genderText = profile.gender === "male" ? "Homme" : profile.gender === "female" ? "Femme" : "Non renseigné";
  const objectiveText = profile.objective === "lose" ? "Perdre du poids" : 
                        profile.objective === "maintain" ? "Maintenir son poids" : 
                        profile.objective === "gain" ? "Prendre du poids" : "Non défini";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay} />
      <View style={styles.profileCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <FontAwesome name="times" size={18} color="#000000" />
          </Pressable>
        </View>

        {/* Informations utilisateur */}
        <View style={styles.content}>
          <View style={styles.leftColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Genre</Text>
              <Text style={styles.infoValue}>{genderText}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Prénom</Text>
              <Text style={styles.infoValue}>{profile.firstName || "Non renseigné"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Objectif</Text>
              <Text style={styles.infoValue}>{dailyGoal} Calories</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rightColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Poids</Text>
              <Text style={styles.infoValue}>
                {profile.weight ? `${profile.weight} Kg` : "Non renseigné"}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Taille</Text>
              <Text style={styles.infoValue}>
                {profile.height ? `${profile.height} cm` : "Non renseigné"}
              </Text>
            </View>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
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
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  profileCard: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonPressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    marginBottom: 32,
    gap: 24,
  },
  leftColumn: {
    flex: 1,
    gap: 20,
  },
  rightColumn: {
    flex: 1,
    gap: 20,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  infoRow: {
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  actions: {
    gap: 12,
  },
  modifyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modifyButtonPressed: {
    opacity: 0.8,
  },
  modifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  logoutButton: {
    backgroundColor: "#8B4513",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

