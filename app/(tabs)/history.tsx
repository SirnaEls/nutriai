import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useFoodStore } from "../../src/store/food";
import { useProfileStore } from "../../src/store/profile";
import { useWeightStore } from "../../src/store/weight";
import { useAuthStore } from "../../src/store/auth";
import { logger } from "../../src/utils/logger";
import NavBar from "../../components/NavBar";

// Générer les jours de la semaine
const getWeekDays = (selectedDate: Date) => {
  const days: Array<{ day: string; date: number; fullDate: string }> = [];
  const dayNames = ["Lu.", "Ma.", "Me.", "Je.", "Ve.", "Sa.", "Di."];
  
  // Trouver le lundi de la semaine
  const monday = new Date(selectedDate);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi = 1
  monday.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({
      day: dayNames[i],
      date: date.getDate(),
      fullDate: date.toISOString().slice(0, 10),
    });
  }
  
  return days;
};

// Calculer les macros pour un jour (utilise les vraies valeurs de l'IA si disponibles)
const calculateDayMacros = (entries: any[]) => {
  return entries.reduce(
    (acc, entry) => {
      entry.items?.forEach((item: any) => {
        // Vérifier si les macros sont définies (même si 0, elles doivent être présentes)
        const hasMacros = 
          item.protein !== undefined && 
          item.carbs !== undefined && 
          item.fat !== undefined;
        
        if (hasMacros) {
          // Macros réelles de l'IA (peuvent être 0)
          // Utiliser parseFloat pour gérer les décimales correctement
          acc.protein += parseFloat(String(item.protein || 0)) || 0;
          acc.carbs += parseFloat(String(item.carbs || 0)) || 0;
          acc.fat += parseFloat(String(item.fat || 0)) || 0;
          acc.fiber += parseFloat(String(item.fiber || 0)) || 0;
        } else {
          // Fallback : estimation basée sur les calories (pour les anciennes entrées)
          const proteinGrams = (item.kcal || 0) * 0.25 / 4;
          const carbGrams = (item.kcal || 0) * 0.45 / 4;
          const fatGrams = (item.kcal || 0) * 0.30 / 9;
          const fiberGrams = (item.kcal || 0) * 0.02;
          
          acc.protein += proteinGrams;
          acc.carbs += carbGrams;
          acc.fat += fatGrams;
          acc.fiber += fiberGrams;
        }
      });
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
};

export default function HistoryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFoods, setShowFoods] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const { byDay, remove } = useFoodStore();
  const { calculateDailyCalories, calculateMacros, profile } = useProfileStore();
  const { entries: weightEntries, addWeight, loadWeights } = useWeightStore();
  const { user } = useAuthStore();

  // Charger les poids depuis Firebase au démarrage
  useEffect(() => {
    if (user) {
      loadWeights(user.uid).catch((err) => logger.error("Erreur chargement poids:", err));
    }
  }, [user]);

  const weekDays = getWeekDays(selectedDate);
  const today = new Date().toISOString().slice(0, 10);
  const selectedDayKey = weekDays.find(
    (d) =>
      d.date === selectedDate.getDate() &&
      d.fullDate.slice(0, 10) === selectedDate.toISOString().slice(0, 10)
  )?.fullDate || today;

  const dayEntries = byDay[selectedDayKey] || [];
  const totalCalories = dayEntries.reduce((sum, e) => sum + e.totalKcal, 0);
  const dailyGoal = calculateDailyCalories() || 2300;
  const remainingCalories = dailyGoal - totalCalories; // Permet les valeurs négatives pour montrer le dépassement
  const macros = calculateMacros() || { protein: 188, carbs: 188, fat: 188, fiber: 188 };
  const dayMacros = calculateDayMacros(dayEntries);

  // Grouper les entrées par type de repas
  const mealsByType = {
    breakfast: dayEntries.filter((e) => e.meal === "breakfast"),
    lunch: dayEntries.filter((e) => e.meal === "lunch"),
    dinner: dayEntries.filter((e) => e.meal === "dinner"),
    snack: dayEntries.filter((e) => e.meal === "snack"),
  };

  const mealLabels: Record<string, string> = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collation",
  };

  // Construire les données de poids pour la courbe
  // Utiliser uniquement les entrées de poids (pas le poids du profil directement)
  const weightData = useMemo(() => {
    const data: Array<{ date: string; weight: number }> = [];

    // Utiliser uniquement les entrées de poids sauvegardées
    weightEntries.forEach((entry) => {
      data.push({
        date: entry.date,
        weight: entry.weight,
      });
    });

    // Trier par date
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightEntries]);

  const hasWeightData = weightData.length > 0;

  const handleAddWeight = async () => {
    const weight = parseFloat(weightInput.replace(",", "."));
    if (isNaN(weight) || weight <= 0 || weight > 500) {
      Alert.alert("Erreur", "Veuillez entrer un poids valide (entre 1 et 500 kg)");
      return;
    }

    try {
      await addWeight(weight);
      setWeightInput("");
      setShowWeightModal(false);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter le poids");
    }
  };

  const handleDaySelect = (fullDate: string) => {
    setSelectedDate(new Date(fullDate));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar fixe en haut */}
      <NavBar />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendrier hebdomadaire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cette semaine</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekContainer}
          >
            {weekDays.map((day, index) => {
              const isSelected = day.fullDate === selectedDayKey;
              const hasData = !!byDay[day.fullDate]?.length;
              
              return (
                <Pressable
                  key={index}
                  style={styles.dayContainer}
                  onPress={() => handleDaySelect(day.fullDate)}
                >
                  <Text style={styles.dayName}>{day.day}</Text>
                  <View style={[styles.dateCircle, isSelected && styles.dateCircleSelected]}>
                    <Text
                      style={[
                        styles.dateText,
                        isSelected && styles.dateTextSelected,
                      ]}
                    >
                      {day.date}
                    </Text>
                  </View>
                  <View style={styles.dayBar}>
                    {hasData && <View style={styles.dayBarDot} />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Calories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calories</Text>
          <Text style={styles.sectionSubtitle}>
            Calories restantes = objectif - aliments
          </Text>
          
          <View style={styles.caloriesContainer}>
            <View style={[
              styles.caloriesMain,
              remainingCalories < 0 && styles.caloriesMainOver
            ]}>
              <Text style={[
                styles.caloriesValue,
                remainingCalories < 0 && styles.caloriesValueOver
              ]}>
                {remainingCalories < 0 ? `-${Math.abs(remainingCalories)}` : remainingCalories}
              </Text>
              <Text style={styles.caloriesLabel}>
                {remainingCalories < 0 ? "Calories en excès" : "Calories restantes"}
              </Text>
            </View>
            
            <View style={styles.caloriesDetails}>
              <View style={styles.caloriesDetailRow}>
                <Text style={styles.caloriesDetailLabel}>Objectif de base</Text>
                <Text style={styles.caloriesDetailValue}>{dailyGoal}</Text>
              </View>
              <View style={styles.caloriesDetailRow}>
                <Text style={styles.caloriesDetailLabel}>Aliments</Text>
                <Text style={styles.caloriesDetailValue}>{totalCalories}</Text>
              </View>
            </View>
          </View>

          {dayEntries.length > 0 && (
            <Pressable 
              style={styles.showFoodsButton}
              onPress={() => setShowFoods(!showFoods)}
            >
              <Text style={styles.showFoodsButtonText}>
                {showFoods ? "Masquer les aliments" : "Afficher les aliments"}
              </Text>
            </Pressable>
          )}

          {/* Liste des aliments par repas */}
          {showFoods && dayEntries.length > 0 && (
            <View style={styles.foodsListContainer}>
              {(Object.keys(mealsByType) as Array<keyof typeof mealsByType>).map((mealType) => {
                const meals = mealsByType[mealType];
                if (meals.length === 0) return null;

                const mealCalories = meals.reduce((sum, e) => sum + e.totalKcal, 0);
                const mealMacros = calculateDayMacros(meals);

                return (
                  <View key={mealType} style={styles.mealSection}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealTitle}>{mealLabels[mealType]}</Text>
                      <Text style={styles.mealCalories}>{mealCalories} kcal</Text>
                    </View>
                    
                    <View style={styles.mealMacros}>
                      <Text style={styles.mealMacroText}>
                        P: {mealMacros.protein.toFixed(1)}g
                      </Text>
                      <Text style={styles.mealMacroText}>
                        G: {mealMacros.carbs.toFixed(1)}g
                      </Text>
                      <Text style={styles.mealMacroText}>
                        L: {mealMacros.fat.toFixed(1)}g
                      </Text>
                      {mealMacros.fiber > 0 && (
                        <Text style={styles.mealMacroText}>
                          F: {mealMacros.fiber.toFixed(1)}g
                        </Text>
                      )}
                    </View>

                    {meals.map((entry, idx) => (
                      <View key={idx} style={styles.foodItem}>
                        <View style={styles.foodItemHeader}>
                          <View style={styles.foodItemInfo}>
                            <Text style={styles.foodItemName}>{entry.summary}</Text>
                            <Text style={styles.foodItemCalories}>{entry.totalKcal} kcal</Text>
                          </View>
                          <Pressable
                            style={styles.deleteButton}
                            onPress={() => {
                              // Trouver le jour de l'entrée en cherchant dans tous les jours
                              let entryDay = selectedDayKey;
                              for (const [dayKey, entries] of Object.entries(byDay)) {
                                if (entries.some(e => e.id === entry.id)) {
                                  entryDay = dayKey;
                                  break;
                                }
                              }
                              remove(entryDay, entry.id);
                            }}
                          >
                            <FontAwesome name="trash" size={14} color="rgba(255, 255, 255, 0.7)" />
                          </Pressable>
                        </View>
                        {entry.items?.map((item, itemIdx) => (
                          <Text key={itemIdx} style={styles.foodItemDetail}>
                            • {item.name} {item.qty}{item.unit || "g"} ({item.kcal || 0} kcal)
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Section Macros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition macro</Text>
          
          <View style={styles.macrosContainer}>
            {[
              { name: "Protéines", value: dayMacros.protein, total: macros.protein, unit: "g" },
              { name: "Glucides", value: dayMacros.carbs, total: macros.carbs, unit: "g" },
              { name: "Lipides", value: dayMacros.fat, total: macros.fat, unit: "g" },
              { name: "Fibres", value: dayMacros.fiber, total: macros.fiber, unit: "g" },
            ].map((macro, index) => {
              const percentage = Math.min(100, (macro.value / macro.total) * 100);
              
          return (
                <View key={index} style={styles.macroRow}>
                  <View style={styles.macroHeader}>
                    <Text style={styles.macroName}>{macro.name}</Text>
                    <Text style={styles.macroValue}>
                      {macro.value.toFixed(1)}/{macro.total}{macro.unit}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Courbe du poids */}
        <View style={styles.section}>
          <View style={styles.weightHeader}>
            <View>
              <Text style={styles.sectionTitle}>Courbe du poids</Text>
              <Text style={styles.sectionSubtitle}>
                {weightData.length > 0 ? `${weightData.length} point${weightData.length > 1 ? 's' : ''}` : 'Aucune donnée'}
              </Text>
            </View>
            <Pressable
              style={styles.addWeightButton}
              onPress={() => setShowWeightModal(true)}
            >
              <FontAwesome name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addWeightButtonText}>Ajouter</Text>
            </Pressable>
          </View>
          
          {!hasWeightData ? (
            <View style={styles.noWeightData}>
              <Text style={styles.noWeightDataText}>Aucune donnée de poids</Text>
              <Text style={styles.noWeightDataSubtext}>
                Ajoutez votre poids pour suivre votre évolution
              </Text>
            </View>
          ) : (
            <View style={styles.weightChart}>
            {/* Graphique simplifié */}
            <View style={styles.chartContainer}>
              <View style={styles.chartYAxis}>
                {(() => {
                  const weights = weightData.map(d => d.weight);
                  const minWeight = Math.min(...weights);
                  const maxWeight = Math.max(...weights);
                  const range = maxWeight - minWeight || 1; // Éviter division par 0
                  const step = Math.max(0.5, range / 3); // Utiliser des décimales si nécessaire
                  const yLabels = [];
                  // Générer 4 labels
                  for (let i = 0; i < 4; i++) {
                    const value = maxWeight - (step * i);
                    yLabels.push(Math.round(value * 10) / 10); // Arrondir à 1 décimale
                  }
                  return yLabels.map((val, i) => (
                    <Text key={i} style={styles.chartYLabel}>
                      {val.toFixed(1)}
                    </Text>
                  ));
                })()}
              </View>
              
              <View style={styles.chartArea}>
                {/* Ligne de tendance simplifiée */}
                <View style={styles.chartLine}>
                  {weightData.map((point, i) => {
                    // Gérer le cas où il n'y a qu'un seul point
                    const x = weightData.length > 1 
                      ? (i / (weightData.length - 1)) * 100 
                      : 50; // Centrer si un seul point
                    const weights = weightData.map(d => d.weight);
                    const minWeight = Math.min(...weights);
                    const maxWeight = Math.max(...weights);
                    const range = maxWeight - minWeight || 1; // Éviter division par 0
                    const yPercent = 100 - ((point.weight - minWeight) / range) * 100;
                    
                    // Ligne vers le point suivant (simplifiée)
                    const nextPoint = weightData[i + 1];
                    let lineElement = null;
                    if (nextPoint && weightData.length > 1) {
                      const nextX = ((i + 1) / (weightData.length - 1)) * 100;
                      const nextYPercent = 100 - ((nextPoint.weight - minWeight) / (maxWeight - minWeight)) * 100;
                      
                      // Approximation de la ligne avec des segments horizontaux et verticaux
                      const midX = (x + nextX) / 2;
                      const midY = (yPercent + nextYPercent) / 2;
                      
                      lineElement = (
                        <>
                          <View
                            key={`line-h-${i}`}
                            style={[
                              styles.chartLineSegment,
                              {
                                left: `${x}%`,
                                top: `${yPercent}%`,
                                width: `${nextX - x}%`,
                                height: 2,
                              },
                            ]}
                          />
                          <View
                            key={`line-v-${i}`}
                            style={[
                              styles.chartLineSegment,
                              {
                                left: `${midX}%`,
                                top: `${Math.min(yPercent, nextYPercent)}%`,
                                width: 2,
                                height: `${Math.abs(nextYPercent - yPercent)}%`,
                              },
                            ]}
                          />
                        </>
                      );
                    }
                    
                    return (
                      <View key={i}>
                        {lineElement}
                        <View
                          style={[
                            styles.chartPoint,
                            {
                              left: `${x}%`,
                              top: `${yPercent}%`,
                            },
                          ]}
                        >
                          <View style={styles.chartPointCircle}>
                            <Text style={styles.chartPointText}>{point.weight}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
                
                {/* Axe X */}
                <View style={styles.chartXAxis}>
                  {weightData.map((point, i) => (
                    <Text key={i} style={styles.chartXLabel}>
                      {new Date(point.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                </Text>
              ))}
                </View>
              </View>
            </View>
          </View>
          )}
    </View>
      </ScrollView>

      {/* Modal pour ajouter le poids */}
      <Modal
        visible={showWeightModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter mon poids</Text>
            <Text style={styles.modalSubtitle}>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            <TextInput
              style={styles.weightInput}
              placeholder="Poids (kg)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowWeightModal(false);
                  setWeightInput("");
                }}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddWeight}
              >
                <Text style={styles.modalButtonConfirmText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  scrollView: {
    flex: 1,
    marginTop: 100, // Espace pour la navbar fixe (status bar + navbar)
  },
  scrollContent: {
    paddingBottom: 100,
  },
  noWeightData: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noWeightDataText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  noWeightDataSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  weekContainer: {
    gap: 12,
    paddingRight: 20,
  },
  dayContainer: {
    alignItems: "center",
    minWidth: 50,
  },
  dayName: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dateCircleSelected: {
    backgroundColor: "#FFFFFF",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  dateTextSelected: {
    color: "#000000",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  dayBar: {
    width: 2,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  dayBarDot: {
    position: "absolute",
    top: 0,
    left: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  caloriesContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  caloriesMain: {
    flex: 1,
    backgroundColor: "rgba(138, 43, 226, 0.2)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(138, 43, 226, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesMainOver: {
    backgroundColor: "rgba(255, 68, 68, 0.2)",
    borderColor: "rgba(255, 68, 68, 0.5)",
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  caloriesValueOver: {
    color: "#FF6B6B",
  },
  caloriesLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  caloriesDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },
  caloriesDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caloriesDetailLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  caloriesDetailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  showFoodsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginTop: 16,
  },
  showFoodsButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  foodsListContainer: {
    marginTop: 16,
    gap: 16,
  },
  mealSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  mealMacros: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  mealMacroText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  foodItem: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  foodItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  foodItemCalories: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  foodItemDetail: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginLeft: 8,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  macrosContainer: {
    gap: 16,
  },
  macroRow: {
    gap: 8,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroName: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  weightChart: {
    marginTop: 16,
  },
  chartContainer: {
    flexDirection: "row",
    height: 200,
  },
  chartYAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingRight: 8,
  },
  chartYLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  chartArea: {
    flex: 1,
    position: "relative",
  },
  chartLine: {
    flex: 1,
    position: "relative",
  },
  chartLineSegment: {
    position: "absolute",
    height: 2,
    backgroundColor: "#4CAF50",
    transformOrigin: "left center",
  },
  chartPoint: {
    position: "absolute",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  chartPointCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  chartPointText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  chartXLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  weightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addWeightButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  addWeightButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
  },
  weightInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Raleway',
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
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  modalButtonConfirm: {
    backgroundColor: "#FFFFFF",
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
});

