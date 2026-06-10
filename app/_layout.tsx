import { Stack } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { initDatabase } from "@/src/database/db";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="add-bill"
          options={{
            title: "Add Bill",
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="edit-bill/[id]"
          options={{
            title: "Edit Bill",
            presentation: "modal",
          }}
        />
      </Stack>

      <Toast />
    </>
  );
}