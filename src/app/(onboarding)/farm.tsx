import OnboardingProgress from "@/components/OnboardingProgress";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import tw from "@/lib/tailwind";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function FarmScreen() {
  const router = useRouter();
  const [farmName, setFarmName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [weightUnit, setWeightUnit] = useState("kg");

  const handleContinue = () => {
    if (farmName.trim().length > 0) {
      router.push("/(onboarding)/flock");
    }
  };

  return (
    <View style={tw`flex-1 bg-deep px-6 pt-20 pb-10 justify-between`}>
      {/* Header */}
      <View>
        {/* Progress */}
        <View style={tw`mb-8`}>
          <OnboardingProgress totalSteps={3} currentStep={1} />
        </View>

        <Text style={tw`text-2xl font-bold text-primary mb-2`}>
          Let&apos;s set up your farm
        </Text>
      </View>

      {/* Form */}
      <View style={tw`flex-1 gap-6`}>
        {/* Farm Name */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            Farm Name
          </Text>
          <TextInput
            style={tw`h-14 bg-surface rounded-xl px-4 text-primary text-lg`}
            placeholder="Adeola Farms"
            placeholderTextColor="#4A5E4D"
            value={farmName}
            onChangeText={setFarmName}
            autoFocus
          />
        </View>

        {/* Currency (disabled for now) */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            Currency
          </Text>
          <View
            style={tw`h-14 bg-surface/50 rounded-xl px-4 flex-row items-center justify-between opacity-60`}
          >
            <Text style={tw`text-primary/60 text-lg`}>
              ₦ NGN - Nigerian Naira
            </Text>
          </View>
        </View>

        {/* Weight Unit */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            Weight Unit
          </Text>
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              style={tw`flex-1 h-14 bg-surface rounded-xl items-center justify-center ${
                weightUnit === "kg" ? "border-2 border-brand-primary" : ""
              }`}
              onPress={() => setWeightUnit("kg")}
            >
              <Text
                style={tw`text-lg ${
                  weightUnit === "kg" ? "text-brand-primary" : "text-secondary"
                }`}
              >
                kg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 h-14 bg-surface rounded-xl items-center justify-center ${
                weightUnit === "lbs" ? "border-2 border-brand-primary" : ""
              }`}
              onPress={() => setWeightUnit("lbs")}
            >
              <Text
                style={tw`text-lg ${
                  weightUnit === "lbs" ? "text-brand-primary" : "text-secondary"
                }`}
              >
                lbs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <TouchableOpacity
        style={tw`h-14 bg-brand-amber rounded-xl items-center justify-center ${
          farmName.trim().length === 0 ? "opacity-50" : ""
        }`}
        onPress={handleContinue}
        disabled={farmName.trim().length === 0}
        activeOpacity={0.8}
      >
        <Text style={tw`text-lg font-semibold text-deep`}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}
