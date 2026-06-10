import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Bill } from "../types/bill";
import { getBillDisplayStatus } from "@/src/utils/billStatus";

type Props = {
  bill: Bill;
  onToggleStatus: () => void;
  onDelete: () => void;
};

export function BillCard({ bill, onToggleStatus, onDelete }: Props) {
  const displayStatus = getBillDisplayStatus(bill);
  const isPaid = displayStatus === "paid";
  const isOverdue = displayStatus === "overdue";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="receipt-outline" size={22} color="#2563eb" />
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>{bill.title}</Text>
          <Text style={styles.category}>{bill.category}</Text>
        </View>

        <Text style={styles.amount}>₱{Number(bill.amount).toLocaleString()}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.dueDate}>Due: {bill.dueDate}</Text>

        <View
          style={[
            styles.badge,
            isPaid && styles.paidBadge,
            displayStatus === "unpaid" && styles.unpaidBadge,
            isOverdue && styles.overdueBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isPaid && styles.paidText,
              displayStatus === "unpaid" && styles.unpaidText,
              isOverdue && styles.overdueText,
            ]}
          >
            {displayStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onToggleStatus}
          style={[styles.actionButton, isPaid ? styles.unpaidButton : styles.paidButton]}
        >
          <Text style={styles.actionText}>
            {isPaid ? "Mark Unpaid" : "Mark Paid"}
          </Text>
        </Pressable>

        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color="#dc2626" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  category: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  metaRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  paidBadge: {
    backgroundColor: "#dcfce7",
  },
  unpaidBadge: {
    backgroundColor: "#fef3c7",
  },
  overdueBadge: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  paidText: {
    color: "#166534",
  },
  unpaidText: {
    color: "#92400e",
  },
  overdueText: {
    color: "#991b1b",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    padding: 11,
    borderRadius: 12,
  },
  paidButton: {
    backgroundColor: "#16a34a",
  },
  unpaidButton: {
    backgroundColor: "#6b7280",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  deleteButton: {
    width: 44,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
});