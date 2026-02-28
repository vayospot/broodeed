import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FlockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { getFlock, getFlockLogs, getFlockExpenses, getFlockSales } =
    useAppStore();
  const flock = getFlock(id);
  const logs = getFlockLogs(id);
  const expenses = getFlockExpenses(id);
  const sales = getFlockSales(id);

  // Set header title dynamically
  useEffect(() => {
    if (flock) {
      navigation.setOptions({
        headerTitle: flock.name,
      });
    }
  }, [flock, navigation]);

  if (!flock) {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center`,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[tw`text-lg`, { color: colors.textSecondary }]}>
          Flock not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={tw`mt-4`}>
          <Text style={[tw`text-primary`, { color: colors.primary }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysOld = Math.floor(
    (Date.now() - new Date(flock.startDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  const totalDeaths = logs.reduce((sum, log) => sum + log.deaths, 0);
  const totalFeed = logs.reduce(
    (sum, log) => sum + (log.feedConsumedKg || 0),
    0,
  );
  const totalEggs = logs.reduce(
    (sum, log) => sum + (log.eggsCollected || 0),
    0,
  );

  // Calculate FCR (Feed Conversion Ratio) = feed used / weight gained
  // Simplified: assumes average weight gain of 2.5kg per bird
  const currentBirdCount = logs[0]?.birdCount || flock.initialCount;
  const totalWeight = (flock.initialCount - currentBirdCount) * 2.5;
  const fcr = totalWeight > 0 ? (totalFeed / totalWeight).toFixed(2) : "0.00";

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = sales.reduce(
    (sum, s) => sum + s.quantity * s.unitPrice,
    0,
  );
  const profit = totalRevenue - totalExpenses;

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[tw`p-4`, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Subtitle shown below header */}
        <View style={tw`mb-6`}>
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            {flock.type} • Day {daysOld}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={tw`flex-row gap-3 mb-6`}>
          <View
            style={[
              tw`flex-1 p-4 rounded-xl`,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={[tw`text-2xl font-bold mt-2`, { color: colors.text }]}>
              {currentBirdCount}
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Birds
            </Text>
          </View>
          <View
            style={[
              tw`flex-1 p-4 rounded-xl`,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons name="warning" size={24} color={colors.danger} />
            <Text
              style={[tw`text-2xl font-bold mt-2`, { color: colors.danger }]}
            >
              {totalDeaths}
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Deaths
            </Text>
          </View>
        </View>

        {/* FCR Card */}
        <View
          style={[tw`p-4 rounded-xl mb-6`, { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              tw`text-sm font-medium mb-2`,
              { color: colors.textSecondary },
            ]}
          >
            Feed Conversion Ratio (FCR)
          </Text>
          <Text style={[tw`text-3xl font-bold`, { color: colors.primary }]}>
            {fcr}
          </Text>
          <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
            Lower is better (target: 1.5-2.0)
          </Text>
        </View>

        {/* Production Stats */}
        {flock.type === "layer" && (
          <View
            style={[
              tw`p-4 rounded-xl mb-6`,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[
                tw`text-sm font-medium mb-3`,
                { color: colors.textSecondary },
              ]}
            >
              Egg Production
            </Text>
            <Text style={[tw`text-2xl font-bold`, { color: colors.accent }]}>
              {totalEggs} eggs
            </Text>
          </View>
        )}

        {/* P&L */}
        <View
          style={[tw`p-4 rounded-xl mb-6`, { backgroundColor: colors.surface }]}
        >
          <Text
            style={[
              tw`text-sm font-medium mb-3`,
              { color: colors.textSecondary },
            ]}
          >
            Profit & Loss
          </Text>
          <View style={tw`flex-row justify-between mb-2`}>
            <Text style={{ color: colors.textSecondary }}>Revenue</Text>
            <Text style={[tw`font-medium`, { color: colors.primary }]}>
              ${totalRevenue.toFixed(2)}
            </Text>
          </View>
          <View style={tw`flex-row justify-between mb-2`}>
            <Text style={{ color: colors.textSecondary }}>Expenses</Text>
            <Text style={[tw`font-medium`, { color: colors.danger }]}>
              -${totalExpenses.toFixed(2)}
            </Text>
          </View>
          <View style={[tw`h-px my-2`, { backgroundColor: colors.divider }]} />
          <View style={tw`flex-row justify-between`}>
            <Text style={[tw`font-bold`, { color: colors.text }]}>Net</Text>
            <Text
              style={[
                tw`font-bold`,
                { color: profit >= 0 ? colors.primary : colors.danger },
              ]}
            >
              ${profit.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Recent Logs */}
        <Text style={[tw`text-lg font-semibold mb-3`, { color: colors.text }]}>
          Recent Logs
        </Text>
        {logs.length === 0 ? (
          <View
            style={[tw`p-6 rounded-xl`, { backgroundColor: colors.surface }]}
          >
            <Text style={[tw`text-center`, { color: colors.textSecondary }]}>
              No logs yet
            </Text>
          </View>
        ) : (
          logs.slice(0, 7).map((log) => (
            <View
              key={log.id}
              style={[
                tw`p-3 rounded-xl mb-2`,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={tw`flex-row justify-between`}>
                <Text style={{ color: colors.text }}>{log.logDate}</Text>
                <Text style={{ color: colors.textSecondary }}>
                  {log.deaths} deaths
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Log Today Button */}
        <TouchableOpacity
          style={[
            tw`mt-4 p-4 rounded-xl items-center`,
            { backgroundColor: colors.accent },
          ]}
          onPress={() => router.push("/log")}
        >
          <Text style={[tw`font-bold`, { color: colors.text }]}>Log Today</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
