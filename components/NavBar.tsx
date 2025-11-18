import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileStore } from "../src/store/profile";

export default function NavBar() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { profile } = useProfileStore();
  
  // Détecter l'onglet actif basé sur les segments
  const lastSegment = segments[segments.length - 1];
  const isChatActive = lastSegment === "index" || (segments.includes("(tabs)") && lastSegment !== "history");
  const isHistoryActive = lastSegment === "history";

  const handleChatPress = () => {
    router.push("/(tabs)");
  };

  const handleHistoryPress = () => {
    router.push("/(tabs)/history");
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  // Initiale du prénom ou "S" par défaut
  const profileInitial = profile.firstName?.[0]?.toUpperCase() || "S";

  return (
    <View style={[styles.navBarContainer, { paddingTop: insets.top + 8 }]}>
      <View style={styles.navBarWrapper}>
        {/* Gradient pour l'effet liquid glass */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.95)", "rgba(10, 10, 10, 0.98)", "rgba(0, 0, 0, 0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.navBarGradient}
        >
          {/* Reflet en haut pour effet glass */}
          <View style={styles.glassReflection} />
          
          <View style={styles.navBar}>
            {/* Onglets à gauche */}
            <View style={styles.tabsContainer}>
              <Pressable
                style={[styles.tab, isChatActive && styles.tabActive]}
                onPress={handleChatPress}
              >
                <Text
                  style={[
                    styles.tabText,
                    isChatActive && styles.tabTextActive,
                  ]}
                >
                  Chat
                </Text>
              </Pressable>
              
              <Pressable
                style={[styles.tab, isHistoryActive && styles.tabActive]}
                onPress={handleHistoryPress}
              >
                <Text
                  style={[
                    styles.tabText,
                    isHistoryActive && styles.tabTextActive,
                  ]}
                >
                  Suivi
                </Text>
              </Pressable>
            </View>

            {/* Bouton profil à droite */}
            <Pressable
              style={styles.profileButton}
              onPress={handleProfilePress}
            >
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.profileButtonGradient}
              >
                <Text style={styles.profileInitial}>{profileInitial}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  navBarWrapper: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  navBarGradient: {
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  glassReflection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    opacity: 0.8,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    position: "relative",
    zIndex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    textShadowColor: "rgba(255, 255, 255, 0.2)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
});

