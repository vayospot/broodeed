import Colors from "@/constants/Colors";
import { HeaderBackButton } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function LogLayout() {
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
        headerBackVisible: true,
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
        name="index"
        options={{
          headerTitle: "Daily Log",
        }}
      />
    </Stack>
  );
}
