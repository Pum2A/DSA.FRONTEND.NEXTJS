import { useAuthStore } from "../authStore";
import { useNotificationStore } from "../notificationStore";
// Reset store przed każdym testem, by testy nie wpływały na siebie
beforeEach(() => {
  useAuthStore.getState().reset();
});
describe("NotificationStore", () => {
  beforeEach(() => {
    useNotificationStore.getState().clearNotification();
  });

  it("ma domyślnie pustą notyfikację", () => {
    expect(useNotificationStore.getState().notification).toBeNull();
  });

  it("ustawia powiadomienie", () => {
    const notif = { message: "Hello!", type: "success" as const };
    useNotificationStore.getState().setNotification(notif);
    expect(useNotificationStore.getState().notification).toEqual(notif);
  });

  it("czyści powiadomienie", () => {
    useNotificationStore
      .getState()
      .setNotification({ message: "Ups", type: "error" });
    useNotificationStore.getState().clearNotification();
    expect(useNotificationStore.getState().notification).toBeNull();
  });
});
