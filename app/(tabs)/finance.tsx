import Colors from "@/constants/Colors";
import { useAppStore } from "@/stores/useAppStore";
import type { ExpenseCategory, SaleType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import tw from "twrnc";

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const {
    expenses,
    sales,
    addExpense,
    addSale,
    deleteExpense,
    deleteSale,
    getActiveFlocks,
    settings,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"expenses" | "sales">("expenses");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<"expense" | "sale">("expense");

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    category: "feed" as ExpenseCategory,
    amount: "",
    description: "",
    flockId: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  const [saleForm, setSaleForm] = useState({
    saleType: "eggs" as SaleType,
    quantity: "",
    unitPrice: "",
    buyerName: "",
    flockId: "",
    saleDate: new Date().toISOString().split("T")[0],
  });

  const activeFlocks = getActiveFlocks();
  const currency = settings.currency || "$";

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSales = sales.reduce(
    (sum, s) => sum + s.quantity * s.unitPrice,
    0,
  );
  const netProfit = totalSales - totalExpenses;

  const handleAddExpense = () => {
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    addExpense({
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description || undefined,
      flockId: expenseForm.flockId || undefined,
      expenseDate: expenseForm.expenseDate,
    });

    setShowAddModal(false);
    setExpenseForm({
      category: "feed",
      amount: "",
      description: "",
      flockId: "",
      expenseDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleAddSale = () => {
    if (!saleForm.quantity || parseFloat(saleForm.quantity) <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }
    if (!saleForm.unitPrice || parseFloat(saleForm.unitPrice) <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }
    if (!saleForm.flockId) {
      Alert.alert("Error", "Please select a flock");
      return;
    }

    addSale({
      saleType: saleForm.saleType,
      quantity: parseFloat(saleForm.quantity),
      unitPrice: parseFloat(saleForm.unitPrice),
      buyerName: saleForm.buyerName || undefined,
      flockId: saleForm.flockId,
      saleDate: saleForm.saleDate,
    });

    setShowAddModal(false);
    setSaleForm({
      saleType: "eggs",
      quantity: "",
      unitPrice: "",
      buyerName: "",
      flockId: "",
      saleDate: new Date().toISOString().split("T")[0],
    });
  };

  const expenseCategories: {
    key: ExpenseCategory;
    label: string;
    icon: string;
  }[] = [
    { key: "feed", label: "Feed", icon: "leaf" },
    { key: "medicine", label: "Medicine", icon: "medical" },
    { key: "labor", label: "Labor", icon: "people" },
    { key: "utilities", label: "Utilities", icon: "flash" },
    { key: "other", label: "Other", icon: "ellipsis-horizontal" },
  ];

  const saleTypes: { key: SaleType; label: string }[] = [
    { key: "eggs", label: "Eggs" },
    { key: "birds", label: "Birds" },
    { key: "manure", label: "Manure" },
    { key: "other", label: "Other" },
  ];

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Header */}
        <Text style={[tw`text-2xl font-bold mb-2`, { color: colors.text }]}>
          Finance
        </Text>

        {/* P&L Summary */}
        <View
          style={[tw`p-4 rounded-xl mb-6`, { backgroundColor: colors.surface }]}
        >
          <View style={tw`flex-row justify-between mb-3`}>
            <View>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                Revenue
              </Text>
              <Text style={[tw`text-xl font-bold`, { color: colors.primary }]}>
                {currency}
                {totalSales.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                Expenses
              </Text>
              <Text style={[tw`text-xl font-bold`, { color: colors.danger }]}>
                {currency}
                {totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={[tw`h-px`, { backgroundColor: colors.divider }]} />
          <View style={tw`mt-3`}>
            <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
              Net Profit
            </Text>
            <Text
              style={[
                tw`text-2xl font-bold`,
                {
                  color: netProfit >= 0 ? colors.primary : colors.danger,
                },
              ]}
            >
              {currency}
              {netProfit.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View
          style={[
            tw`flex-row rounded-xl p-1 mb-4`,
            { backgroundColor: colors.surface },
          ]}
        >
          <TouchableOpacity
            style={[
              tw`flex-1 p-3 rounded-lg`,
              {
                backgroundColor:
                  activeTab === "expenses" ? colors.primary : "transparent",
              },
            ]}
            onPress={() => setActiveTab("expenses")}
          >
            <Text
              style={[
                tw`text-center font-medium`,
                {
                  color:
                    activeTab === "expenses"
                      ? colors.text
                      : colors.textSecondary,
                },
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw`flex-1 p-3 rounded-lg`,
              {
                backgroundColor:
                  activeTab === "sales" ? colors.primary : "transparent",
              },
            ]}
            onPress={() => setActiveTab("sales")}
          >
            <Text
              style={[
                tw`text-center font-medium`,
                {
                  color:
                    activeTab === "sales" ? colors.text : colors.textSecondary,
                },
              ]}
            >
              Sales
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={[
            tw`flex-row items-center justify-center p-4 rounded-xl mb-4`,
            {
              backgroundColor: colors.accent,
            },
          ]}
          onPress={() => {
            setModalType(activeTab === "expenses" ? "expense" : "sale");
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color={colors.text} />
          <Text style={[tw`ml-2 font-bold`, { color: colors.text }]}>
            Add {activeTab === "expenses" ? "Expense" : "Sale"}
          </Text>
        </TouchableOpacity>

        {/* List */}
        {activeTab === "expenses" ? (
          expenses.length === 0 ? (
            <View
              style={[
                tw`p-8 rounded-xl items-center`,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[tw`mt-3`, { color: colors.textSecondary }]}>
                No expenses recorded
              </Text>
            </View>
          ) : (
            expenses.map((expense) => (
              <View
                key={expense.id}
                style={[
                  tw`flex-row items-center p-4 rounded-xl mb-2`,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View
                  style={[
                    tw`w-10 h-10 rounded-full items-center justify-center`,
                    { backgroundColor: colors.danger + "30" },
                  ]}
                >
                  <Ionicons name="remove" size={20} color={colors.danger} />
                </View>
                <View style={tw`flex-1 ml-3`}>
                  <Text
                    style={[tw`font-medium capitalize`, { color: colors.text }]}
                  >
                    {expense.category}
                  </Text>
                  <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                    {expense.expenseDate}
                  </Text>
                </View>
                <Text style={[tw`font-bold`, { color: colors.danger }]}>
                  -{currency}
                  {expense.amount.toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={tw`ml-3`}
                  onPress={() => deleteExpense(expense.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            ))
          )
        ) : sales.length === 0 ? (
          <View
            style={[
              tw`p-8 rounded-xl items-center`,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[tw`mt-3`, { color: colors.textSecondary }]}>
              No sales recorded
            </Text>
          </View>
        ) : (
          sales.map((sale) => (
            <View
              key={sale.id}
              style={[
                tw`flex-row items-center p-4 rounded-xl mb-2`,
                { backgroundColor: colors.surface },
              ]}
            >
              <View
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center`,
                  { backgroundColor: colors.primary + "30" },
                ]}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
              <View style={tw`flex-1 ml-3`}>
                <Text
                  style={[tw`font-medium capitalize`, { color: colors.text }]}
                >
                  {sale.saleType}
                </Text>
                <Text style={[tw`text-sm`, { color: colors.textSecondary }]}>
                  {sale.saleDate}
                </Text>
              </View>
              <Text style={[tw`font-bold`, { color: colors.primary }]}>
                +{currency}
                {(sale.quantity * sale.unitPrice).toFixed(2)}
              </Text>
              <TouchableOpacity
                style={tw`ml-3`}
                onPress={() => deleteSale(sale.id)}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.danger}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
          <View style={[tw`p-4 border-b`, { borderColor: colors.divider }]}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>
                Add {modalType === "expense" ? "Expense" : "Sale"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={tw`p-4`}>
            {modalType === "expense" ? (
              <>
                {/* Category */}
                <Text
                  style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
                >
                  Category
                </Text>
                <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                  {expenseCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        tw`px-4 py-2 rounded-full`,
                        {
                          backgroundColor:
                            expenseForm.category === cat.key
                              ? colors.primary
                              : colors.surface,
                        },
                      ]}
                      onPress={() =>
                        setExpenseForm({ ...expenseForm, category: cat.key })
                      }
                    >
                      <Text
                        style={{
                          color:
                            expenseForm.category === cat.key
                              ? colors.text
                              : colors.textSecondary,
                        }}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Amount */}
                <Text
                  style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
                >
                  Amount ({currency})
                </Text>
                <TextInput
                  style={[
                    tw`p-4 rounded-xl mb-4`,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={expenseForm.amount}
                  onChangeText={(text) =>
                    setExpenseForm({ ...expenseForm, amount: text })
                  }
                />

                {/* Description */}
                <Text
                  style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
                >
                  Description (Optional)
                </Text>
                <TextInput
                  style={[
                    tw`p-4 rounded-xl mb-4`,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="Add notes..."
                  placeholderTextColor={colors.textSecondary}
                  value={expenseForm.description}
                  onChangeText={(text) =>
                    setExpenseForm({ ...expenseForm, description: text })
                  }
                />

                <TouchableOpacity
                  style={[
                    tw`p-4 rounded-xl items-center mt-4`,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddExpense}
                >
                  <Text style={[tw`font-bold`, { color: colors.text }]}>
                    Add Expense
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Sale Type */}
                <Text
                  style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
                >
                  What did you sell?
                </Text>
                <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                  {saleTypes.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        tw`px-4 py-2 rounded-full`,
                        {
                          backgroundColor:
                            saleForm.saleType === type.key
                              ? colors.primary
                              : colors.surface,
                        },
                      ]}
                      onPress={() =>
                        setSaleForm({ ...saleForm, saleType: type.key })
                      }
                    >
                      <Text
                        style={{
                          color:
                            saleForm.saleType === type.key
                              ? colors.text
                              : colors.textSecondary,
                        }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Flock */}
                <Text
                  style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
                >
                  Flock
                </Text>
                <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                  {activeFlocks.map((flock) => (
                    <TouchableOpacity
                      key={flock.id}
                      style={[
                        tw`px-4 py-2 rounded-full`,
                        {
                          backgroundColor:
                            saleForm.flockId === flock.id
                              ? colors.primary
                              : colors.surface,
                        },
                      ]}
                      onPress={() =>
                        setSaleForm({ ...saleForm, flockId: flock.id })
                      }
                    >
                      <Text
                        style={{
                          color:
                            saleForm.flockId === flock.id
                              ? colors.text
                              : colors.textSecondary,
                        }}
                      >
                        {flock.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quantity */}
                <Text
                  style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
                >
                  Quantity
                </Text>
                <TextInput
                  style={[
                    tw`p-4 rounded-xl mb-4`,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={saleForm.quantity}
                  onChangeText={(text) =>
                    setSaleForm({ ...saleForm, quantity: text })
                  }
                />

                {/* Unit Price */}
                <Text
                  style={[tw`text-sm font-medium mb-2`, { color: colors.text }]}
                >
                  Price per unit ({currency})
                </Text>
                <TextInput
                  style={[
                    tw`p-4 rounded-xl mb-4`,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={saleForm.unitPrice}
                  onChangeText={(text) =>
                    setSaleForm({ ...saleForm, unitPrice: text })
                  }
                />

                <TouchableOpacity
                  style={[
                    tw`p-4 rounded-xl items-center mt-4`,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddSale}
                >
                  <Text style={[tw`font-bold`, { color: colors.text }]}>
                    Record Sale
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
