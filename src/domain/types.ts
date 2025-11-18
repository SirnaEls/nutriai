export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Item = {
  name: string;
  qty: number;
  amount?: number;
  unit?: "g" | "ml" | "piece";
  kcal?: number;
  protein?: number; // en grammes
  carbs?: number; // en grammes
  fat?: number; // en grammes
  fiber?: number; // en grammes
};

export type ParseResponse = {
  meal: MealType;
  items: Item[];
  totalKcal: number;
  summary: string;
};
