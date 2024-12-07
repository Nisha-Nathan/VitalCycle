import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

const notificationMessageTemplates = [
  "🌸 Time to prioritize yourself—let's focus on {activity}! 💖",
  "✨ A little {activity} goes a long way. Start now and feel great! 🌟",
  "🌼 Small steps make a big difference. How about some {activity} today? 🌿",
  "💪 You’re doing amazing—don’t forget your {activity}! 🚀",
  "🕊️ Take a deep breath and carve out time for {activity}. 🌬️",
  "🌞 Start your day strong with some {activity}! 🌅",
  "🌈 It’s the perfect moment to sprinkle in some {activity}. Let’s go! 🎉",
  "✨ Here’s your reminder to embrace a moment of {activity}. 🌻",
  "🕰️ Just a little {activity} can brighten your day. Why not now? 😊",
  "🌸 Prioritize you—let’s do some {activity} today. You’re worth it! 💕",
  "  🌿 Hey, superstar! It’s time for your {activity}. 🌟",
  "💡 You’ll feel amazing after some {activity}. Take the first step! 🌈",
  "🌻 A small dose of {activity} can make your day even brighter. ☀️",
  "🎵 Let’s add a rhythm of {activity} to your day. 🎶",
  "💖 Your well-being matters—don’t skip your {activity} today! ✨",
  "🌞 You’ve got this! How about a quick {activity} session? 🌺",
  "💡 Reminder: A little {activity} can lead to big wins. 🌟",
  "🌸 You deserve this moment. Let’s do some {activity} together! 🌷",
  "🕊️ Peaceful moments start with {activity}. Begin now. 🌿",
  "🌟 Shine bright! Take a moment for {activity}. You’ll thank yourself later. 🌈",
  "🌼 Ready for your dose of {activity}? You’ve got this! 🌟",
  "✨ It’s a great time for some {activity}. Start small, feel great. 🌸",
  "🩷 Let’s nurture yourself with a little {activity} today. 🌼",
  "💬 Friendly reminder: Your {activity} moment awaits. 🌻",
  "🎶 Feel the rhythm—add some {activity} to your day! 🎵",
  "💖 Your health is your priority—focus on {activity} now. 🌸",
  "🌞 Let’s make today amazing with a bit of {activity}. 🌟",
  "🌈 Every little bit of {activity} counts. You’re doing great! 💕",
  "🕰️ Time flies! Make room for {activity} now. 🌿",
  "🌸 Self-love alert: Give yourself some time for {activity}. 💖",
  "✨ You’re amazing! Let’s keep the momentum with {activity}. 💪",
  "💡 Your future self will thank you for some {activity} today. 🌻",
  "🌼 You’re unstoppable—don’t skip your {activity} moment. 🌟",
  "🌙 A small step for you—a big step for self-care. Do {activity}! ✨",
  "🌞 Hello, sunshine! Let’s brighten your day with {activity}. 🌺",
  "🕊️ You’re one step closer to your goals. Focus on {activity} now! 🌈",
  "🎉 Celebrate yourself with a bit of {activity}. You’ve earned it! 🥳",
  "🌸 Your journey is unique and beautiful. Add some {activity} to it. 🌿",
  "🌟 Positive vibes only! Start your {activity} now. 💕",
  "🛤️ Progress is progress, no matter how small. Begin your {activity}. 🌼",
  "💖 Take a pause. {activity} can help you feel refreshed. 🌸",
  "🌻 You’re doing great! Let’s keep it going with {activity}. 🌟",
  "🌞 Self-care isn’t selfish. Prioritize {activity} today. 🕊️",
  "🌈 Breathe in peace, breathe out stress. Time for {activity}.✨",
  "💡 Recharge your energy—focus on {activity}. You’ve got this! 🌸",
  "🛌 A little rest and a little {activity} can work wonders. 🌙",
  "🌟 Your health matters. Add a sprinkle of {activity} to your day. 🌼",
  "🎉 One moment at a time. Let’s do some {activity} now! 🌈",
  "🕊️ You deserve this! Make time for {activity} today. 🌞",
  "✨ Every effort counts. A little {activity} can go a long way! 💪",
];

export interface NotificationDoc extends BaseDoc {
  user: ObjectId;
  notifyAbout: string;
  notificationTime: Date;
  status: "delivered" | "pending";
  notificationContent: string;
  frequency: "once" | "daily" | "weekly";
  timeFrame: TimeFrame;
}

type TimeFrame = {
  hours: number;
  minutes: number;
};


/**
 * concept: Notification [User]
 */
export default class NotificationConcept {
  public readonly notifications: DocCollection<NotificationDoc>;

  constructor(collectionName: string) {
    this.notifications = new DocCollection<NotificationDoc>(collectionName);
  }

  async createNotification(user: ObjectId, notifyAbout: string,    frequency: "once" | "daily" | "weekly", timeFrame: TimeFrame) {
    const notificationContent = await this.generateNotificationContent(notifyAbout);
    const notificationTime = this.getNotificationTime(timeFrame, frequency);
    const currentTime = new Date();

    if (!notificationTime || notificationTime <= currentTime) {
      throw new NotAllowedError("Notification time must be in the future");
    }

    const _id = await this.notifications.createOne({
      user,
      notifyAbout,
      notificationTime,
      status: "pending",
      notificationContent,
      frequency,
      timeFrame,
    });
    return await this.notifications.readOne({ _id });
  }

  private getNotificationTime(
    timeFrame: { hours: number; minutes: number },
    frequency: "once" | "daily" | "weekly"
  ): Date {
    const currentTime = new Date();

    // Set the notification time based on the provided hours and minutes
    const notificationTime = new Date(currentTime);
    notificationTime.setHours(timeFrame.hours  , timeFrame.minutes, 0, 0);

    // Adjust for frequency
    if (frequency === "weekly") {
      notificationTime.setDate(notificationTime.getDate() + 7);
    } else if (frequency === "daily" && notificationTime <= currentTime) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    return notificationTime;
  }


  async deliverPendingNotifications() {
    const currentTime = new Date();
    const pendingNotifications = await this.notifications.readMany({ status: "pending" });

    for (const notification of pendingNotifications) {
      if (notification.notificationTime <= currentTime) {
        // Update status to 'delivered'
        await this.notifications.partialUpdateOne({ _id: notification._id }, { status: "delivered" });

        if (notification.frequency !== "once") {
          const nextNotificationTime = this.getNextNotificationTime(
            notification.notificationTime,
            notification.frequency
          );

          await this.notifications.partialUpdateOne(
            { _id: notification._id },
            {
              status: "pending",
              notificationTime: nextNotificationTime,
              notificationContent: this.generateNotificationContent(
                notification.notifyAbout
              ),
            });
          }

        // If frequency is daily or weekly, schedule the next notification
        // if (notification.frequency) {
        //   const nextNotificationTime = this.getNextNotificationTime(notification.notificationTime, notification.frequency);
        //   const newNotificationContent = await this.generateNotificationContent(notification.notifyAbout);

        //   await this.notifications.partialUpdateOne(
        //     { _id: notification._id },
        //     {
        //       status: "pending",
        //       notificationTime: nextNotificationTime,
        //       notificationContent: newNotificationContent,
        //     },
        //   );
        // }
      }
    }

    return { msg: "Pending notifications delivered successfully!" };
  }

  async deleteNotification(_id: ObjectId) {
    const notification = await this.notifications.deleteOne({ _id });
    return { msg: "Notification deleted successfully!", notification };
  }

  async deleteAllNotifications(user: ObjectId) {
    const notifications = await this.notifications.deleteMany({ user });
    return { msg: "All notifications deleted successfully!", notifications };
  }

  async getDeliveredNotifications(user: ObjectId) {
    const notifications = await this.notifications.readMany({ user, status: "delivered" });
    return {notifications: notifications, count: notifications.length};
  }

  async getPendingNotifications(user: ObjectId) {
    return await this.notifications.readMany({ user, status: "pending" });
  }

  private getNextNotificationTime(previousTime: Date, frequency: "daily" | "weekly"): Date {
    const nextNotificationTime = new Date(previousTime);
    if (frequency === "daily") {
      nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
    } else if (frequency === "weekly") {
      nextNotificationTime.setDate(nextNotificationTime.getDate() + 7);
    }
    return nextNotificationTime;
  }

  private generateNotificationContent(notifyAbout: string): string {
    // Select a random template and replace the placeholder
    const randomIndex = Math.floor(Math.random() * notificationMessageTemplates.length);

    return notificationMessageTemplates[randomIndex].replace("{activity}", notifyAbout.toLowerCase());
  }
}
