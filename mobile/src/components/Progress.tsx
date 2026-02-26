import tw from "@/lib/tailwind";
import { View } from "react-native";

interface ProgressProps {
  totalSteps: number;
  currentStep: number;
}

export default function Progress({ totalSteps, currentStep }: ProgressProps) {
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
