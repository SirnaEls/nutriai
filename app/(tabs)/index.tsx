import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter, useSegments } from "expo-router";
import { useChatStore } from "../../src/store/chat";
import { useFoodStore } from "../../src/store/food";
import { useProfileStore } from "../../src/store/profile";
import { useAuthStore } from "../../src/store/auth";
import type { ParseResponse } from "../../src/domain/types";
import { chatWithAI } from "../../src/services/nutrition-ai";
import { addFoodEntry } from "../../src/services/database";
import NavBar from "../../components/NavBar";
import Logo from "../../components/Logo";
import { logger } from "../../src/utils/logger";

export default function ChatScreen() {
  const router = useRouter();
  const segments = useSegments();
  const [inputText, setInputText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animations pour le loader
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;
  const { profile } = useProfileStore();
  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { addFromParse } = useFoodStore();
  
  const isChatActive = !segments.includes("history");

  // Ne plus créer automatiquement le message de bienvenue
  // L'écran de bienvenue sera affiché via showWelcome

  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isLoading]);

  // Animation du loader
  useEffect(() => {
    if (isLoading) {
      // Animation en boucle pour les 3 points
      const createAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const anim1 = createAnimation(dot1Anim, 0);
      const anim2 = createAnimation(dot2Anim, 150);
      const anim3 = createAnimation(dot3Anim, 300);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    } else {
      // Réinitialiser les animations
      dot1Anim.setValue(0.4);
      dot2Anim.setValue(0.4);
      dot3Anim.setValue(0.4);
    }
  }, [isLoading]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    // Ajouter le message utilisateur
    await addMessage("user", text);
    setInputText("");
    setLoading(true);

    try {
      // Construire l'historique de conversation (derniers 10 messages pour le contexte)
      const conversationHistory = messages
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Chat conversationnel avec l'IA (comme ChatGPT)
      const chatResponse = await chatWithAI(text, conversationHistory);

      // Ajouter la réponse conversationnelle de l'IA
      await addMessage("assistant", chatResponse.text, chatResponse.parsedData ? {
        meal: chatResponse.parsedData.meal,
        items: chatResponse.parsedData.items,
        totalKcal: chatResponse.parsedData.totalKcal,
        summary: chatResponse.parsedData.summary,
      } : undefined);
    } catch (error: any) {
      // Les erreurs sont déjà loggées dans nutrition-ai.ts
      const errorMessage = error?.message || String(error);
      
      // Message d'erreur plus détaillé pour debug
      let errorText = "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?";
      
      if (errorMessage?.includes("401") || errorMessage?.includes("Unauthorized")) {
        errorText = "⚠️ Erreur d'authentification avec l'API OpenAI. La clé API semble invalide ou manquante. Mode fallback activé.";
      } else if (errorMessage?.includes("API error")) {
        errorText = `Erreur API: ${errorMessage.substring(0, 100)}`;
      }
      
      await addMessage("assistant", errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTracking = async (messageId: string, date?: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.parsedData) return;

    const parseResponse: ParseResponse = {
      meal: message.parsedData.meal as ParseResponse["meal"],
      items: message.parsedData.items.map((item) => ({
        name: item.name,
        qty: item.qty,
        unit: item.unit,
        kcal: item.kcal,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fat: item.fat || 0,
        fiber: item.fiber || 0,
      })),
      totalKcal: message.parsedData.totalKcal,
      summary: message.parsedData.summary,
    };

    // Si une date est fournie, modifier le store pour utiliser cette date
    if (date) {
      // Créer une entrée avec la date spécifiée
      const day = date;
      const entry = {
        ...parseResponse,
        id: (global as any).crypto?.randomUUID?.() ?? String(Math.random()),
        createdAt: new Date(date + "T12:00:00").toISOString(),
      };
      
      // Utiliser directement le store pour ajouter avec la date spécifiée
      const { byDay } = useFoodStore.getState();
      const arr = byDay[day] ?? [];
      useFoodStore.setState({
        byDay: { ...byDay, [day]: [entry, ...arr] },
      });
      
      // Sauvegarder dans Firebase si connecté
      try {
        const { user } = useAuthStore.getState();
        if (user) {
          const firebaseId = await addFoodEntry(user.uid, parseResponse, date);
          useFoodStore.setState({
            byDay: {
              ...useFoodStore.getState().byDay,
              [day]: useFoodStore.getState().byDay[day]?.map((e) =>
                e.id === entry.id ? { ...e, firebaseId } : e
              ) ?? [entry],
            },
          });
        }
      } catch (error) {
        // Les erreurs sont déjà loggées dans le store
      }
    } else {
      await addFromParse(parseResponse);
    }

    // Ajouter un message de confirmation
    const dateText = date ? ` pour le ${new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : "";
    await addMessage("assistant", `Aliment ajouté à votre suivi${dateText} ! ✨`);
    setShowDatePicker(false);
    setSelectedDate(null);
    setPendingMessageId(null);
  };

  const openDatePicker = (messageId: string) => {
    setPendingMessageId(messageId);
    setShowDatePicker(true);
  };

  const confirmDateSelection = () => {
    if (pendingMessageId) {
      handleAddToTracking(pendingMessageId, selectedDate || undefined);
    }
  };

  const suggestedQueries = [
    "Je veux savoir calculer mon apport calorique journalier",
    "Je veux que tu me fasses un programme de sport",
    "Je veux ajouter des aliments à ma consommation journalière",
  ];

  // Afficher l'écran de bienvenue seulement s'il n'y a pas encore de messages utilisateur
  const showWelcome = messages.filter(m => m.role === "user").length === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar fixe en haut */}
      <NavBar />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo et message de bienvenue personnalisé - toujours affiché en haut */}
          {showWelcome && (
            <>
              <View style={styles.welcomeContainer}>
                <View style={styles.logoContainer}>
                  <Logo size={100} showBackground={false} />
                </View>
                <View style={styles.welcomeMessageContainer}>
                  <View style={styles.welcomeTextContainer}>
                    <Text style={styles.welcomeText}>Bonjour </Text>
                    <Text style={styles.welcomeName}>
                      {profile.firstName || "utilisateur"}
                    </Text>
                  </View>
                  <Text style={styles.welcomeSubtext}>
                    Demande n'importe quoi, je te fournirais une réponse
                  </Text>
                </View>
              </View>

              {/* Icône éclair centrée */}
              <View style={styles.lightningContainer}>
                <FontAwesome name="bolt" size={20} color="#9333EA" />
              </View>

              {/* Suggestions initiales - affichées seulement s'il n'y a pas de messages */}
              {messages.filter(m => m.role === "user").length === 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsHeaderText}>Aide à la recherche</Text>
                  {suggestedQueries.map((query, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [
                        styles.suggestionButton,
                        pressed && styles.suggestionButtonPressed,
                      ]}
                      onPress={async () => {
                        setInputText(query);
                        // Envoyer directement le message
                        const text = query.trim();
                        if (!text || isLoading) return;
                        await addMessage("user", text);
                        setInputText("");
                        setLoading(true);
                        try {
                          const conversationHistory = messages
                            .slice(-10)
                            .map((msg) => ({
                              role: msg.role,
                              content: msg.content,
                            }));
                          const chatResponse = await chatWithAI(text, conversationHistory);
                          await addMessage("assistant", chatResponse.text, chatResponse.parsedData ? {
                            meal: chatResponse.parsedData.meal,
                            items: chatResponse.parsedData.items,
                            totalKcal: chatResponse.parsedData.totalKcal,
                            summary: chatResponse.parsedData.summary,
                          } : undefined);
                        } catch (error: any) {
                          const errorMessage = error?.message || String(error);
                          let errorText = "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?";
                          if (errorMessage?.includes("401") || errorMessage?.includes("Unauthorized")) {
                            errorText = "⚠️ Erreur d'authentification avec l'API OpenAI. La clé API semble invalide ou manquante. Mode fallback activé.";
                          } else if (errorMessage?.includes("API error")) {
                            errorText = `Erreur API: ${errorMessage.substring(0, 100)}`;
                          }
                          await addMessage("assistant", errorText);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.suggestionButtonText}>{query}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Messages de chat - affichés en dessous du welcome */}
          {messages.filter(m => m.role === "user").length > 0 && messages.map((message, index) => (
            <View key={message.id}>
              <View
                style={[
                  styles.messageContainer,
                  message.role === "user"
                    ? styles.userMessageContainer
                    : styles.assistantMessageContainer,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === "user"
                      ? styles.userMessageText
                      : styles.assistantMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>

              {/* Bouton "Ajouter à mon suivi" pour les messages de l'IA avec données parsées */}
              {message.role === "assistant" &&
                message.parsedData &&
                !messages
                  .slice(messages.indexOf(message) + 1)
                  .some(
                    (m) =>
                      m.role === "assistant" &&
                      m.content.includes("ajouté à votre suivi")
                  ) && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.addButton,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => openDatePicker(message.id)}
                  >
                    <FontAwesome name="plus" size={16} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Ajouter à mon suivi</Text>
                  </Pressable>
                )}
            </View>
          ))}

          {/* Indicateur de chargement amélioré */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <View style={styles.loadingDots}>
                  <Animated.View 
                    style={[
                      styles.loadingDot, 
                      { opacity: dot1Anim }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.loadingDot, 
                      { opacity: dot2Anim }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.loadingDot, 
                      { opacity: dot3Anim }
                    ]} 
                  />
                </View>
                <Text style={styles.loadingText}>Analyse en cours...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Modal de sélection de date */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowDatePicker(false);
            setSelectedDate(null);
            setPendingMessageId(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sélectionner une date</Text>
              <Text style={styles.modalSubtitle}>Pour quel jour voulez-vous ajouter cet aliment ?</Text>
              
              <ScrollView 
                style={styles.dateOptionsScroll}
                contentContainerStyle={styles.dateOptions}
                showsVerticalScrollIndicator={false}
              >
                {[
                  { label: "Aujourd'hui", date: new Date().toISOString().slice(0, 10) },
                  { label: "Hier", date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                  { label: "Il y a 2 jours", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                  { label: "Il y a 3 jours", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                  { label: "Il y a 4 jours", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                  { label: "Il y a 5 jours", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                  { label: "Il y a 6 jours", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
                ].map((option) => (
                  <Pressable
                    key={option.date}
                    style={({ pressed }) => [
                      styles.dateOption,
                      selectedDate === option.date && styles.dateOptionSelected,
                      pressed && styles.dateOptionPressed,
                    ]}
                    onPress={() => setSelectedDate(option.date)}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      selectedDate === option.date && styles.dateOptionTextSelected,
                    ]}>
                      {option.label} ({new Date(option.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.modalButtonCancel,
                    pressed && styles.modalButtonPressed,
                  ]}
                  onPress={() => {
                    setShowDatePicker(false);
                    setSelectedDate(null);
                    setPendingMessageId(null);
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.modalButtonConfirm,
                    (!selectedDate || !pendingMessageId) && styles.modalButtonDisabled,
                    pressed && styles.modalButtonPressed,
                  ]}
                  onPress={confirmDateSelection}
                  disabled={!selectedDate || !pendingMessageId}
                >
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <FontAwesome
              name="paper-plane"
              size={18}
              color={!inputText.trim() || isLoading ? "#666" : "#FFFFFF"}
            />
          </Pressable>
        </View>
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
  messagesContainer: {
    flex: 1,
    marginTop: 100, // Espace pour la navbar fixe (status bar + navbar)
  },
  messagesContent: {
    padding: 20,
    gap: 16,
    paddingTop: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 32,
  },
  welcomeMessageContainer: {
    alignItems: "center",
    gap: 8,
  },
  welcomeTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
    color: "#D97757", // Couleur de dégradé simplifiée (rose)
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
    marginTop: 8,
  },
  lightningContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#FFFFFF",
    borderBottomRightRadius: 4,
  },
  assistantMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  userMessageText: {
    color: "#000000",
  },
  assistantMessageText: {
    color: "#FFFFFF",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  suggestionsContainer: {
    marginTop: 8,
    gap: 12,
    paddingHorizontal: 20,
  },
  suggestionsHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
    textAlign: "center",
    marginBottom: 12,
  },
  suggestionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  suggestionButtonPressed: {
    opacity: 0.8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  suggestionButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 8 : 12,
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFFFFF",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
    textAlign: "center",
  },
  dateOptionsScroll: {
    maxHeight: 300,
    marginBottom: 24,
  },
  dateOptions: {
    gap: 12,
    paddingBottom: 8,
  },
  dateOption: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "#FFFFFF",
  },
  dateOptionPressed: {
    opacity: 0.8,
  },
  dateOptionText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  dateOptionTextSelected: {
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalButtonConfirm: {
    backgroundColor: "#FFFFFF",
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonPressed: {
    opacity: 0.8,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  loadingContainer: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  loadingBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 180,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
});
