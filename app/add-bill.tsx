import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BillFormInput,
  BillSchema,
  billSchema,
  InstallmentBillFormInput,
  InstallmentBillSchema,
  installmentBillSchema,
} from "@/src/schemas/bill.schema";
import {
  createBill,
  createInstallmentBills,
} from "@/src/database/bills.repository";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

type FormMode = "single" | "installment";

export default function AddBillScreen() {
  const [mode, setMode] = useState<FormMode>("single");
  const [showSingleDatePicker, setShowSingleDatePicker] = useState(false);
  const [showInstallmentDatePicker, setShowInstallmentDatePicker] =
    useState(false);

  const singleForm = useForm<BillFormInput, any, BillSchema>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      title: "",
      category: "Loan",
      amount: "",
      dueDate: "",
      notes: "",
    },
  });

  const installmentForm = useForm<
    InstallmentBillFormInput,
    any,
    InstallmentBillSchema
  >({
    resolver: zodResolver(installmentBillSchema),
    defaultValues: {
      title: "",
      category: "Loan",
      totalAmount: "",
      terms: "",
      firstDueDate: "",
      notes: "",
    },
  });

  const totalAmount = Number(installmentForm.watch("totalAmount") || 0);
  const terms = Number(installmentForm.watch("terms") || 0);
  const monthlyAmount = totalAmount > 0 && terms > 0 ? totalAmount / terms : 0;

  function onSubmitSingle(data: BillSchema) {
    createBill(data);
    singleForm.reset();
    router.back();
  }

  function onSubmitInstallment(data: InstallmentBillSchema) {
    createInstallmentBills(data);
    installmentForm.reset();
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Add Bill</Text>
      <Text style={styles.subHeading}>Save single bill or installment loan.</Text>

      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setMode("single")}
          style={[styles.modeButton, mode === "single" && styles.activeMode]}
        >
          <Text
            style={[
              styles.modeText,
              mode === "single" && styles.activeModeText,
            ]}
          >
            Single Bill
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("installment")}
          style={[
            styles.modeButton,
            mode === "installment" && styles.activeMode,
          ]}
        >
          <Text
            style={[
              styles.modeText,
              mode === "installment" && styles.activeModeText,
            ]}
          >
            Installment
          </Text>
        </Pressable>
      </View>

      {mode === "single" && (
        <>
          <Text style={styles.label}>Title</Text>
          <Controller
            control={singleForm.control}
            name="title"
            render={({ field }) => (
              <TextInput
                placeholder="Example: Electric Bill"
                style={styles.input}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          {singleForm.formState.errors.title && (
            <Text style={styles.error}>
              {singleForm.formState.errors.title.message}
            </Text>
          )}

          <Text style={styles.label}>Category</Text>
          <Controller
            control={singleForm.control}
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

          <Text style={styles.label}>Amount</Text>
          <Controller
            control={singleForm.control}
            name="amount"
            render={({ field }) => (
              <TextInput
                placeholder="Example: 1500"
                keyboardType="numeric"
                style={styles.input}
                value={String(field.value ?? "")}
                onChangeText={field.onChange}
              />
            )}
          />
          {singleForm.formState.errors.amount && (
            <Text style={styles.error}>
              {singleForm.formState.errors.amount.message}
            </Text>
          )}

          <Text style={styles.label}>Due Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowSingleDatePicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                !singleForm.watch("dueDate") && styles.placeholderText,
              ]}
            >
              {singleForm.watch("dueDate") || "Select due date"}
            </Text>
          </Pressable>

          {showSingleDatePicker && (
            <DateTimePicker
              value={
                singleForm.watch("dueDate")
                  ? new Date(singleForm.watch("dueDate"))
                  : new Date()
              }
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowSingleDatePicker(false);

                if (date) {
                  singleForm.setValue("dueDate", formatDate(date), {
                    shouldValidate: true,
                  });
                }
              }}
            />
          )}

          <Text style={styles.label}>Notes</Text>
          <Controller
            control={singleForm.control}
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

          <Pressable
            style={styles.button}
            onPress={singleForm.handleSubmit(onSubmitSingle)}
          >
            <Text style={styles.buttonText}>Save Bill</Text>
          </Pressable>
        </>
      )}

      {mode === "installment" && (
        <>
          <Text style={styles.label}>Loan Name</Text>
          <Controller
            control={installmentForm.control}
            name="title"
            render={({ field }) => (
              <TextInput
                placeholder="Example: Shopee Loan"
                style={styles.input}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          <Text style={styles.label}>Category</Text>
          <Controller
            control={installmentForm.control}
            name="category"
            render={({ field }) => (
              <TextInput
                placeholder="Loan"
                style={styles.input}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          <Text style={styles.label}>Total Loan Amount</Text>
          <Controller
            control={installmentForm.control}
            name="totalAmount"
            render={({ field }) => (
              <TextInput
                placeholder="Example: 5000"
                keyboardType="numeric"
                style={styles.input}
                value={String(field.value ?? "")}
                onChangeText={field.onChange}
              />
            )}
          />

          <Text style={styles.label}>Terms / Months</Text>
          <Controller
            control={installmentForm.control}
            name="terms"
            render={({ field }) => (
              <TextInput
                placeholder="Example: 5"
                keyboardType="numeric"
                style={styles.input}
                value={String(field.value ?? "")}
                onChangeText={field.onChange}
              />
            )}
          />

          <Text style={styles.label}>First Due Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowInstallmentDatePicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                !installmentForm.watch("firstDueDate") &&
                  styles.placeholderText,
              ]}
            >
              {installmentForm.watch("firstDueDate") || "Select first due date"}
            </Text>
          </Pressable>

          {showInstallmentDatePicker && (
            <DateTimePicker
              value={
                installmentForm.watch("firstDueDate")
                  ? new Date(installmentForm.watch("firstDueDate"))
                  : new Date()
              }
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowInstallmentDatePicker(false);

                if (date) {
                  installmentForm.setValue("firstDueDate", formatDate(date), {
                    shouldValidate: true,
                  });
                }
              }}
            />
          )}

          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Monthly Payment</Text>
            <Text style={styles.previewAmount}>
              ₱{monthlyAmount.toLocaleString()}
            </Text>
            <Text style={styles.previewText}>
              This will create {terms || 0} monthly bill records.
            </Text>
          </View>

          <Text style={styles.label}>Notes</Text>
          <Controller
            control={installmentForm.control}
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

          <Pressable
            style={styles.button}
            onPress={installmentForm.handleSubmit(onSubmitInstallment)}
          >
            <Text style={styles.buttonText}>Generate Installment Bills</Text>
          </Pressable>
        </>
      )}

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
  modeRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  activeMode: {
    backgroundColor: "#fff",
  },
  modeText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#6b7280",
  },
  activeModeText: {
    color: "#111827",
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
  previewBox: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 18,
    marginTop: 16,
  },
  previewLabel: {
    color: "#d1d5db",
    fontSize: 13,
  },
  previewAmount: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  previewText: {
    color: "#9ca3af",
    marginTop: 6,
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