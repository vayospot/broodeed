import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import { buildPremiumStatus, verifyPremium } from "@/lib/creem";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const POLL_INTERVAL_MS = 2500; // ask backend every 2.5s
const POLL_MAX_ATTEMPTS = 12; // give up after ~30s total

type ScreenState = "polling" | "success" | "timeout" | "error";

export default function PaymentSuccessScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();
  const { setPremium } = useAppStore();

  const { checkoutId, orderId, method, restore } = useLocalSearchParams<{
    checkoutId?: string;
    orderId?: string;
    method?: string;
    restore?: string;
  }>();

  const [screenState, setScreenState] = useState<ScreenState>("polling");
  const [pollAttempts, setPollAttempts] = useState(0);

  const pollAttemptsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasUnlocked = useRef(false);

  // Animations
  const diamondScale = useSharedValue(0);
  const diamondOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const diamondAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: diamondScale.value }],
    opacity: diamondOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const unlockPremium = useCallback(
    async (result: Awaited<ReturnType<typeof verifyPremium>>) => {
      if (hasUnlocked.current) return;
      hasUnlocked.current = true;

      stopPolling();

      const premiumStatus = buildPremiumStatus(result);
      setPremium(premiumStatus);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setScreenState("success");
      diamondScale.value = withSpring(1, { damping: 8, stiffness: 150 });
      diamondOpacity.value = withTiming(1, { duration: 400 });
      contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    },
    [setPremium, stopPolling],
  );

  const checkVerification = useCallback(async () => {
    if (!checkoutId) {
      setScreenState("error");
      stopPolling();
      return;
    }

    pollAttemptsRef.current += 1;
    setPollAttempts(pollAttemptsRef.current);

    try {
      const result = await verifyPremium(checkoutId);

      if (result.premium) {
        await unlockPremium(result);
        return;
      }

      if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling();
        setScreenState("timeout");
      }
    } catch {
      if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling();
        setScreenState("timeout");
      }
    }
  }, [checkoutId, stopPolling, unlockPremium]);

  // Start polling immediately on mount
  useEffect(() => {
    checkVerification();
    intervalRef.current = setInterval(checkVerification, POLL_INTERVAL_MS);
    return () => stopPolling();
  }, [checkVerification, stopPolling]);

  const handleCheckAgain = () => {
    pollAttemptsRef.current = 0;
    setPollAttempts(0);
    hasUnlocked.current = false;
    setScreenState("polling");
    checkVerification();
    intervalRef.current = setInterval(checkVerification, POLL_INTERVAL_MS);
  };

  const handleContinue = () => router.replace("/(tabs)");
  const handleGoBack = () => router.back();

  if (screenState === "polling") {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center p-8`,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />

        <Text
          style={[
            tw`text-xl font-bold text-center mt-6 mb-3`,
            { color: colors.text },
          ]}
        >
          Confirming your payment…
        </Text>

        <Text
          style={[tw`text-sm text-center`, { color: colors.textSecondary }]}
        >
          We&apos;re verifying your payment with CREEM.{"\n"}
          This usually takes just a second.
        </Text>

        {pollAttempts > 3 && (
          <Text
            style={[
              tw`text-xs text-center mt-4`,
              { color: colors.textSecondary },
            ]}
          >
            Still checking… ({pollAttempts}/{POLL_MAX_ATTEMPTS})
          </Text>
        )}

        {pollAttempts > 5 && (
          <TouchableOpacity style={tw`mt-8`} onPress={handleGoBack}>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Go back and try again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (screenState === "timeout") {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center p-8`,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={[
            tw`w-20 h-20 rounded-full items-center justify-center mb-6`,
            { backgroundColor: colors.accent + "20" },
          ]}
        >
          <Ionicons name="time-outline" size={40} color={colors.accent} />
        </View>

        <Text
          style={[
            tw`text-xl font-bold text-center mb-3`,
            { color: colors.text },
          ]}
        >
          Payment Received
        </Text>

        <Text
          style={[
            tw`text-sm text-center mb-8`,
            { color: colors.textSecondary },
          ]}
        >
          Your payment was processed by CREEM. It may take a moment to reflect
          in the app. Tap &apos;Check Again&apos; or check back in a minute.
        </Text>

        <TouchableOpacity
          style={[
            tw`w-full p-4 rounded-xl items-center mb-4`,
            { backgroundColor: colors.accent },
          ]}
          onPress={handleCheckAgain}
        >
          <Text style={[tw`text-base font-bold`, { color: colors.background }]}>
            Check Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoBack}>
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            Return to app
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (screenState === "error") {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center p-8`,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons
          name="alert-circle"
          size={64}
          color={colors.danger ?? "#E05C5C"}
        />
        <Text
          style={[
            tw`text-xl font-bold text-center mt-4 mb-3`,
            { color: colors.text },
          ]}
        >
          Verification Failed
        </Text>
        <Text
          style={[
            tw`text-sm text-center mb-8`,
            { color: colors.textSecondary },
          ]}
        >
          We couldn&apos;t verify your payment. If you were charged, please
          contact contact support with your order details.
        </Text>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={[tw`text-sm`, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`flex-1 justify-center p-6`}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[tw`items-center mb-6`, diamondAnimatedStyle]}>
          <View
            style={[
              tw`w-28 h-28 rounded-full items-center justify-center`,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Ionicons name="diamond" size={56} color={colors.accent} />
          </View>
        </Animated.View>

        <Animated.View style={contentAnimatedStyle}>
          <Text
            style={[
              tw`text-3xl font-bold text-center mb-4`,
              { color: colors.text },
            ]}
          >
            You&apos;re Premium! 🎉
          </Text>

          <Text
            style={[tw`text-center mb-8 px-4`, { color: colors.textSecondary }]}
          >
            Welcome to Broodeed Premium. You now have unlimited flocks and CSV
            export access.
          </Text>

          <View
            style={[
              tw`rounded-xl p-4 mb-8`,
              { backgroundColor: colors.surface },
            ]}
          >
            {[
              { icon: "layers", label: "Unlimited flocks" },
              { icon: "download", label: "CSV export for records" },
            ].map((feature, index, arr) => (
              <View
                key={feature.label}
                style={[
                  tw`flex-row items-center py-3`,
                  index < arr.length - 1 && {
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
        </Animated.View>
      </ScrollView>

      <Animated.View style={[tw`p-6 pb-10`, contentAnimatedStyle]}>
        <TouchableOpacity
          style={[
            tw`p-4 rounded-xl items-center justify-center`,
            { backgroundColor: colors.accent },
          ]}
          onPress={handleContinue}
        >
          <Text style={[tw`text-lg font-bold`, { color: colors.background }]}>
            Continue to Farm
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
