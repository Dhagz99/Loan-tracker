import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BillFormInput,
  BillSchema,
  billSchema,
} from "@/src/schemas/bill.schema";
import {
  getBillById,
  updateBill,
} from "@/src/database/bills.repository";
import { showError, showSuccess } from "@/src/utils/toast";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function EditBillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const form = useForm<BillFormInput, any, BillSchema>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      title: "",
      category: "",
      amount: "",
      dueDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!id) return;

    const bill = getBillById(Number(id));

    if (bill) {
      form.reset({
        title: bill.title,
        category: bill.category,
        amount: String(bill.amount),
        dueDate: bill.dueDate,
        notes: bill.notes ?? "",
      });
    }
  }, [id]);

  function onSubmit(data: BillSchema) {
    try {
      updateBill(Number(id), data);
  
      showSuccess("Bill updated successfully");
  
      setTimeout(() => {
        router.back();
      }, 700);
    } catch (error) {
      showError("Failed to update bill");
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Edit Bill</Text>
      <Text style={styles.subHeading}>Update bill details.</Text>

      <Text style={styles.label}>Title</Text>
      <Controller
        control={form.control}
        name="title"
        render={({ field }) => (
          <TextInput
            placeholder="Bill title"
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />

      <Text style={styles.label}>Category</Text>
      <Controller
        control={form.control}
        name="category"
        render={({ field }) => (
          <TextInput
            placeholder="Category"
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />

      <Text style={styles.label}>Amount</Text>
      <Controller
        control={form.control}
        name="amount"
        render={({ field }) => (
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            style={styles.input}
            value={String(field.value ?? "")}
            onChangeText={field.onChange}
          />
        )}
      />

      <Text style={styles.label}>Due Date</Text>
      <Pressable
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          {form.watch("dueDate") || "Select due date"}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={
            form.watch("dueDate")
              ? new Date(form.watch("dueDate"))
              : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowDatePicker(false);

            if (date) {
              form.setValue("dueDate", formatDate(date), {
                shouldValidate: true,
              });
            }
          }}
        />
      )}

      <Text style={styles.label}>Notes</Text>
      <Controller
        control={form.control}
        name="notes"
        render={({ field }) => (
          <TextInput
            placeholder="Optional notes"
            style={[styles.input, styles.textArea]}
            value={field.value}
            onChangeText={field.onChange}
            multiline
          />
        )}
      />

      <Pressable style={styles.button} onPress={form.handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Update Bill</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subHeading: {
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateButtonText: {
    color: "#111827",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 14,
    marginTop: 22,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 30,
  },
  cancelButtonText: {
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
  },
});