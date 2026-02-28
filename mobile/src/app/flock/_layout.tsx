import Colors from "@/constants/Colors";
import { HeaderBackButton } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function FlockLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitle: "",
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
        headerLeft: () => (
          <HeaderBackButton
            tintColor="white"
            onPress={() => {
              router.back();
            }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "Flock Details",
        }}
      />
    </Stack>
  );
}
