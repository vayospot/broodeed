import Colors from "@/constants/Colors";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import tw from "twrnc";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();

  const {
    initialize,
    getActiveFlocks,
    settings,
    premium,
    getDailyLog,
    getFlocksCount,
  } = useAppStore();

  const activeFlocks = getActiveFlocks();
  const flocksCount = getFlocksCount();

  useEffect(() => {
    initialize();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  // Check if any flock has been logged today
  const hasLoggedToday = activeFlocks.some((flock) => {
    const log = getDailyLog(flock.id, today);
    return !!log;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <ScrollView
      style={[tw`flex-1`, { backgroundColor: colors.background }]}
      contentContainerStyle={tw`p-4`}
    >
      {/* Header */}
      <View style={tw`mb-6`}>
        <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>
          {getGreeting()} 👋
        </Text>
        <Text style={[tw`text-base mt-1`, { color: colors.textSecondary }]}>
          {settings.farmName || "Your Farm"}
        </Text>
      </View>

      {/* Status Card */}
      <View
        style={[tw`rounded-2xl p-4 mb-6`, { backgroundColor: colors.surface }]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Today&apos;s Status
            </Text>
            <Text style={[tw`text-xl font-bold mt-1`, { color: colors.text }]}>
              {hasLoggedToday ? "All logged ✓" : "Pending ⏰"}
            </Text>
          </View>
          <View
            style={[
              tw`w-12 h-12 rounded-full items-center justify-center`,
              {
                backgroundColor: hasLoggedToday
                  ? colors.primary
                  : colors.accent,
              },
            ]}
          >
            <Ionicons
              name={hasLoggedToday ? "checkmark" : "time"}
              size={24}
              color={colors.text}
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={[tw`text-lg font-semibold mb-3`, { color: colors.text }]}>
        Quick Actions
      </Text>

      <TouchableOpacity
        style={[
          tw`flex-row items-center p-4 rounded-xl mb-3`,
          { backgroundColor: colors.accent },
        ]}
        onPress={() => router.push("/log")}
      >
        <View
          style={tw`w-12 h-12 rounded-full bg-white/20 items-center justify-center`}
        >
          <Ionicons name="add-circle" size={28} color={colors.text} />
        </View>
        <View style={tw`ml-3 flex-1`}>
          <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
            Log Today
          </Text>
          <Text style={[tw`text-sm`, { color: colors.text }]}>
            Record mortality, feed, eggs
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          style={[
            tw`flex-1 p-4 rounded-xl`,
            { backgroundColor: colors.surface },
          ]}
          onPress={() => router.push("/finance")}
        >
          <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          <Text style={[tw`text-sm font-medium mt-2`, { color: colors.text }]}>
            Add Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tw`flex-1 p-4 rounded-xl`,
            { backgroundColor: colors.surface },
          ]}
          onPress={() => router.push("/finance")}
        >
          <Ionicons name="cash-outline" size={24} color={colors.primary} />
          <Text style={[tw`text-sm font-medium mt-2`, { color: colors.text }]}>
            Record Sale
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Flocks */}
      <Text
        style={[tw`text-lg font-semibold mt-6 mb-3`, { color: colors.text }]}
      >
        Active Flocks ({flocksCount}/5)
      </Text>

      {activeFlocks.length === 0 ? (
        <View
          style={[
            tw`p-6 rounded-xl items-center`,
            { backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="egg-outline" size={48} color={colors.textSecondary} />
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
          style={tw`margin-0 -ml-4 pl-4`}
        >
          {activeFlocks.map((flock) => {
            const log = getDailyLog(flock.id, today);
            const daysOld = Math.floor(
              (Date.now() - new Date(flock.startDate).getTime()) /
                (1000 * 60 * 60 * 24),
            );

            return (
              <TouchableOpacity
                key={flock.id}
                style={[
                  tw`w-40 p-4 rounded-xl mr-3`,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => router.push(`/flock/${flock.id}`)}
              >
                <View style={tw`flex-row justify-between items-start`}>
                  <Ionicons
                    name={flock.type === "layer" ? "egg" : "restaurant"}
                    size={24}
                    color={colors.primary}
                  />
                  <View
                    style={[
                      tw`px-2 py-1 rounded-full`,
                      {
                        backgroundColor: log
                          ? colors.primary + "30"
                          : colors.accent + "30",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-xs`,
                        { color: log ? colors.primary : colors.accent },
                      ]}
                    >
                      {log ? "✓" : "⏰"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[tw`text-base font-bold mt-3`, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {flock.name}
                </Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                  Day {daysOld} • {flock.type}
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
              <Text style={[tw`text-sm mt-2`, { color: colors.textSecondary }]}>
                Add Flock
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Premium Banner (if not premium) */}
      {!premium.isPremium && (
        <View
          style={[
            tw`mt-6 p-4 rounded-xl`,
            { backgroundColor: colors.surfaceElevated },
          ]}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`flex-1`}>
              <Text style={[tw`font-bold`, { color: colors.text }]}>
                Upgrade to Premium
              </Text>
              <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
                Unlimited flocks & CSV export
              </Text>
            </View>
            <TouchableOpacity
              style={[
                tw`px-4 py-2 rounded-full`,
                { backgroundColor: colors.accent },
              ]}
              onPress={() => router.push("/more")}
            >
              <Text style={[tw`font-semibold text-sm`, { color: colors.text }]}>
                $4.99
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
