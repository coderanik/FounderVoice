import { Platform } from "react-native";

export type PermissionResult = {
  microphone: boolean;
  notifications: boolean;
};

async function requestMicrophone(): Promise<boolean> {
  try {
    const audio = await import("expo-audio");
    const res = await audio.requestRecordingPermissionsAsync();
    return Boolean(res.granted || res.status === "granted");
  } catch {
    return false;
  }
}

async function requestNotifications(): Promise<boolean> {
  try {
    const Notifications = await import("expo-notifications");
    void Platform.OS;
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== "granted") {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    return status === "granted";
  } catch {
    return false;
  }
}

export async function requestAppPermissions(): Promise<PermissionResult> {
  const [microphone, notifications] = await Promise.all([
    requestMicrophone(),
    requestNotifications(),
  ]);
  return { microphone, notifications };
}
