import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
  withSpring,
  withTiming,
} from "react-native-reanimated";

type PlanType = "one_time" | "monthly";

const PLAN_ONE_TIME: PlanType = "one_time";
const PLAN_MONTHLY: PlanType = "monthly";

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();
  const params = useLocalSearchParams<{ planType?: PlanType }>();

  const { premium, setPremium } = useAppStore();

  // Default to one_time, or use param
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    params.planType === PLAN_MONTHLY ? PLAN_MONTHLY : PLAN_ONE_TIME,
  );

  // Crown floating animation
  const crownFloat = useSharedValue(0);

  useEffect(() => {
    crownFloat.value = withRepeat(
      withTiming(-8, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, []);

  const crownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: crownFloat.value }],
  }));

  // Card scale animations
  const oneTimeScale = useSharedValue(1);
  const monthlyScale = useSharedValue(1);

  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    // Spring scale animation
    if (plan === PLAN_ONE_TIME) {
      oneTimeScale.value = withSpring(1.04, { damping: 15 });
      monthlyScale.value = withSpring(1, { damping: 15 });
    } else {
      monthlyScale.value = withSpring(1.04, { damping: 15 });
      oneTimeScale.value = withSpring(1, { damping: 15 });
    }
  };

  const handlePurchase = () => {
    // Simulate payment - in production this would open CREEM checkout
    Alert.alert(
      "Confirm Purchase",
      selectedPlan === PLAN_ONE_TIME
        ? "Pay $9.99 for lifetime premium access?"
        : "Pay $1.00/month for premium access?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // Set premium in store
            setPremium({
              isPremium: true,
              premiumType: selectedPlan,
            });
            // Navigate to success
            router.replace("/more/premium/success");
          },
        },
      ],
    );
  };

  const handleClose = () => {
    router.back();
  };

  const oneTimeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: oneTimeScale.value }],
  }));

  const monthlyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: monthlyScale.value }],
  }));

  const premiumFeatures = [
    "Unlimited flocks",
    "CSV export for records",
    "Priority support",
    "No ads (future)",
  ];

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      {/* Close button */}
      <TouchableOpacity
        style={tw`absolute top-12 right-4 z-10 p-2`}
        onPress={handleClose}
      >
        <Ionicons name="close" size={28} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6 pt-16`}
        showsVerticalScrollIndicator={false}
      >
        {/* Crown Icon with floating animation */}
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
          Broodeed Premium
        </Text>

        {/* Subtitle */}
        <Text
          style={[tw`text-center mb-8 px-4`, { color: colors.textSecondary }]}
        >
          Manage unlimited flocks and export your farm data for accountants or
          banks.
        </Text>

        {/* Features List */}
        <View
          style={[tw`rounded-xl p-4 mb-8`, { backgroundColor: colors.surface }]}
        >
          {premiumFeatures.map((feature, index) => (
            <View
              key={feature}
              style={[
                tw`flex-row items-center py-3`,
                index < premiumFeatures.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.primary}
              />
              <Text style={[tw`ml-3 text-base`, { color: colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Choose Your Plan */}
        <Text style={[tw`text-lg font-semibold mb-4`, { color: colors.text }]}>
          Choose Your Plan:
        </Text>

        {/* Plan Cards */}
        <Animated.View style={[tw`mb-4`, oneTimeAnimatedStyle]}>
          <TouchableOpacity
            style={[
              tw`p-4 rounded-xl border-2`,
              {
                backgroundColor: colors.surface,
                borderColor:
                  selectedPlan === PLAN_ONE_TIME
                    ? colors.accent
                    : colors.border,
              },
            ]}
            onPress={() => handleSelectPlan(PLAN_ONE_TIME)}
          >
            <View style={tw`flex-row items-center justify-between`}>
              <View>
                <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
                  One-Time
                </Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                  Pay once, yours forever
                </Text>
              </View>
              <View style={tw`flex-row items-center`}>
                {selectedPlan === PLAN_ONE_TIME && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent}
                    style={tw`mr-2`}
                  />
                )}
                <Text
                  style={[tw`text-2xl font-bold`, { color: colors.accent }]}
                >
                  $9.99
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[tw`mb-6`, monthlyAnimatedStyle]}>
          <TouchableOpacity
            style={[
              tw`p-4 rounded-xl border-2`,
              {
                backgroundColor: colors.surface,
                borderColor:
                  selectedPlan === PLAN_MONTHLY ? colors.accent : colors.border,
              },
            ]}
            onPress={() => handleSelectPlan(PLAN_MONTHLY)}
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
                {selectedPlan === PLAN_MONTHLY && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accent}
                    style={tw`mr-2`}
                  />
                )}
                <Text
                  style={[tw`text-2xl font-bold`, { color: colors.accent }]}
                >
                  $1.00
                </Text>
                <Text
                  style={[tw`text-sm ml-1`, { color: colors.textSecondary }]}
                >
                  /mo
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Unlock Button */}
        <TouchableOpacity
          style={[
            tw`p-4 rounded-xl items-center justify-center`,
            { backgroundColor: colors.accent },
          ]}
          onPress={handlePurchase}
        >
          <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
            {selectedPlan === PLAN_ONE_TIME
              ? "🔓 Unlock Premium"
              : "🔓 Start Subscription"}
          </Text>
        </TouchableOpacity>

        {/* Restore Purchase */}
        <TouchableOpacity style={tw`mt-6 items-center`}>
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            Already purchased?{" "}
            <Text style={{ color: colors.primary }}>Restore Purchase</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
