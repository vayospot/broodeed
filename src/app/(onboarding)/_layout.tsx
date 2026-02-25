import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerShown: true,
        headerTransparent: true,
        headerTitle: "",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="farm" />
      <Stack.Screen name="flock" />
    </Stack>
  );
}
