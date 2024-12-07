import { defineStore } from "pinia";
import { fetchy } from "@/utils/fetchy";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    deliveredCount: 0, // Holds the count of delivered notifications
    deliveredNotifications: <Array<Record<string, string>>>[],
  }),
  actions: {
    // Fetch the count of delivered notifications from the backend
    async fetchDeliveredCount() {
      try {
        const response = await fetchy("/api/notifications/delivered", "GET");
        this.deliveredCount = response.count;
      } catch (error) {
        console.error("Failed to fetch delivered notifications count:", error);
      }
    },

    async fetchDeliveredNotifications() {
      try {
        const response = await fetchy("/api/notifications/delivered", "GET");
        this.deliveredNotifications = response.notifications;
        return response.notifications;
      } catch (error) {
        console.error("Failed to fetch delivered notifications count:", error);
      }
    },

    // Decrement the count manually when notifications are marked as read
    decrementCount() {
      if (this.deliveredCount > 0) {
        this.deliveredCount -= 1;
      }
    },

    resetCount() {
      this.deliveredCount = 0;
    },

    async deleteNotification(notificationId: string) {
      await fetchy(`/api/notifications/${notificationId}`, "DELETE");
      this.deliveredNotifications = this.deliveredNotifications.filter((notification) => notification._id !== notificationId);
      this.decrementCount();
    },

    async deleteAllNotifications() {
      await fetchy("/api/notifications", "DELETE");
      this.deliveredNotifications = [];
      this.resetCount();
    },
  },
});
