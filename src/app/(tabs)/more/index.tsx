import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();

  const { settings, premium } = useAppStore();

  const handleExportData = () => {
    if (!premium.isPremium) {
      Alert.alert(
        "Premium Required",
        "CSV export is available for Premium users only.",
        [{ text: "OK" }],
      );
      return;
    }
    Alert.alert("Export", "CSV export feature coming soon!");
  };

  const handleGoPremium = () => {
    router.push("/more/premium");
  };

  const handleAnalytics = () => {
    Alert.alert("Analytics", "Analytics dashboard coming soon!");
  };

  const handleHelpFAQ = () => {
    Alert.alert("Help & FAQ", "Help documentation coming soon!");
  };

  const handleContactUs = () => {
    const email = "support@broodeed.app";
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert("Error", "Could not open email app");
    });
  };

  const handleRateApp = () => {
    // In production, this would open the app store
    Alert.alert("Rate Broodeed", "Thank you for your support!");
  };

  const premiumFeatures = [
    "Unlimited flocks",
    "CSV export for records",
    "Priority support",
    "No ads (future)",
  ];

  return (
    <ScrollView
      style={[tw`flex-1`, { backgroundColor: colors.background }]}
      contentContainerStyle={tw`p-4`}
    >
      {/* Header */}
      <Text style={[tw`text-2xl font-bold mb-6`, { color: colors.text }]}>
        More
      </Text>

      {/* Farm Identity Card */}
      <View
        style={[tw`rounded-xl p-4 mb-6`, { backgroundColor: colors.surface }]}
      >
        <View style={tw`flex-row items-center`}>
          <View
            style={[
              tw`w-14 h-14 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "30" },
            ]}
          >
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={tw`flex-1 ml-4`}>
            <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
              {settings.farmName || "My Farm"}
            </Text>
          </View>
        </View>
      </View>

      {/* Premium Section */}
      <Text
        style={[
          tw`text-sm font-semibold mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        PREMIUM
      </Text>

      {premium.isPremium ? (
        <View
          style={[tw`rounded-xl p-4 mb-6`, { backgroundColor: colors.surface }]}
        >
          <View style={tw`flex-row items-center`}>
            <View
              style={[
                tw`w-12 h-12 rounded-full items-center justify-center`,
                { backgroundColor: colors.accent + "30" },
              ]}
            >
              <Ionicons name="star" size={24} color={colors.accent} />
            </View>
            <View style={tw`flex-1 ml-3`}>
              <Text style={[tw`font-bold`, { color: colors.text }]}>
                You&apos;re Premium!
              </Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                {premium.premiumType === "one_time"
                  ? "Lifetime access"
                  : "Monthly subscription"}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[tw`rounded-xl p-4 mb-6`, { backgroundColor: colors.surface }]}
          onPress={handleGoPremium}
        >
          <View style={tw`flex-row items-center mb-3`}>
            <Ionicons name="diamond" size={24} color={colors.accent} />
            <Text style={[tw`font-bold ml-2 flex-1`, { color: colors.text }]}>
              Go Premium
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
          {premiumFeatures.map((feature) => (
            <View key={feature} style={tw`flex-row items-center mb-2`}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.primary}
              />
              <Text style={[tw`ml-2`, { color: colors.textSecondary }]}>
                {feature}
              </Text>
            </View>
          ))}
        </TouchableOpacity>
      )}

      {/* APP Section */}
      <Text
        style={[
          tw`text-sm font-semibold mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        APP
      </Text>

      <View
        style={[
          tw`rounded-xl overflow-hidden mb-6`,
          { backgroundColor: colors.surface },
        ]}
      >
        {/* Settings */}
        <TouchableOpacity
          style={tw`flex-row items-center p-4`}
          onPress={() => router.push("/more/settings")}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="settings" size={20} color={colors.primary} />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Settings
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Export Data */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center p-4`,
            { borderTopWidth: 1, borderTopColor: colors.divider },
          ]}
          onPress={handleExportData}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons
              name={premium.isPremium ? "download" : "lock-closed"}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Export Data
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {premium.isPremium ? "Download your data" : "Premium only"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Analytics */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center p-4`,
            { borderTopWidth: 1, borderTopColor: colors.divider },
          ]}
          onPress={handleAnalytics}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="stats-chart" size={20} color={colors.primary} />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Analytics
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* SUPPORT Section */}
      <Text
        style={[
          tw`text-sm font-semibold mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        SUPPORT
      </Text>

      <View
        style={[
          tw`rounded-xl overflow-hidden mb-6`,
          { backgroundColor: colors.surface },
        ]}
      >
        {/* Help & FAQ */}
        <TouchableOpacity
          style={tw`flex-row items-center p-4`}
          onPress={handleHelpFAQ}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="help-circle" size={20} color={colors.primary} />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Help & FAQ
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Contact Us */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center p-4`,
            { borderTopWidth: 1, borderTopColor: colors.divider },
          ]}
          onPress={handleContactUs}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="mail" size={20} color={colors.primary} />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Contact Us
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Rate the App */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center p-4`,
            { borderTopWidth: 1, borderTopColor: colors.divider },
          ]}
          onPress={handleRateApp}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="star" size={20} color={colors.primary} />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Rate the App
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={tw`mt-4 items-center pb-8`}>
        <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
          Broodeed v1.0.0
        </Text>
        <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>
          Made with ❤️ for poultry farmers
        </Text>
      </View>
    </ScrollView>
  );
}
