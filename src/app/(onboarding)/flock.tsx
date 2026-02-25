import OnboardingProgress from "@/components/OnboardingProgress";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import tw from "@/lib/tailwind";
import { storage, STORAGE_KEYS } from "@/stores/storage";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function FlockScreen() {
  const router = useRouter();
  const [flockName, setFlockName] = useState("");
  const [flockType, setFlockType] = useState<"broiler" | "layer">("broiler");
  const [birdCount, setBirdCount] = useState(100);

  const { addFlock, updateSettings } = useAppStore();

  const handleCreate = () => {
    // Save farm settings
    updateSettings({ hasCompletedOnboarding: true });

    // Add first flock
    addFlock({
      name: flockName || "Batch 1",
      type: flockType,
      startDate: new Date().toISOString().split("T")[0],
      initialCount: birdCount,
      costPerBird: 0,
      status: "active",
    });

    // Save onboarding complete flag
    storage.set(STORAGE_KEYS.ONBOARDING_COMPLETE, true);

    router.replace("/(tabs)");
  };

  return (
    <View style={tw`flex-1 bg-deep px-6 pt-20 pb-10 justify-between`}>
      {/* Header */}
      <View>
        {/* Progress */}
        <View style={tw`mb-8`}>
          <OnboardingProgress totalSteps={3} currentStep={2} />
        </View>

        <Text style={tw`text-2xl font-bold text-primary mb-2`}>
          Tell us about your first flock
        </Text>
      </View>

      {/* Form */}
      <View style={tw`flex-1 gap-6`}>
        {/* Flock Name */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            Flock Name
          </Text>
          <TextInput
            style={tw`h-14 bg-surface rounded-xl px-4 text-primary text-lg`}
            placeholder="Batch 1"
            placeholderTextColor="#4A5E4D"
            value={flockName}
            onChangeText={setFlockName}
          />
        </View>

        {/* Flock Type */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            Flock Type
          </Text>
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              style={tw`flex-1 h-24 bg-surface rounded-xl items-center justify-center ${
                flockType === "broiler" ? "border-2 border-brand-primary" : ""
              }`}
              onPress={() => setFlockType("broiler")}
            >
              <Text style={tw`text-3xl mb-1`}>🍗</Text>
              <Text
                style={tw`text-lg ${
                  flockType === "broiler"
                    ? "text-brand-primary font-semibold"
                    : "text-secondary"
                }`}
              >
                Broiler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 h-24 bg-surface rounded-xl items-center justify-center ${
                flockType === "layer" ? "border-2 border-brand-primary" : ""
              }`}
              onPress={() => setFlockType("layer")}
            >
              <Text style={tw`text-3xl mb-1`}>🥚</Text>
              <Text
                style={tw`text-lg ${
                  flockType === "layer"
                    ? "text-brand-primary font-semibold"
                    : "text-secondary"
                }`}
              >
                Layer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bird Count */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            Number of Birds
          </Text>
          <View style={tw`flex-row items-center gap-4`}>
            <TouchableOpacity
              style={tw`w-16 h-16 bg-surface rounded-xl items-center justify-center`}
              onPress={() => setBirdCount(Math.max(1, birdCount - 10))}
            >
              <Text style={tw`text-2xl text-primary`}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={tw`flex-1 h-16 bg-surface rounded-xl px-4 text-3xl font-bold text-primary text-center`}
              value={birdCount.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setBirdCount(Math.max(1, num));
              }}
              keyboardType="number-pad"
              selectTextOnFocus
            />
            <TouchableOpacity
              style={tw`w-16 h-16 bg-surface rounded-xl items-center justify-center`}
              onPress={() => setBirdCount(birdCount + 10)}
            >
              <Text style={tw`text-2xl text-primary`}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <TouchableOpacity
        style={tw`h-14 bg-brand-amber rounded-xl items-center justify-center`}
        onPress={handleCreate}
        activeOpacity={0.8}
      >
        <Text style={tw`text-lg font-semibold text-deep`}>Create My Farm</Text>
      </TouchableOpacity>
    </View>
  );
}
