import tw from "@/lib/tailwind";
import { storage, STORAGE_KEYS } from "@/stores/storage";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const hasOnboarded = storage.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE);

  return (
    <View style={tw`flex-1 bg-deep`}>
      <Redirect href={hasOnboarded ? "/(tabs)" : "/(onboarding)/welcome"} />
    </View>
  );
}
