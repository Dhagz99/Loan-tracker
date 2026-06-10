import { BillCard } from "@/src/components/BillCard";
import {
    deleteBill,
    getBillsByMonth,
    updateBillStatus
} from "@/src/database/bills.repository";
import { Bill, BillDisplayStatus } from "@/src/types/bill";
import { getBillDisplayStatus } from "@/src/utils/billStatus";
import { showError, showSuccess } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from "react-native";

type FilterTab = "all" | BillDisplayStatus;

const filters: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Overdue", value: "overdue" },
  { label: "Paid", value: "paid" },
];

export default function DashboardScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  
  function loadBills() {
    setBills(getBillsByMonth(selectedYear, selectedMonth));
  }

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [selectedYear, selectedMonth])
  );

  const total = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  const paid = bills
    .filter((bill) => getBillDisplayStatus(bill) === "paid")
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  const unpaid = bills
    .filter((bill) => getBillDisplayStatus(bill) === "unpaid")
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  const overdue = bills
    .filter((bill) => getBillDisplayStatus(bill) === "overdue")
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  const filteredBills = useMemo(() => {
    if (activeFilter === "all") {
      return bills;
    }

    return bills.filter((bill) => getBillDisplayStatus(bill) === activeFilter);
  }, [bills, activeFilter]);

  function handleToggleStatus(bill: Bill) {
    try {
      const newStatus = bill.status === "paid" ? "unpaid" : "paid";
  
      updateBillStatus(bill.id, newStatus);
  
      showSuccess(
        newStatus === "paid"
          ? "Bill marked as paid"
          : "Bill marked as unpaid"
      );
  
      loadBills();
    } catch (error) {
      console.error(error);
  
      showError("Failed to update bill status");
    }
  }
  
  function handleDelete(id: number) {
    try {
      deleteBill(id);
  
      showSuccess("Bill deleted successfully");
  
      loadBills();
    } catch (error) {
      console.error(error);
  
      showError("Failed to delete bill");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.heading}>DueTrack</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="wallet-outline" size={26} color="#2563eb" />
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Bills</Text>
          <Text style={styles.totalAmount}>₱{total.toLocaleString()}</Text>
          <Text style={styles.totalSubText}>{bills.length} saved records</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={styles.paidAmount}>₱{paid.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Unpaid</Text>
            <Text style={styles.unpaidAmount}>₱{unpaid.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={styles.overdueAmount}>₱{overdue.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.monthRow}>
  <Pressable
    style={styles.monthButton}
    onPress={() => {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear((prev) => prev - 1);
      } else {
        setSelectedMonth((prev) => prev - 1);
      }
    }}
  >
    <Ionicons name="chevron-back" size={20} color="#111827" />
  </Pressable>

  <Text style={styles.monthText}>
    {new Date(selectedYear, selectedMonth - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}
  </Text>

  <Pressable
    style={styles.monthButton}
    onPress={() => {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear((prev) => prev + 1);
      } else {
        setSelectedMonth((prev) => prev + 1);
      }
    }}
  >
    <Ionicons name="chevron-forward" size={20} color="#111827" />
  </Pressable>
</View>
   <FlatList
  data={filters}
  horizontal
  keyExtractor={(item) => item.value}
  showsHorizontalScrollIndicator={false}
  style={styles.filterList}
  contentContainerStyle={styles.filterRow}
  renderItem={({ item }) => {
    const isActive = activeFilter === item.value;

    return (
      <Pressable
        onPress={() => setActiveFilter(item.value)}
        style={[styles.filterButton, isActive && styles.activeFilterButton]}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.activeFilterButtonText,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  }}
/>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter === "all" ? "All Bills" : `${activeFilter} Bills`}
          </Text>
          <Text style={styles.sectionCount}>{filteredBills.length} items</Text>
        </View>

        <FlatList
          data={filteredBills}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <BillCard
              bill={item}
              onToggleStatus={() => handleToggleStatus(item)}
              onDelete={() => handleDelete(item.id)}
              onEdit={() =>
                router.push({
                  pathname: "/edit-bill/[id]",
                  params: {
                    id: String(item.id),
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={46} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No bills found</Text>
              <Text style={styles.emptyText}>
                Try another filter or add a new bill.
              </Text>
            </View>
          }
        />

        <Pressable
          style={styles.floatingButton}
          onPress={() => router.push("/add-bill")}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  greeting: {
    fontSize: 14,
    color: "#6b7280",
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
  },
  totalLabel: {
    color: "#d1d5db",
    fontSize: 14,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 6,
  },
  totalSubText: {
    color: "#9ca3af",
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 6,
  },
  paidAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16a34a",
  },
  unpaidAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ca8a04",
  },
  overdueAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#dc2626",
  },

  filterButton: {
    minWidth: 90,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
  
  activeFilterButtonText: {
    color: "#ffffff",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
  },
  sectionCount: {
    fontSize: 13,
    color: "#6b7280",
  },
  listContent: {
    paddingBottom: 100,
  },
  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 28,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 4,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  filterList: {
    minHeight:40,
    maxHeight: 48,
    marginBottom: 12,
  },
  filterRow: {
    gap: 8,
    alignItems: "center",
  },
});