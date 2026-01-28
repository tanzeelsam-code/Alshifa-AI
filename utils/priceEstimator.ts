
const PRICES: Record<string, string> = {
  paracetamol: "Rs. 30 – 60",
  panadol: "Rs. 30 – 60",
  ibuprofen: "Rs. 80 – 150",
  brufen: "Rs. 80 – 150",
  amoxicillin: "Rs. 250 – 450",
  augmentin: "Rs. 400 – 900",
  metformin: "Rs. 150 – 300",
  glucophage: "Rs. 150 – 300",
  aspirin: "Rs. 20 – 50",
  disprin: "Rs. 20 – 50",
};

export function estimatePricePK(medName: string): string {
  const normalized = medName.toLowerCase().trim();
  return PRICES[normalized] || "Contact Pharmacy";
}
