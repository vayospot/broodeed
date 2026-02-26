import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function PaymentSuccessScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();
  const { premium } = useAppStore();

  // Bounce animation for crown
  const crownScale = useSharedValue(0);

  useEffect(() => {
    // Animate crown bouncing in
    crownScale.value = withSpring(1, {
      damping: 8,
      stiffness: 150,
    });

    // Trigger success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const crownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }],
  }));

  const handleContinue = () => {
    router.replace("/");
  };

  const premiumFeatures = [
    "Unlimited flocks",
    "CSV export for records",
    "Priority support",
    "No ads (future)",
  ];

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`flex-1 justify-center p-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Crown with bounce animation */}
        <Animated.View style={[tw`items-center mb-6`, crownAnimatedStyle]}>
          <View
            style={[
              tw`w-28 h-28 rounded-full items-center justify-center`,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Ionicons name="diamond" size={56} color={colors.accent} />
          </View>
        </Animated.View>

        {/* Title */}
        <Text
          style={[
            tw`text-3xl font-bold text-center mb-4`,
            { color: colors.text },
          ]}
        >
          You&apos;re Premium!
        </Text>

        {/* Subtitle */}
        <Text
          style={[tw`text-center mb-8 px-4`, { color: colors.textSecondary }]}
        >
          Welcome to Broodeed Premium. You now have unlimited flocks and CSV
          export.
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
      </ScrollView>

      {/* Continue Button */}
      <View style={tw`p-6 pb-10`}>
        <TouchableOpacity
          style={[
            tw`p-4 rounded-xl items-center justify-center`,
            { backgroundColor: colors.accent },
          ]}
          onPress={handleContinue}
        >
          <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
            Continue to Farm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
