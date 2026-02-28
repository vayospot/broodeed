import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import { createCheckout, parseDeepLinkParams } from "@/lib/creem";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import tw from "@/lib/tailwind";
import { storage } from "@/stores/storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { WebViewNavigation } from "react-native-webview";
import { WebView } from "react-native-webview";

// ─── Types

type CheckoutMethod = "browser" | "webview";

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const [checkoutMethod, setCheckoutMethod] =
    useState<CheckoutMethod>("browser");
  const [isLoading, setIsLoading] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState("");
  const [webViewLoading, setWebViewLoading] = useState(true);

  // Animations
  const crownFloat = useSharedValue(0);
  const webViewSlide = useSharedValue(1000);

  useEffect(() => {
    crownFloat.value = withRepeat(
      withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const crownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: crownFloat.value }],
  }));

  const webViewAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: webViewSlide.value }],
  }));

  // Handlers

  const handleClose = () => router.back();

  const handlePurchase = async () => {
    if (isLoading) return;
    setIsLoading(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const deviceId = getOrCreateDeviceId();

      const { checkoutUrl, checkoutId } = await createCheckout({
        planType: "monthly",
        deviceId,
      });

      storage.set("broodeed_last_checkout_id", checkoutId);

      if (checkoutMethod === "browser") {
        await openWithBrowser(checkoutUrl, checkoutId);
      } else {
        openWithWebView(checkoutUrl, checkoutId);
      }
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "Could not start checkout. Please check your connection and try again.",
        [{ text: "OK" }],
      );
      console.error("[premium] Checkout creation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Method A: External Browser
  // Uses ASWebAuthenticationSession (iOS) / Chrome Custom Tabs (Android).
  // openAuthSessionAsync watches for any redirect to our scheme "broodeed".

  const openWithBrowser = async (checkoutUrl: string, checkoutId: string) => {
    const result = await WebBrowser.openAuthSessionAsync(
      checkoutUrl,
      "broodeed",
    );

    if (result.type === "success") {
      const params = parseDeepLinkParams(result.url);
      router.push(
        `/(tabs)/more/premium/success?checkoutId=${params.checkoutId ?? checkoutId}&orderId=${params.orderId ?? ""}&method=browser`,
      );
    } else if (result.type === "cancel") {
      console.log("[premium] Browser checkout cancelled by user");
    }
  };

  // ── Method B: In-App WebView ──────────────────────────────────────────────
  // Renders CREEM checkout inside the app — user never visually leaves.
  //
  // WebViews cannot navigate to custom schemes (broodeed://).
  // So onNavigationStateChange / onShouldStartLoadWithRequest fires
  // BEFORE navigation happens. We detect broodeed://, stop the load,
  // parse params manually, navigate to success screen ourselves.

  const openWithWebView = (checkoutUrl: string, checkoutId: string) => {
    setWebViewUrl(checkoutUrl);
    setWebViewLoading(true);
    setWebViewVisible(true);
    webViewSlide.value = withTiming(0, { duration: 300 });
    storage.set("broodeed_last_checkout_id", checkoutId);
  };

  const handleWebViewNavStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    if (url.startsWith("broodeed://")) {
      webViewRef.current?.stopLoading();

      const params = parseDeepLinkParams(url);
      const storedCheckoutId =
        storage.getString("broodeed_last_checkout_id") ?? "";

      closeWebView();

      router.push(
        `/(tabs)/more/premium/success?checkoutId=${params.checkoutId ?? storedCheckoutId}&orderId=${params.orderId ?? ""}&method=webview`,
      );
    }
  };

  const closeWebView = () => {
    webViewSlide.value = withTiming(1000, { duration: 300 });
    setTimeout(() => setWebViewVisible(false), 300);
  };

  // ── Restore Purchase

  const handleRestore = async () => {
    const lastCheckoutId = storage.getString("broodeed_last_checkout_id");

    if (lastCheckoutId) {
      router.push(
        `/(tabs)/more/premium/success?checkoutId=${lastCheckoutId}&restore=true`,
      );
      return;
    }

    Alert.alert(
      "No Recent Purchase Found",
      "No purchase was found on this device. If you believe this is an error, contact support.",
      [{ text: "OK" }],
    );
  };

  // RENDER
  const premiumFeatures = [
    { icon: "layers", label: "Unlimited flocks" },
    { icon: "download", label: "CSV export for records" },
    { icon: "headset", label: "Priority support" },
    { icon: "remove-circle-outline", label: "No ads" },
  ];

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      {/* Close Button */}
      <TouchableOpacity
        style={tw`absolute right-4 z-10 p-2`}
        onPress={handleClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={28} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6 pb-12`}
        showsVerticalScrollIndicator={false}
      >
        {/* Floating Diamond */}
        <Animated.View style={[tw`items-center mb-6`, crownAnimatedStyle]}>
          <View
            style={[
              tw`w-24 h-24 rounded-full items-center justify-center`,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Ionicons name="diamond" size={48} color={colors.accent} />
          </View>
        </Animated.View>

        {/* Title */}
        <Text
          style={[
            tw`text-3xl font-bold text-center mb-2`,
            { color: colors.text },
          ]}
        >
          Premium
        </Text>

        {/* Subtitle */}
        <Text
          style={[tw`text-center mb-8 px-4`, { color: colors.textSecondary }]}
        >
          Manage unlimited flocks and export your farm data for accountants or
          banks.
        </Text>

        {/* Features */}
        <View
          style={[tw`rounded-xl p-4 mb-8`, { backgroundColor: colors.surface }]}
        >
          {premiumFeatures.map((feature, index) => (
            <View
              key={feature.label}
              style={[
                tw`flex-row items-center py-3`,
                index < premiumFeatures.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <Ionicons
                name={feature.icon as any}
                size={22}
                color={colors.primary}
              />
              <Text style={[tw`ml-3 text-base`, { color: colors.text }]}>
                {feature.label}
              </Text>
            </View>
          ))}
        </View>

        {/*  Checkout Method Toggle */}
        {/* This toggle demonstrates BOTH integration methods (browser and webview) in one screen.  */}

        <Text
          style={[tw`text-base font-semibold mb-3`, { color: colors.text }]}
        >
          How to open checkout:
        </Text>

        <View
          style={[
            tw`flex-row rounded-xl p-1 mb-6`,
            { backgroundColor: colors.surface },
          ]}
        >
          {(["browser", "webview"] as CheckoutMethod[]).map((method) => {
            const isSelected = checkoutMethod === method;
            return (
              <TouchableOpacity
                key={method}
                style={[
                  tw`flex-1 py-3 rounded-lg items-center`,
                  isSelected && { backgroundColor: colors.accent },
                ]}
                onPress={() => setCheckoutMethod(method)}
              >
                <Ionicons
                  name={
                    method === "browser"
                      ? "globe-outline"
                      : "phone-portrait-outline"
                  }
                  size={16}
                  color={isSelected ? colors.background : colors.textSecondary}
                  style={tw`mb-1`}
                />
                <Text
                  style={[
                    tw`text-xs font-semibold`,
                    {
                      color: isSelected
                        ? colors.background
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {method === "browser" ? "External Browser" : "In-App WebView"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Method description */}
        <View
          style={[tw`rounded-xl p-3 mb-8`, { backgroundColor: colors.surface }]}
        >
          <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
            {checkoutMethod === "browser"
              ? "Opens CREEM checkout in your device browser (Safari / Chrome). After payment, a deep link brings you back to the app automatically."
              : "Renders CREEM checkout inside a WebView within the app. You never visually leave Broodeed. The app intercepts the redirect and handles the return."}
          </Text>
        </View>

        {/* Plan Display */}
        <View
          style={[
            tw`p-4 rounded-xl border-2 mb-8`,
            {
              backgroundColor: colors.surface,
              borderColor: colors.accent,
            },
          ]}
        >
          <View style={tw`flex-row items-center justify-between`}>
            <View>
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
                Monthly Subscription
              </Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                Cancel anytime
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.accent}
                style={tw`mr-2`}
              />
              <Text style={[tw`text-2xl font-bold`, { color: colors.accent }]}>
                $1
              </Text>
              <Text style={[tw`text-sm ml-1`, { color: colors.textSecondary }]}>
                /mo
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[
            tw`p-4 rounded-xl items-center justify-center flex-row`,
            {
              backgroundColor: isLoading ? colors.accent + "80" : colors.accent,
            },
          ]}
          onPress={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ActivityIndicator
                size="small"
                color={colors.background}
                style={tw`mr-2`}
              />
              <Text
                style={[tw`text-lg font-bold`, { color: colors.background }]}
              >
                Opening checkout…
              </Text>
            </>
          ) : (
            <Text style={[tw`text-lg font-bold`, { color: colors.background }]}>
              Start Subscription — $1/mo
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore Purchase */}
        <TouchableOpacity
          style={tw`mt-6 mb-4 items-center`}
          onPress={handleRestore}
        >
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            Already purchased?{" "}
            <Text style={{ color: colors.primary }}>Restore Purchase</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* WebView Overlay */}
      {webViewVisible && (
        <Animated.View
          style={[
            tw`absolute inset-0 z-50`,
            { backgroundColor: colors.background },
            webViewAnimatedStyle,
          ]}
        >
          {/* Header */}
          <View
            style={[
              tw`flex-row items-center justify-between px-4 pt-14 pb-4`,
              {
                backgroundColor: colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <Text style={[tw`text-base font-semibold`, { color: colors.text }]}>
              Complete Payment
            </Text>
            <TouchableOpacity
              onPress={closeWebView}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Loading indicator */}
          {webViewLoading && (
            <View
              style={[
                tw`absolute inset-x-0 items-center justify-center`,
                { top: 100, bottom: 0 },
              ]}
            >
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[tw`mt-4 text-sm`, { color: colors.textSecondary }]}>
                Loading CREEM checkout…
              </Text>
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ uri: webViewUrl }}
            style={tw`flex-1`}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onNavigationStateChange={handleWebViewNavStateChange}
            onShouldStartLoadWithRequest={(request: WebViewNavigation) => {
              if (request.url.startsWith("broodeed://")) {
                handleWebViewNavStateChange(request);

                return false; // block WebView from attempting to load the custom scheme
              }
              return true;
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </Animated.View>
      )}
    </View>
  );
}
