import { storage, STORAGE_KEYS } from "@/stores/storage";
import { Redirect } from "expo-router";

export default function Index() {
  // Read synchronously from MMKV (super fast, no async state needed)
  const hasOnboarded = storage.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE);

  // If they've completed onboarding, send them to the main app
  if (hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  // If false or undefined (first launch), send them to the welcome screen
  return <Redirect href="/(onboarding)/welcome" />;
}
