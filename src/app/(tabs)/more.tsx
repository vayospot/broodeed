import Colors from "@/constants/Colors";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import tw from "twrnc";

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const { settings, updateSettings, premium, setPremium } = useAppStore();

  const handleFarmNameChange = (name: string) => {
    updateSettings({ farmName: name });
  };

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

  const handlePurchasePremium = () => {
    Alert.alert("Premium", "CREEM payment integration coming soon!", [
      { text: "OK" },
    ]);
  };

  const menuItems = [
    {
      title: "Farm Name",
      subtitle: settings.farmName || "Not set",
      icon: "business",
      onPress: () => {
        Alert.prompt(
          "Farm Name",
          "Enter your farm name",
          (name) => handleFarmNameChange(name || ""),
          "plain-text",
          settings.farmName,
        );
      },
    },
    {
      title: "Currency",
      subtitle: settings.currency,
      icon: "cash",
      onPress: () => {
        Alert.alert("Currency", "Currency selection coming soon!");
      },
    },
    {
      title: "Weight Unit",
      subtitle: settings.weightUnit === "kg" ? "Kilograms" : "Pounds",
      icon: "scale",
      onPress: () => {
        Alert.alert("Weight Unit", "Weight unit selection coming soon!");
      },
    },
  ];

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

      {/* Settings Section */}
      <Text
        style={[
          tw`text-sm font-semibold mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        SETTINGS
      </Text>

      <View
        style={[
          tw`rounded-xl overflow-hidden`,
          { backgroundColor: colors.surface },
        ]}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[
              tw`flex-row items-center p-4`,
              index < menuItems.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              },
            ]}
            onPress={item.onPress}
          >
            <View
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center`,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={tw`flex-1 ml-3`}>
              <Text style={[tw`font-medium`, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Premium Section */}
      <Text
        style={[
          tw`text-sm font-semibold mt-6 mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        PREMIUM
      </Text>

      <View style={[tw`rounded-xl p-4`, { backgroundColor: colors.surface }]}>
        {premium.isPremium ? (
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
        ) : (
          <>
            <Text style={[tw`font-bold mb-2`, { color: colors.text }]}>
              Upgrade to Premium
            </Text>
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

            <View style={tw`flex-row gap-3 mt-4`}>
              <TouchableOpacity
                style={[
                  tw`flex-1 p-3 rounded-xl`,
                  { backgroundColor: colors.accent },
                ]}
                onPress={handlePurchasePremium}
              >
                <Text
                  style={[tw`text-center font-bold`, { color: colors.text }]}
                >
                  $9.99 One-time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  tw`flex-1 p-3 rounded-xl border`,
                  { borderColor: colors.primary },
                ]}
                onPress={handlePurchasePremium}
              >
                <Text
                  style={[tw`text-center font-bold`, { color: colors.primary }]}
                >
                  $1/mo
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Data Section */}
      <Text
        style={[
          tw`text-sm font-semibold mt-6 mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        DATA
      </Text>

      <View
        style={[
          tw`rounded-xl overflow-hidden`,
          { backgroundColor: colors.surface },
        ]}
      >
        <TouchableOpacity
          style={tw`flex-row items-center p-4`}
          onPress={handleExportData}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Export Data (CSV)
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
      </View>

      {/* App Info */}
      <View style={tw`mt-8 items-center`}>
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
