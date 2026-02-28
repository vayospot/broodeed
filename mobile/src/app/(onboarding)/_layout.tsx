import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function OnboardingLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitle: "",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="farm" />
    </Stack>
  );
}
