import { parseDeepLinkParams } from "@/lib/creem";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require("../../src/assets/fonts/Inter-Variable.ttf"),
    ...Ionicons.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const params = parseDeepLinkParams(event.url);

      if (!event.url.includes("payment/success")) return;

      const checkoutId = params.checkoutId ?? "";
      const orderId = params.orderId ?? "";

      console.log("[Deep Link] Payment URL received:", { checkoutId, orderId });

      router.replace(
        `/(tabs)/more/premium/success?checkoutId=${checkoutId}&orderId=${orderId}&method=deeplink`,
      );
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(onboarding)"
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
