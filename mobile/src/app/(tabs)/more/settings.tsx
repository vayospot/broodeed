import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();

  const { settings, updateSettings, clearAllData } = useAppStore();

  const handleFarmNameChange = () => {
    Alert.prompt(
      "Farm Name",
      "Enter your farm name",
      (name) => {
        if (name !== undefined) {
          updateSettings({ farmName: name });
        }
      },
      "plain-text",
      settings.farmName,
    );
  };

  const handleCurrencyChange = () => {
    Alert.alert("Currency", "Select your currency", [
      {
        text: "$ Dollar (USD)",
        onPress: () =>
          updateSettings({ currency: "$ Dollar", currencySymbol: "$" }),
      },
      {
        text: "₦ Naira (NGN)",
        onPress: () =>
          updateSettings({ currency: "₦ Naira", currencySymbol: "₦" }),
      },
      {
        text: "KSh Shilling (KES)",
        onPress: () =>
          updateSettings({ currency: "KSh Shilling", currencySymbol: "KSh" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleWeightUnitChange = () => {
    Alert.alert("Weight Unit", "Select your preferred unit", [
      {
        text: "Kilograms (kg)",
        onPress: () => updateSettings({ weightUnit: "kg" }),
      },
      {
        text: "Pounds (lb)",
        onPress: () => updateSettings({ weightUnit: "lb" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your flocks, logs, expenses, and sales. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => {
            clearAllData();
            Alert.alert("Data Cleared", "All data has been removed.");
          },
        },
      ],
    );
  };

  const handleHapticToggle = (value: boolean) => {
    updateSettings({ hapticEnabled: value });
  };

  const handleReminderToggle = (value: boolean) => {
    updateSettings({ dailyLogReminder: value });
  };

  return (
    <ScrollView
      style={[tw`flex-1`, { backgroundColor: colors.background }]}
      contentContainerStyle={tw`p-4 pb-8`}
    >
      {/* Header */}
      <View style={tw`flex-row items-center mb-6`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2 -ml-2`}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-2xl font-bold ml-2`, { color: colors.text }]}>
          Settings
        </Text>
      </View>

      {/* FARM PROFILE Section */}
      <Text
        style={[
          tw`text-sm font-semibold mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        FARM PROFILE
      </Text>

      <View
        style={[
          tw`rounded-xl overflow-hidden`,
          { backgroundColor: colors.surface },
        ]}
      >
        {/* Farm Name */}
        <TouchableOpacity
          style={tw`flex-row items-center p-4`}
          onPress={handleFarmNameChange}
        >
          <View style={tw`flex-1`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Farm Name
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {settings.farmName || "Not set"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Currency */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center p-4`,
            { borderTopWidth: 1, borderTopColor: colors.divider },
          ]}
          onPress={handleCurrencyChange}
        >
          <View style={tw`flex-1`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Currency
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {settings.currency || "$ Dollar"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Weight Unit */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center p-4`,
            { borderTopWidth: 1, borderTopColor: colors.divider },
          ]}
          onPress={handleWeightUnitChange}
        >
          <View style={tw`flex-1`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Weight Unit
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {settings.weightUnit === "kg" ? "Kilograms (kg)" : "Pounds (lbs)"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* PREFERENCES Section */}
      <Text
        style={[
          tw`text-sm font-semibold mt-6 mb-3`,
          { color: colors.textSecondary },
        ]}
      >
        PREFERENCES
      </Text>

      <View
        style={[
          tw`rounded-xl overflow-hidden`,
          { backgroundColor: colors.surface },
        ]}
      >
        {/* Haptic Feedback */}
        <View style={[tw`flex-row items-center justify-between p-4`]}>
          <View style={tw`flex-1`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Haptic Feedback
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Vibration on interactions
            </Text>
          </View>
          <Switch
            value={settings.hapticEnabled ?? true}
            onValueChange={handleHapticToggle}
            trackColor={{ false: colors.divider, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        {/* Daily Log Reminder */}
        <View
          style={[
            tw`flex-row items-center justify-between p-4`,
            { borderTopWidth: 1, borderTopColor: colors.divider },
          ]}
        >
          <View style={tw`flex-1`}>
            <Text style={[tw`font-medium`, { color: colors.text }]}>
              Daily Log Reminder
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Get reminded to log daily
            </Text>
          </View>
          <Switch
            value={settings.dailyLogReminder ?? false}
            onValueChange={handleReminderToggle}
            trackColor={{ false: colors.divider, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      {/* DANGER ZONE Section */}
      <Text
        style={[tw`text-sm font-semibold mt-6 mb-3`, { color: colors.danger }]}
      >
        DANGER ZONE
      </Text>

      <View
        style={[
          tw`rounded-xl overflow-hidden`,
          { backgroundColor: colors.surface },
        ]}
      >
        {/* Clear All Data */}
        <TouchableOpacity
          style={tw`flex-row items-center p-4`}
          onPress={handleClearData}
        >
          <View
            style={[
              tw`w-10 h-10 rounded-full items-center justify-center`,
              { backgroundColor: colors.danger + "20" },
            ]}
          >
            <Ionicons name="trash" size={20} color={colors.danger} />
          </View>
          <View style={tw`flex-1 ml-3`}>
            <Text style={[tw`font-medium`, { color: colors.danger }]}>
              Clear All Data
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Delete all flocks, logs, expenses, sales
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={tw`mt-8 items-center`}>
        <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
          Broodeed v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
