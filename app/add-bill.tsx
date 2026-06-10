import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BillFormInput,
  billSchema,
  BillSchema,
} from "@/src/schemas/bill.schema";
import { createBill } from "@/src/database/bills.repository";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function AddBillScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BillFormInput, any, BillSchema>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      title: "",
      category: "Loan",
      amount: "",
      dueDate: "",
      notes: "",
    },
  });

  const selectedDueDate = watch("dueDate");

  function onSubmit(data: BillSchema) {
    createBill(data);
    reset();
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Add New Bill</Text>
      <Text style={styles.subHeading}>Save your bill or loan due date.</Text>

      <Text style={styles.label}>Title</Text>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <TextInput
            placeholder="Example: Maya Loan"
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

      <Text style={styles.label}>Category</Text>
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <TextInput
            placeholder="Loan, Utility, Internet"
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.category && (
        <Text style={styles.error}>{errors.category.message}</Text>
      )}

      <Text style={styles.label}>Amount</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <TextInput
            placeholder="Example: 3500"
            keyboardType="numeric"
            style={styles.input}
            value={String(field.value ?? "")}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.amount && (
        <Text style={styles.error}>{errors.amount.message}</Text>
      )}

      <Text style={styles.label}>Due Date</Text>
      <Pressable
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={[
            styles.dateButtonText,
            !selectedDueDate && styles.placeholderText,
          ]}
        >
          {selectedDueDate || "Select due date"}
        </Text>
      </Pressable>
      {errors.dueDate && (
        <Text style={styles.error}>{errors.dueDate.message}</Text>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDueDate ? new Date(selectedDueDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowDatePicker(false);

            if (date) {
              setValue("dueDate", formatDate(date), {
                shouldValidate: true,
              });
            }
          }}
        />
      )}

      <Text style={styles.label}>Notes</Text>
      <Controller
        control={control}
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

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Save Bill</Text>
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
  placeholderText: {
    color: "#9ca3af",
  },
  error: {
    color: "#dc2626",
    marginTop: 5,
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