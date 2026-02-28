import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import tw from "@/lib/tailwind";
import { storage, STORAGE_KEYS } from "@/stores/storage";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function FarmScreen() {
  const router = useRouter();
  const [farmName, setFarmName] = useState("");

  // Flock state
  const [flockName, setFlockName] = useState("");
  const [flockType, setFlockType] = useState<"broiler" | "layer">("broiler");
  const [birdCount, setBirdCount] = useState(100);

  const { addFlock, updateSettings } = useAppStore();

  const handleCreate = () => {
    // Save farm settings
    updateSettings({
      hasCompletedOnboarding: true,
      farmName: farmName.trim() || "My Farm",
    });

    // Add first flock
    addFlock({
      name: flockName.trim() || "Batch 1",
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

  const isValid = farmName.trim().length > 0;

  return (
    <View style={tw`flex-1 bg-deep px-6 pt-4 pb-10 justify-between`}>
      {/* Header */}
      <View>
        <Text style={tw`text-2xl font-bold text-primary mb-2`}>
          Set up your farm
        </Text>
      </View>

      {/* Form */}
      <View style={tw`flex-1 gap-5`}>
        {/* Farm Name */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            Farm Name
          </Text>
          <TextInput
            style={tw`h-14 bg-surface rounded-xl px-4 text-primary text-lg`}
            placeholder="My Farm"
            placeholderTextColor="#4A5E4D"
            value={farmName}
            onChangeText={setFarmName}
          />
        </View>

        {/* Divider */}
        <View style={tw`h-px bg-border my-2`} />

        {/* Flock Name */}
        <View>
          <Text style={tw`text-sm font-medium text-secondary mb-2`}>
            First Flock Name
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
              style={[
                tw`flex-1 h-24 rounded-xl items-center justify-center`,
                flockType === "broiler"
                  ? tw`bg-brand-primary/20 border-2 border-brand-primary`
                  : tw`bg-surface border-2 border-transparent`,
              ]}
              onPress={() => setFlockType("broiler")}
            >
              <Ionicons
                name="restaurant"
                size={28}
                color={flockType === "broiler" ? "#4CAF72" : "#8BA690"}
              />
              <Text
                style={[
                  tw`text-lg mt-2`,
                  flockType === "broiler"
                    ? tw`text-brand-primary font-semibold`
                    : tw`text-secondary`,
                ]}
              >
                Broiler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                tw`flex-1 h-24 rounded-xl items-center justify-center`,
                flockType === "layer"
                  ? tw`bg-brand-primary/20 border-2 border-brand-primary`
                  : tw`bg-surface border-2 border-transparent`,
              ]}
              onPress={() => setFlockType("layer")}
            >
              <Ionicons
                name="egg"
                size={28}
                color={flockType === "layer" ? "#4CAF72" : "#8BA690"}
              />
              <Text
                style={[
                  tw`text-lg mt-2`,
                  flockType === "layer"
                    ? tw`text-brand-primary font-semibold`
                    : tw`text-secondary`,
                ]}
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
              <Ionicons name="remove" size={24} color="#F0F5F1" />
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
              <Ionicons name="add" size={24} color="#F0F5F1" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <TouchableOpacity
        style={tw`h-14 bg-brand-amber rounded-xl items-center justify-center ${!isValid ? "opacity-50" : ""}`}
        onPress={handleCreate}
        disabled={!isValid}
        activeOpacity={0.8}
      >
        <Text style={tw`text-lg font-semibold text-deep`}>Create Farm</Text>
      </TouchableOpacity>
    </View>
  );
}
