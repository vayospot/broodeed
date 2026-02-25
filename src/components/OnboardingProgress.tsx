import tw from "@/lib/tailwind";
import { View } from "react-native";

interface OnboardingProgressProps {
  totalSteps: number;
  currentStep: number;
}

export default function OnboardingProgress({
  totalSteps,
  currentStep,
}: OnboardingProgressProps) {
  return (
    <View style={tw`flex-row justify-center gap-2`}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index <= currentStep;
        return (
          <View
            key={index}
            style={tw`w-2 h-2 rounded-full ${
              isActive ? "bg-brand-primary" : "border border-border"
            }`}
          />
        );
      })}
    </View>
  );
}
