import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();

  // Pulsing animation for status dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulsing animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const { initialize, getActiveFlocks, settings, getDailyLog, getFlocksCount } =
    useAppStore();

  const activeFlocks = getActiveFlocks();
  const flocksCount = getFlocksCount();

  useEffect(() => {
    initialize();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  // Calculate status based on spec logic
  const getFarmStatus = () => {
    if (activeFlocks.length === 0)
      return {
        status: "none",
        color: colors.textSecondary,
        label: "No flocks",
      };

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let hasUnloggedFlock = false;
    let hasMortalitySpike = false;
    let missedDaysCount = 0;

    for (const flock of activeFlocks) {
      const todayLog = getDailyLog(flock.id, todayStr);
      const yesterdayLog = getDailyLog(flock.id, yesterdayStr);

      // Check if not logged today
      if (!todayLog) {
        hasUnloggedFlock = true;
      }

      // Check mortality spike (>3%)
      if (todayLog && todayLog.deaths > 0) {
        const mortalityRate = todayLog.deaths / (todayLog.birdCount || 1);
        if (mortalityRate > 0.03) {
          hasMortalitySpike = true;
        }
      }

      // Check consecutive missed days
      if (!todayLog && !yesterdayLog) {
        missedDaysCount++;
      }
    }

    if (hasMortalitySpike || missedDaysCount >= 2) {
      return { status: "red", color: colors.danger, label: "ACTION NEEDED" };
    }
    if (hasUnloggedFlock) {
      return { status: "amber", color: colors.accent, label: "PENDING" };
    }
    return { status: "green", color: colors.primary, label: "ALL GOOD" };
  };

  const farmStatus = getFarmStatus();

  // Calculate today's summary across all flocks
  const getTodaySummary = () => {
    let totalDeaths = 0;
    let totalFeed = 0;
    let totalEggs = 0;

    for (const flock of activeFlocks) {
      const log = getDailyLog(flock.id, today);
      if (log) {
        totalDeaths += log.deaths || 0;
        totalFeed += log.feedConsumedKg || 0;
        totalEggs += log.eggsCollected || 0;
      }
    }

    return { deaths: totalDeaths, feed: totalFeed, eggs: totalEggs };
  };

  const todaySummary = getTodaySummary();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={tw`flex-1 pt-5`}>
      <ScrollView
        style={[tw`flex-1`, { backgroundColor: colors.background }]}
        contentContainerStyle={tw`p-4 pb-24`}
      >
        {/* Header */}
        <View style={tw`mb-4`}>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>
            {getGreeting()}
          </Text>
          <Text
            style={[
              tw`text-base mt-1 font-bold`,
              { color: colors.textSecondary },
            ]}
          >
            {settings.farmName || "Your Farm"}
          </Text>
        </View>

        {/* Farm Status Bar */}
        <View
          style={[
            tw`rounded-2xl p-4 mb-6 flex-row items-center`,
            { backgroundColor: colors.surface },
          ]}
        >
          <Animated.View
            style={[
              tw`w-3 h-3 rounded-full mr-3`,
              {
                backgroundColor: farmStatus.color,
                opacity: farmStatus.status === "none" ? 0 : pulseAnim,
              },
            ]}
          />
          <View style={tw`flex-1`}>
            <Text
              style={[tw`text-xs uppercase`, { color: colors.textSecondary }]}
            >
              Farm Status
            </Text>
            <Text style={[tw`text-lg font-bold`, { color: farmStatus.color }]}>
              {farmStatus.label}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[tw`text-lg font-semibold mb-3`, { color: colors.text }]}>
          Quick Actions
        </Text>

        <TouchableOpacity
          style={[
            tw`flex-row items-center p-4 rounded-xl mb-3 border`,
            {
              backgroundColor: "transparent",
              borderColor: colors.accent,
            },
          ]}
          onPress={() => router.push("/log")}
        >
          <View
            style={[
              tw`w-12 h-12 rounded-full items-center justify-center`,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Ionicons name="add-circle" size={28} color={colors.accent} />
          </View>
          <View style={tw`ml-3 flex-1`}>
            <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
              Log Today
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Record mortality, feed, eggs
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={tw`flex-row gap-3`}>
          <TouchableOpacity
            style={[
              tw`flex-1 p-4 rounded-xl border`,
              {
                backgroundColor: "transparent",
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/finance")}
          >
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            <Text
              style={[tw`text-sm font-medium mt-2`, { color: colors.text }]}
            >
              Add Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              tw`flex-1 p-4 rounded-xl border`,
              {
                backgroundColor: "transparent",
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/finance")}
          >
            <Ionicons name="cash-outline" size={24} color={colors.primary} />
            <Text
              style={[tw`text-sm font-medium mt-2`, { color: colors.text }]}
            >
              Record Sale
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Summary */}
        <Text
          style={[tw`text-lg font-semibold mt-6 mb-3`, { color: colors.text }]}
        >
          Today
        </Text>
        <View
          style={[
            tw`rounded-2xl p-4 mb-6`,
            { backgroundColor: colors.surface },
          ]}
        >
          <View style={tw`flex-row justify-around`}>
            <View style={tw`items-center`}>
              <Ionicons
                name="skull"
                size={20}
                color={
                  todaySummary.deaths > 0 ? colors.danger : colors.textSecondary
                }
              />
              <Text
                style={[
                  tw`text-xl font-bold mt-1`,
                  {
                    color:
                      todaySummary.deaths > 0 ? colors.danger : colors.text,
                  },
                ]}
              >
                {todaySummary.deaths > 0 ? todaySummary.deaths : "—"}
              </Text>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                Deaths
              </Text>
            </View>
            <View style={tw`items-center`}>
              <Ionicons name="leaf" size={20} color={colors.primary} />
              <Text
                style={[tw`text-xl font-bold mt-1`, { color: colors.text }]}
              >
                {todaySummary.feed > 0 ? `${todaySummary.feed}kg` : "—"}
              </Text>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                Feed
              </Text>
            </View>
            <View style={tw`items-center`}>
              <Ionicons name="egg" size={20} color={colors.accent} />
              <Text
                style={[tw`text-xl font-bold mt-1`, { color: colors.text }]}
              >
                {todaySummary.eggs > 0 ? todaySummary.eggs : "—"}
              </Text>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                Eggs
              </Text>
            </View>
          </View>
        </View>

        {/* Active Flocks */}
        <Text style={[tw`text-lg font-semibold mb-3`, { color: colors.text }]}>
          Active Flocks
        </Text>

        {activeFlocks.length === 0 ? (
          <View
            style={[
              tw`p-6 rounded-xl items-center`,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="egg-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[
                tw`text-base mt-3 text-center`,
                { color: colors.textSecondary },
              ]}
            >
              No flocks yet.{"\n"}Add your first flock to get started!
            </Text>
            <TouchableOpacity
              style={[
                tw`mt-4 px-6 py-3 rounded-full`,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => router.push("/flocks")}
            >
              <Text style={[tw`font-semibold`, { color: colors.text }]}>
                Add Flock
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tw`margin-0 -ml-4 pl-4 mb-6`}
          >
            {activeFlocks.map((flock) => {
              const log = getDailyLog(flock.id, today);
              const daysOld = Math.floor(
                (Date.now() - new Date(flock.startDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              const currentCount = log?.birdCount || flock.initialCount;

              return (
                <TouchableOpacity
                  key={flock.id}
                  style={[
                    tw`w-40 p-4 rounded-xl mr-3`,
                    { backgroundColor: colors.surface },
                  ]}
                  onPress={() => {
                    if (log) {
                      router.push(`/flock/${flock.id}`);
                    } else {
                      router.push(`/log`);
                    }
                  }}
                >
                  <View style={tw`flex-row justify-between items-start`}>
                    <Ionicons
                      name={flock.type === "layer" ? "egg" : "restaurant"}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      tw`text-base font-bold mt-3`,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {flock.name}
                  </Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                    {currentCount} birds • Day {daysOld}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Add Flock Card */}
            {flocksCount < 5 && (
              <TouchableOpacity
                style={[
                  tw`w-40 p-4 rounded-xl border-2 border-dashed items-center justify-center`,
                  {
                    borderColor: colors.divider,
                  },
                ]}
                onPress={() => router.push("/flocks")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text
                  style={[tw`text-sm mt-2`, { color: colors.textSecondary }]}
                >
                  Add Flock
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </ScrollView>

      {/* FAB - Log Today */}
      <TouchableOpacity
        style={[
          tw`absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center`,
          { backgroundColor: colors.accent },
        ]}
        onPress={() => router.push("/log")}
      >
        <Ionicons name="add" size={32} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}
