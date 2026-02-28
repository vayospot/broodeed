import Progress from "@/components/Progress";
import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LogScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();

  const {
    getActiveFlocks,
    addDailyLog,
    getDailyLog,
    updateDailyLog,
    getFlockLogs,
  } = useAppStore();
  const activeFlocks = getActiveFlocks();

  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [notes, setNotes] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const today = new Date().toISOString().split("T")[0];

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const [formData, setFormData] = useState<{
    deaths: number;
    feedConsumedKg: string;
    eggsCollected: number;
    eggsDamaged: number;
    birdCount: number;
  }>({
    deaths: 0,
    feedConsumedKg: "",
    eggsCollected: 0,
    eggsDamaged: 0,
    birdCount: 0,
  });

  const selectedFlock = activeFlocks.find((f) => f.id === selectedFlockId);
  const existingLog = selectedFlockId
    ? getDailyLog(selectedFlockId, today)
    : null;

  // Get yesterday's log for pre-fill and context
  const yesterdayLog = selectedFlockId
    ? getDailyLog(selectedFlockId, yesterdayStr)
    : null;

  // Calculate days old for the flock
  const daysOld = useMemo(() => {
    if (!selectedFlock) return 0;
    return Math.floor(
      (Date.now() - new Date(selectedFlock.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }, [selectedFlock]);

  // Calculate total deaths this cycle
  const totalCycleDeaths = useMemo(() => {
    if (!selectedFlockId) return 0;
    const logs = getFlockLogs(selectedFlockId);
    return logs.reduce((sum, log) => sum + (log.deaths || 0), 0);
  }, [selectedFlockId, getFlockLogs]);

  // Calculate pre-filled bird count: yesterday's count - today's deaths
  const preFilledBirdCount = existingLog
    ? existingLog.birdCount
    : yesterdayLog
      ? yesterdayLog.birdCount
      : selectedFlock?.initialCount || 0;

  // Reactive bird count: updates when deaths change
  const reactiveBirdCount = useMemo(() => {
    if (existingLog) return formData.birdCount;
    return Math.max(0, preFilledBirdCount - formData.deaths);
  }, [formData.deaths, preFilledBirdCount, existingLog, formData.birdCount]);

  // Calculate pre-filled feed (average of last 7 days)
  const getAverageFeed = () => {
    if (!selectedFlockId) return 0;
    const logs = getFlockLogs(selectedFlockId).slice(0, 7);
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, log) => sum + (log.feedConsumedKg || 0), 0);
    return Math.round(total / logs.length);
  };

  const averageFeed = getAverageFeed();

  // Find best egg day
  const bestEggDay = useMemo(() => {
    if (!selectedFlockId || selectedFlock?.type !== "layer") return 0;
    const logs = getFlockLogs(selectedFlockId);
    return Math.max(...logs.map((l) => l.eggsCollected || 0));
  }, [selectedFlockId, selectedFlock?.type, getFlockLogs]);

  // Initialize form with existing log data or pre-filled values
  useEffect(() => {
    if (selectedFlockId) {
      if (existingLog) {
        // Editing existing log - pre-fill with existing values
        setFormData({
          deaths: existingLog.deaths,
          feedConsumedKg: existingLog.feedConsumedKg?.toString() || "",
          eggsCollected: existingLog.eggsCollected || 0,
          eggsDamaged: existingLog.eggsDamaged || 0,
          birdCount: existingLog.birdCount,
        });
        setNotes(existingLog.notes || "");
      } else {
        // New log - pre-fill with calculated values
        setFormData({
          deaths: 0,
          feedConsumedKg: "",
          eggsCollected: 0,
          eggsDamaged: 0,
          birdCount: preFilledBirdCount,
        });
        setNotes("");
      }
    }
  }, [selectedFlockId, existingLog, preFilledBirdCount]);

  // Steps: Mortality, Feed, Eggs (layer only), Bird Count, Confirm
  const steps = [
    {
      title: "Deaths Today",
      subtitle: "How many birds died?",
      icon: "warning",
    },
    { title: "Feed", subtitle: "How much feed was used?", icon: "leaf" },
    ...(selectedFlock?.type === "layer"
      ? [{ title: "Eggs", subtitle: "Eggs collected today", icon: "egg" }]
      : []),
    { title: "Live Birds", subtitle: "Total birds alive now", icon: "people" },
    { title: "Confirm", subtitle: "Review your log", icon: "checkmark-circle" },
  ];

  const handleNext = () => {
    Haptics.selectionAsync();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollRef.current?.scrollTo({
        x: (currentStep + 1) * width,
        animated: true,
      });
    }
  };

  const handlePrev = () => {
    Haptics.selectionAsync();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({
        x: (currentStep - 1) * width,
        animated: true,
      });
    }
  };

  const handleSave = () => {
    if (!selectedFlockId) {
      Alert.alert("Error", "Please select a flock");
      return;
    }

    const data = {
      flockId: selectedFlockId,
      logDate: today,
      birdCount: formData.birdCount,
      deaths: formData.deaths,
      feedConsumedKg: parseFloat(formData.feedConsumedKg) || 0,
      eggsCollected:
        selectedFlock?.type === "layer" ? formData.eggsCollected : undefined,
      eggsDamaged:
        selectedFlock?.type === "layer" ? formData.eggsDamaged : undefined,
    };

    if (existingLog) {
      updateDailyLog(existingLog.id, data);
    } else {
      addDailyLog(data);
    }

    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert("Log Saved", `${selectedFlock?.name} has been logged.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  if (!selectedFlockId) {
    return (
      <View style={tw`flex-1`}>
        <ScrollView contentContainerStyle={tw`p-4`}>
          <Text style={[tw`text-sm mb-4`, { color: colors.textSecondary }]}>
            Which flock are you logging today?
          </Text>

          {activeFlocks.map((flock) => {
            const log = getDailyLog(flock.id, today);
            return (
              <TouchableOpacity
                key={flock.id}
                style={[
                  tw`p-4 rounded-xl mb-3`,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => setSelectedFlockId(flock.id)}
              >
                <View style={tw`flex-row items-center`}>
                  <View
                    style={[
                      tw`w-12 h-12 rounded-full items-center justify-center`,
                      { backgroundColor: colors.primary + "30" },
                    ]}
                  >
                    <Ionicons
                      name={flock.type === "layer" ? "egg" : "restaurant"}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={tw`flex-1 ml-3`}>
                    <Text
                      style={[
                        tw`text-lg font-semibold`,
                        { color: colors.text },
                      ]}
                    >
                      {flock.name}
                    </Text>
                    <Text
                      style={[tw`text-sm`, { color: colors.textSecondary }]}
                    >
                      {flock.type} • {flock.initialCount} birds
                    </Text>
                  </View>
                  {log && (
                    <View
                      style={[
                        tw`px-2 py-1 rounded-full`,
                        { backgroundColor: colors.primary + "30" },
                      ]}
                    >
                      <Text style={[tw`text-xs`, { color: colors.primary }]}>
                        Logged
                      </Text>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      {/* Custom header area with progress - below native header */}
      <View style={tw`p-4 border-b`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View style={tw`flex-1`}>
            <Text style={[tw`font-bold`, { color: colors.text }]}>
              {selectedFlock?.name} • {selectedFlock?.type}
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Day {daysOld} of cycle
            </Text>
          </View>
        </View>

        <Progress totalSteps={steps.length} currentStep={currentStep} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ width: width * steps.length }}
      >
        {/* Step 1: Deaths */}
        <View style={[tw`flex-1 items-center justify-center px-6`, { width }]}>
          <View
            style={[
              tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
              { backgroundColor: colors.danger + "30" },
            ]}
          >
            <Ionicons name="warning" size={40} color={colors.danger} />
          </View>
          <Text style={[tw`text-2xl font-bold mb-1`, { color: colors.text }]}>
            {steps[0].title}
          </Text>
          <Text style={[tw`text-center mb-6`, { color: colors.textSecondary }]}>
            {steps[0].subtitle}
          </Text>

          <View style={tw`flex-row items-center gap-4 mb-6`}>
            <TouchableOpacity
              style={[
                tw`w-16 h-16 rounded-xl items-center justify-center`,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setFormData({
                  ...formData,
                  deaths: Math.max(0, formData.deaths - 1),
                });
              }}
            >
              <Ionicons name="remove" size={24} color={colors.text} />
            </TouchableOpacity>
            <TextInput
              style={[
                tw`text-5xl font-bold w-24 text-center bg-transparent`,
                { color: colors.text },
              ]}
              value={formData.deaths.toString()}
              keyboardType="number-pad"
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setFormData({ ...formData, deaths: Math.max(0, num) });
              }}
              selectTextOnFocus
            />
            <TouchableOpacity
              style={[
                tw`w-16 h-16 rounded-xl items-center justify-center`,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setFormData({ ...formData, deaths: formData.deaths + 1 });
              }}
            >
              <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Context: Yesterday + Total */}
          <View
            style={[tw`p-3 rounded-xl`, { backgroundColor: colors.surface }]}
          >
            <Text
              style={[tw`text-sm text-center`, { color: colors.textSecondary }]}
            >
              Yesterday: {yesterdayLog?.deaths || 0} deaths
            </Text>
            <Text
              style={[tw`text-sm text-center`, { color: colors.textSecondary }]}
            >
              Total this cycle: {totalCycleDeaths + formData.deaths}
            </Text>
          </View>
        </View>

        {/* Step 2: Feed */}
        <View style={[tw`flex-1 items-center justify-center px-6`, { width }]}>
          <View
            style={[
              tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
              { backgroundColor: colors.primary + "30" },
            ]}
          >
            <Ionicons name="leaf" size={40} color={colors.primary} />
          </View>
          <Text style={[tw`text-2xl font-bold mb-1`, { color: colors.text }]}>
            {steps[1].title}
          </Text>
          <Text style={[tw`text-center mb-6`, { color: colors.textSecondary }]}>
            {steps[1].subtitle}
          </Text>

          <TextInput
            style={[
              tw`text-5xl font-bold text-center p-4 rounded-2xl w-48 mb-4`,
              { backgroundColor: colors.surface, color: colors.text },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={formData.feedConsumedKg}
            onChangeText={(text) =>
              setFormData({ ...formData, feedConsumedKg: text })
            }
          />
          <Text style={[tw`mb-4`, { color: colors.textSecondary }]}>kg</Text>

          {/* Context: Average */}
          {averageFeed > 0 && (
            <View
              style={[tw`p-3 rounded-xl`, { backgroundColor: colors.surface }]}
            >
              <Text
                style={[
                  tw`text-sm text-center`,
                  { color: colors.textSecondary },
                ]}
              >
                Avg last 7 days: {averageFeed} kg
              </Text>
            </View>
          )}
        </View>

        {/* Step 3: Eggs (layer only) */}
        {selectedFlock?.type === "layer" && (
          <View
            style={[tw`flex-1 items-center justify-center px-6`, { width }]}
          >
            <View
              style={[
                tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
                { backgroundColor: colors.accent + "30" },
              ]}
            >
              <Ionicons name="egg" size={40} color={colors.accent} />
            </View>
            <Text style={[tw`text-2xl font-bold mb-1`, { color: colors.text }]}>
              {steps[2].title}
            </Text>
            <Text
              style={[tw`text-center mb-6`, { color: colors.textSecondary }]}
            >
              {steps[2].subtitle}
            </Text>

            <View style={tw`flex-row items-center gap-4 mb-4`}>
              <TouchableOpacity
                style={[
                  tw`w-16 h-16 rounded-xl items-center justify-center`,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    eggsCollected: Math.max(0, formData.eggsCollected - 1),
                  })
                }
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>
              <TextInput
                style={[
                  tw`text-5xl font-bold w-24 text-center bg-transparent`,
                  { color: colors.text },
                ]}
                value={formData.eggsCollected.toString()}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setFormData({ ...formData, eggsCollected: Math.max(0, num) });
                }}
                selectTextOnFocus
              />
              <TouchableOpacity
                style={[
                  tw`w-16 h-16 rounded-xl items-center justify-center`,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    eggsCollected: formData.eggsCollected + 1,
                  })
                }
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Damaged eggs input */}
            <View
              style={[
                tw`p-3 rounded-xl w-full`,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[tw`text-sm mb-2`, { color: colors.textSecondary }]}>
                Damaged / cracked? (optional)
              </Text>
              <View style={tw`flex-row items-center justify-center gap-4`}>
                <TouchableOpacity
                  style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center`,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      eggsDamaged: Math.max(0, formData.eggsDamaged - 1),
                    })
                  }
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[
                    tw`text-xl font-bold w-16 text-center`,
                    { color: colors.text },
                  ]}
                >
                  {formData.eggsDamaged}
                </Text>
                <TouchableOpacity
                  style={[
                    tw`w-12 h-12 rounded-xl items-center justify-center`,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      eggsDamaged: formData.eggsDamaged + 1,
                    })
                  }
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Context: Yesterday + Best */}
            {(yesterdayLog?.eggsCollected || bestEggDay > 0) && (
              <View
                style={[
                  tw`p-3 rounded-xl mt-3`,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text
                  style={[
                    tw`text-sm text-center`,
                    { color: colors.textSecondary },
                  ]}
                >
                  Yesterday: {yesterdayLog?.eggsCollected || 0} eggs
                </Text>
                <Text
                  style={[
                    tw`text-sm text-center`,
                    { color: colors.textSecondary },
                  ]}
                >
                  Best day: {bestEggDay} eggs
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Live Birds */}
        <View style={[tw`flex-1 items-center justify-center px-6`, { width }]}>
          <View
            style={[
              tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
              { backgroundColor: colors.primary + "30" },
            ]}
          >
            <Ionicons name="people" size={40} color={colors.primary} />
          </View>
          <Text style={[tw`text-2xl font-bold mb-1`, { color: colors.text }]}>
            {steps[selectedFlock?.type === "layer" ? 3 : 2].title}
          </Text>
          <Text style={[tw`text-center mb-6`, { color: colors.textSecondary }]}>
            {steps[selectedFlock?.type === "layer" ? 3 : 2].subtitle}
          </Text>

          <View style={tw`flex-row items-center gap-4 mb-4`}>
            <TouchableOpacity
              style={[
                tw`w-16 h-16 rounded-xl items-center justify-center`,
                { backgroundColor: colors.surface },
              ]}
              onPress={() =>
                setFormData({
                  ...formData,
                  birdCount: Math.max(0, formData.birdCount - 10),
                })
              }
            >
              <Ionicons name="remove" size={24} color={colors.text} />
            </TouchableOpacity>
            <TextInput
              style={[
                tw`text-5xl font-bold w-32 text-center bg-transparent`,
                { color: colors.text },
              ]}
              value={formData.birdCount.toString()}
              keyboardType="number-pad"
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setFormData({ ...formData, birdCount: Math.max(0, num) });
              }}
              selectTextOnFocus
            />
            <TouchableOpacity
              style={[
                tw`w-16 h-16 rounded-xl items-center justify-center`,
                { backgroundColor: colors.surface },
              ]}
              onPress={() =>
                setFormData({ ...formData, birdCount: formData.birdCount + 10 })
              }
            >
              <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Context: Pre-filled info */}
          {!existingLog && (
            <View
              style={[tw`p-3 rounded-xl`, { backgroundColor: colors.surface }]}
            >
              <View style={tw`flex-row items-center justify-center gap-1 mb-1`}>
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text style={[tw`text-sm`, { color: colors.primary }]}>
                  Pre-filled from yesterday minus deaths
                </Text>
              </View>
              <Text
                style={[
                  tw`text-xs text-center`,
                  { color: colors.textSecondary },
                ]}
              >
                Only change if you sold or moved birds
              </Text>
            </View>
          )}
        </View>

        {/* Step 5: Confirm */}
        <View style={[tw`flex-1 px-6 py-4`, { width }]}>
          <View
            style={[
              tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
              { backgroundColor: colors.primary + "30" },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={40}
              color={colors.primary}
            />
          </View>
          <Text
            style={[
              tw`text-2xl font-bold mb-4 text-center`,
              { color: colors.text },
            ]}
          >
            Review your log
          </Text>

          {/* Summary Card */}
          <View
            style={[
              tw`rounded-xl p-4 mb-4`,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={{ color: colors.textSecondary }}>Deaths</Text>
              <Text style={[tw`font-bold`, { color: colors.danger }]}>
                {formData.deaths}
              </Text>
            </View>
            <View
              style={[tw`h-px mb-2`, { backgroundColor: colors.divider }]}
            />
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={{ color: colors.textSecondary }}>Feed</Text>
              <Text style={[tw`font-bold`, { color: colors.text }]}>
                {formData.feedConsumedKg || 0} kg
              </Text>
            </View>
            {selectedFlock?.type === "layer" && (
              <>
                <View
                  style={[tw`h-px mb-2`, { backgroundColor: colors.divider }]}
                />
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={{ color: colors.textSecondary }}>Eggs</Text>
                  <Text style={[tw`font-bold`, { color: colors.text }]}>
                    {formData.eggsCollected}
                  </Text>
                </View>
              </>
            )}
            <View
              style={[tw`h-px mb-2`, { backgroundColor: colors.divider }]}
            />
            <View style={tw`flex-row justify-between`}>
              <Text style={{ color: colors.textSecondary }}>Birds alive</Text>
              <Text style={[tw`font-bold`, { color: colors.text }]}>
                {reactiveBirdCount}
              </Text>
            </View>
          </View>

          {/* Notes input */}
          <View>
            <Text style={[tw`text-sm mb-2`, { color: colors.textSecondary }]}>
              Add a note? (optional)
            </Text>
            <TextInput
              style={[
                tw`p-3 rounded-xl`,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="Any observations..."
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[tw`p-4 border-t`, { borderColor: colors.divider }]}>
        <View style={tw`flex-row justify-between`}>
          {currentStep > 0 ? (
            <TouchableOpacity
              style={[
                tw`px-6 py-4 rounded-xl`,
                { backgroundColor: colors.surface },
              ]}
              onPress={handlePrev}
            >
              <Text style={[tw`font-medium`, { color: colors.text }]}>
                Back
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={[
                tw`px-8 py-4 rounded-xl`,
                { backgroundColor: colors.accent },
              ]}
              onPress={handleNext}
            >
              <Text style={[tw`font-bold`, { color: colors.text }]}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                tw`px-8 py-4 rounded-xl`,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
            >
              <Text style={[tw`font-bold`, { color: colors.text }]}>
                Save Log
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
