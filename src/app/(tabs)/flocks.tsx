import Text from "@/components/Text";
import TextInput from "@/components/TextInput";
import Colors from "@/constants/Colors";
import tw from "@/lib/tailwind";
import { useAppStore } from "@/stores/useAppStore";
import type { Flock, FlockType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function FlocksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();

  const {
    flocks,
    addFlock,
    updateFlock,
    deleteFlock,
    canAddFlock,
    premium,
    getFlockMortalityRate,
    getFlockFCR,
    getFlockCurrentCount,
    getTodayEggs,
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFlock, setEditingFlock] = useState<Flock | null>(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "broiler" as FlockType,
    breed: "",
    startDate: new Date().toISOString().split("T")[0],
    initialCount: "",
    costPerBird: "",
    expectedDuration: "45",
    notes: "",
  });

  const activeFlocks = flocks.filter((f) => f.status === "active");
  const completedFlocks = flocks.filter(
    (f) => f.status === "completed" || f.status === "archived",
  );

  const resetForm = () => {
    setFormData({
      name: "",
      type: "broiler",
      breed: "",
      startDate: new Date().toISOString().split("T")[0],
      initialCount: "",
      costPerBird: "",
      expectedDuration: "45",
      notes: "",
    });
    setEditingFlock(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (flock: Flock) => {
    setFormData({
      name: flock.name,
      type: flock.type,
      breed: flock.breed || "",
      startDate: flock.startDate,
      initialCount: flock.initialCount.toString(),
      costPerBird: flock.costPerBird.toString(),
      expectedDuration: (flock as any).expectedDuration?.toString() || "45",
      notes: flock.notes || "",
    });
    setEditingFlock(flock);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a flock name");
      return;
    }
    if (!formData.initialCount || parseInt(formData.initialCount) <= 0) {
      Alert.alert("Error", "Please enter a valid bird count");
      return;
    }
    if (!formData.costPerBird || parseFloat(formData.costPerBird) <= 0) {
      Alert.alert("Error", "Please enter a valid cost per bird");
      return;
    }

    if (!canAddFlock() && !editingFlock) {
      Alert.alert(
        "Premium Required",
        "You can only have 5 active flocks on the free plan. Upgrade to premium for unlimited flocks.",
        [{ text: "OK" }],
      );
      return;
    }

    const flockData = {
      name: formData.name.trim(),
      type: formData.type,
      breed: formData.breed.trim() || undefined,
      startDate: formData.startDate,
      initialCount: parseInt(formData.initialCount),
      costPerBird: parseFloat(formData.costPerBird),
      status: "active" as const,
      expectedDuration: parseInt(formData.expectedDuration) || 45,
      notes: formData.notes.trim() || undefined,
    };

    if (editingFlock) {
      updateFlock(editingFlock.id, flockData);
    } else {
      addFlock(flockData);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteFlock = (id: string, name: string) => {
    Alert.alert(
      "Delete Flock",
      `Are you sure you want to delete "${name}"? This will permanently delete all logs, expenses, and sales for this flock.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFlock(id),
        },
      ],
    );
  };

  const handleArchiveFlock = (id: string) => {
    updateFlock(id, { status: "completed" });
  };

  // Get FCR color
  const getFCRColor = (fcr: number | null) => {
    if (fcr === null) return colors.textSecondary;
    if (fcr < 1.8) return colors.primary; // Green - excellent
    if (fcr <= 2.2) return colors.amber; // Amber - good
    return colors.danger; // Red - poor
  };

  // Get FCR label
  const getFCRLabel = (fcr: number | null) => {
    if (fcr === null) return "";
    if (fcr < 1.8) return "Excellent";
    if (fcr <= 2.2) return "Good";
    return "Poor";
  };

  // Render flock card
  const renderFlockCard = (flock: Flock, isCompleted = false) => {
    const daysOld = Math.floor(
      (Date.now() - new Date(flock.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const expectedDuration = (flock as any).expectedDuration || 45;
    const progressPercent = Math.min(
      100,
      Math.round((daysOld / expectedDuration) * 100),
    );
    const mortalityRate = getFlockMortalityRate(flock.id);
    const fcr = getFlockFCR(flock.id);
    const currentCount = getFlockCurrentCount(flock.id);
    const todayEggs = getTodayEggs(flock.id);

    return (
      <TouchableOpacity
        key={flock.id}
        style={[tw`p-4 rounded-xl mb-3`, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/flock/${flock.id}`)}
        onLongPress={() => openEditModal(flock)}
      >
        {/* Header */}
        <View style={tw`flex-row items-center mb-3`}>
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
            <Text style={[tw`text-lg font-semibold`, { color: colors.text }]}>
              {flock.name}
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {flock.type} • Day {daysOld}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>

        {/* Bird count */}
        <Text style={[tw`text-2xl font-bold mb-2`, { color: colors.text }]}>
          {currentCount} birds
        </Text>

        {/* Metrics row */}
        <View style={tw`flex-row gap-4 mb-3`}>
          {flock.type === "broiler" && (
            <>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                  Mortality
                </Text>
                <Text
                  style={[
                    tw`font-semibold`,
                    {
                      color:
                        mortalityRate < 1
                          ? colors.primary
                          : mortalityRate < 3
                            ? colors.amber
                            : colors.danger,
                    },
                  ]}
                >
                  {mortalityRate.toFixed(1)}%
                </Text>
              </View>
              {fcr !== null && (
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                    FCR
                  </Text>
                  <View style={tw`flex-row items-center gap-1`}>
                    <Text
                      style={[tw`font-semibold`, { color: getFCRColor(fcr) }]}
                    >
                      {fcr.toFixed(2)}
                    </Text>
                    <Text style={[tw`text-xs`, { color: getFCRColor(fcr) }]}>
                      {getFCRLabel(fcr)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          {flock.type === "layer" && (
            <View>
              <Text style={[tw`text-xs`, { color: colors.textSecondary }]}>
                Eggs today
              </Text>
              <Text style={[tw`font-semibold`, { color: colors.text }]}>
                {todayEggs}
              </Text>
            </View>
          )}
        </View>

        {/* Progress bar */}
        <View style={tw`mt-2`}>
          <View
            style={[tw`h-2 rounded-full`, { backgroundColor: colors.divider }]}
          >
            <View
              style={[
                tw`h-2 rounded-full`,
                {
                  width: `${progressPercent}%`,
                  backgroundColor:
                    progressPercent >= 100 ? colors.amber : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[tw`text-xs mt-1`, { color: colors.textSecondary }]}>
            Day {daysOld} of {expectedDuration}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw`p-4 pb-24`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <View>
            <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>
              Flocks
            </Text>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              {activeFlocks.length}/5 flocks{" "}
              {premium.isPremium ? "(Premium)" : ""}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              tw`px-4 py-2 rounded-lg`,
              { backgroundColor: colors.surface },
            ]}
            onPress={openAddModal}
          >
            <Text style={[tw`font-semibold`, { color: colors.amber }]}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Flocks */}
        <Text
          style={[
            tw`text-sm font-semibold mb-3`,
            { color: colors.textSecondary },
          ]}
        >
          ACTIVE ({activeFlocks.length})
        </Text>

        {activeFlocks.length === 0 ? (
          <View
            style={[
              tw`p-8 rounded-xl items-center`,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="egg-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text
              style={[tw`text-lg font-semibold mt-4`, { color: colors.text }]}
            >
              No flocks yet
            </Text>
            <Text
              style={[tw`text-center mt-2`, { color: colors.textSecondary }]}
            >
              Add your first flock to start tracking{"\n"}your poultry
              operations
            </Text>
          </View>
        ) : (
          activeFlocks.map((flock) => renderFlockCard(flock))
        )}

        {/* Add New Flock Card */}
        <TouchableOpacity
          style={[
            tw`p-4 rounded-xl items-center justify-center border-2 border-dashed mb-6`,
            { borderColor: colors.divider },
          ]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={24} color={colors.textSecondary} />
          <Text style={[tw`text-sm mt-1`, { color: colors.textSecondary }]}>
            Add New Flock
          </Text>
        </TouchableOpacity>

        {/* Completed Flocks */}
        {completedFlocks.length > 0 && (
          <>
            <TouchableOpacity
              onPress={() => setCompletedExpanded(!completedExpanded)}
              style={tw`flex-row items-center justify-between mb-3`}
            >
              <Text
                style={[
                  tw`text-sm font-semibold`,
                  { color: colors.textSecondary },
                ]}
              >
                COMPLETED ({completedFlocks.length})
              </Text>
              <Ionicons
                name={completedExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {completedExpanded &&
              completedFlocks.map((flock) => renderFlockCard(flock, true))}
          </>
        )}
      </ScrollView>

      {/* Add/Edit Flock Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
          <View style={[tw`p-4 border-b`, { borderColor: colors.divider }]}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>
                {editingFlock ? "Edit Flock" : "New Flock"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={tw`p-4`}>
            {/* Name */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Flock Name *
            </Text>
            <TextInput
              style={[
                tw`p-4 rounded-xl mb-4`,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="e.g., Batch 1, Broiler A"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            {/* Type - Icon Cards */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Type *
            </Text>
            <View style={tw`flex-row gap-2 mb-4`}>
              <TouchableOpacity
                style={[
                  tw`flex-1 p-4 rounded-xl items-center`,
                  {
                    backgroundColor:
                      formData.type === "broiler"
                        ? colors.primary
                        : colors.surface,
                    borderWidth: 2,
                    borderColor:
                      formData.type === "broiler"
                        ? colors.primary
                        : "transparent",
                  },
                ]}
                onPress={() => {
                  setFormData({
                    ...formData,
                    type: "broiler",
                    expectedDuration: "45",
                  });
                }}
              >
                <Ionicons
                  name="restaurant"
                  size={32}
                  color={
                    formData.type === "broiler"
                      ? colors.text
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    tw`font-medium mt-2`,
                    {
                      color:
                        formData.type === "broiler"
                          ? colors.text
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Broiler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  tw`flex-1 p-4 rounded-xl items-center`,
                  {
                    backgroundColor:
                      formData.type === "layer"
                        ? colors.primary
                        : colors.surface,
                    borderWidth: 2,
                    borderColor:
                      formData.type === "layer"
                        ? colors.primary
                        : "transparent",
                  },
                ]}
                onPress={() => {
                  setFormData({
                    ...formData,
                    type: "layer",
                    expectedDuration: "365",
                  });
                }}
              >
                <Ionicons
                  name="egg"
                  size={32}
                  color={
                    formData.type === "layer"
                      ? colors.text
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    tw`font-medium mt-2`,
                    {
                      color:
                        formData.type === "layer"
                          ? colors.text
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Layer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Breed */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Breed (optional)
            </Text>
            <TextInput
              style={[
                tw`p-4 rounded-xl mb-4`,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="e.g., Ross 308, Arbor Acres"
              placeholderTextColor={colors.textSecondary}
              value={formData.breed}
              onChangeText={(text) => setFormData({ ...formData, breed: text })}
            />

            {/* Start Date */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Start Date *
            </Text>
            <TextInput
              style={[
                tw`p-4 rounded-xl mb-4`,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={formData.startDate}
              onChangeText={(text) =>
                setFormData({ ...formData, startDate: text })
              }
            />

            {/* Initial Count */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Initial Bird Count *
            </Text>
            <TextInput
              style={[
                tw`p-4 rounded-xl mb-4`,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="e.g., 500"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={formData.initialCount}
              onChangeText={(text) =>
                setFormData({ ...formData, initialCount: text })
              }
            />

            {/* Cost Per Bird */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Cost per Bird ($) *
            </Text>
            <TextInput
              style={[
                tw`p-4 rounded-xl mb-4`,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="e.g., 1.50"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={formData.costPerBird}
              onChangeText={(text) =>
                setFormData({ ...formData, costPerBird: text })
              }
            />

            {/* Expected Duration */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Expected Cycle Duration
            </Text>
            <View style={tw`flex-row items-center gap-4 mb-4`}>
              <TouchableOpacity
                style={[
                  tw`w-12 h-12 rounded-xl items-center justify-center`,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                  const current = parseInt(formData.expectedDuration) || 45;
                  setFormData({
                    ...formData,
                    expectedDuration: Math.max(1, current - 1).toString(),
                  });
                }}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text
                style={[
                  tw`text-xl font-bold flex-1 text-center`,
                  { color: colors.text },
                ]}
              >
                {formData.expectedDuration} days
              </Text>
              <TouchableOpacity
                style={[
                  tw`w-12 h-12 rounded-xl items-center justify-center`,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                  const current = parseInt(formData.expectedDuration) || 45;
                  setFormData({
                    ...formData,
                    expectedDuration: (current + 1).toString(),
                  });
                }}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <Text
              style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
            >
              Notes (optional)
            </Text>
            <TextInput
              style={[
                tw`p-4 rounded-xl mb-6`,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              placeholder="Any additional notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[
                tw`p-4 rounded-xl items-center`,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
            >
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
                {editingFlock ? "Save Changes" : "Add Flock"}
              </Text>
            </TouchableOpacity>

            {/* Delete Button (Edit mode only) */}
            {editingFlock && (
              <TouchableOpacity
                style={[
                  tw`p-4 rounded-xl items-center mt-4`,
                  { backgroundColor: colors.danger + "20" },
                ]}
                onPress={() =>
                  handleDeleteFlock(editingFlock.id, editingFlock.name)
                }
              >
                <Text style={[tw`font-bold`, { color: colors.danger }]}>
                  Delete Flock
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
