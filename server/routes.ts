import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Checklist, Friending, Inviting, Logging, Notification, Opting, Posting, Reacting, Replying, Sessioning } from "./app";
import { Activity, FlowIntensity, Mood, Symptom } from "./concepts/logging";
import { ReactEmoji } from "./concepts/reacting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/opting/:userId")
  async getUserOptingStatus(username: string) {
    const id = (await Authing.getUserByUsername(username))._id;
    return await Opting.getUserOptingStatus(id);
  }

  @Router.post("/opting/:userId")
  async initializeUserOpting(userId: string) {
    const id = new ObjectId(userId);
    return await Opting.initializeUserOpting(id);
  }

  @Router.patch("/opting/:userId")
  async setUserOptingStatus(userId: string, feature: "sisterCircle" | "myCareBoard", status: boolean) {
    const id = new ObjectId(userId);
    return await Opting.setUserOptingStatus(id, feature, status);
  }

  @Router.get("/sistercircle/posts")
  async getSisterCirclePosts(author?: string, circle?: string) {
    let posts;

    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getSisterCirclePostsByAuthor(id);
    } else {
      posts = await Posting.getAllSisterCirclePosts();
    }

    if (circle && circle !== "All Circles") {
      const circlePosts = await Posting.getSisterCirclePostsByCircle(circle);
      const circlePostIds = new Set(circlePosts.map((post) => post._id.toString()));
      posts = posts.filter((post) => circlePostIds.has(post._id.toString()));
    }
    const postsReturned = await Responses.posts(posts);
    return postsReturned;
  }

  @Router.get("/sistercircle/posts/byTitle")
  async getSisterCirclePostsByTitle(title?: string) {
    let posts;
    if (title) {
      posts = await Posting.getSisterCirclePostsByTitle(title);
    } else {
      posts = await Posting.getAllSisterCirclePosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/sistercircle/posts")
  async createSisterCirclePost(session: SessionDoc, title: string, content: string, anonymous: boolean, circles: string[]) {
    const userID = Sessioning.getUser(session);
    const user = await Authing.getUserById(userID);
    const created = await Posting.createSisterCirclePost(anonymous ? null : userID, anonymous ? null : user.username, title, content, anonymous, circles);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.delete("/sistercircle/posts/:id")
  async deleteSisterCirclePost(session: SessionDoc, id: string) {
    // const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    // await Posting.assertAuthorIsUser(oid, user, "SisterCircle");
    return Posting.deleteSisterCirclePost(oid);
  }

  @Router.get("/mycareboard/posts")
  async getMyCareBoardPosts(author: string) {
    const posts = await Posting.getMyCareBoardPostsByDestinationUsername(author);
    return Responses.posts(posts);
  }

  @Router.post("/mycareboard/posts")
  async createMyCareBoardPost(session: SessionDoc, title: string, content: string, postedOnUsername: string) {
    const userID = Sessioning.getUser(session);
    const user = await Authing.getUserById(userID);
    if (postedOnUsername !== user.username) throw new Error("You cannot create a post on a careboard that isn't your own.");
    const created = await Posting.createMyCareBoardPost(userID, user.username, title, content, postedOnUsername);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.delete("/mycareboard/posts/:id")
  async deleteMyCareBoardPost(session: SessionDoc, id: string) {
    //const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    // await Posting.assertAuthorIsUser(oid, user, "MyCareBoard");
    return await Posting.deleteMyCareBoardPost(oid);
  }

  @Router.get("/circles")
  async getCircles(username?: string) {
    if (username) {
      const id = (await Authing.getUserByUsername(username))._id;
      return { circles: await Authing.getUserCircles(id) };
    }

    const circles = await Posting.getAllCircles();
    const result = await Responses.circles(circles);
    return { circles: result };
  }

  @Router.get("/suggest/circles")
  async getsuggestCircles(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const userCircles = await Authing.getUserCircles(user);
    const allCircles = await Posting.getAllCircles();
    let circles;
    if (!userCircles) {
      circles = allCircles;
    } else {
      circles = allCircles.filter((circle) => !userCircles.includes(circle.name));
    }
    const result = await Responses.circles(circles);
    return { circles: result };
  }

  @Router.get("/circles/:username")
  async getUserCircles(username: string) {
    const id = (await Authing.getUserByUsername(username))._id;
    return { circles: await Authing.getUserCircles(id) };
  }

  @Router.post("/circles")
  async addCircles(session: SessionDoc, circles: string[]) {
    const user = Sessioning.getUser(session);
    return await Authing.addUserToCircle(user, circles);
  }

  @Router.post("/remove/circles")
  async removeUserCircle(session: SessionDoc, circle: string) {
    const user = Sessioning.getUser(session);
    return await Authing.removeUserFromCircle(user, circle);
  }

  @Router.post("/suggestedCircles")
  async addCircleSuggestion(session: SessionDoc, circleName: string, description?: string) {
    const user = Sessioning.getUser(session);
    const username = (await Authing.getUserById(user)).username;
    return await Posting.createSuggestedCircle(user, username, circleName, description);
  }

  @Router.post("/remove/suggestedCircles")
  async removeSuggestedCircle(session: SessionDoc, circleName: string) {
    const user = Sessioning.getUser(session);
    return await Posting.deleteSuggestedCircle(user, circleName);
  }

  @Router.get("/suggestedCircles/:username")
  async getSuggestedCircles(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const username = (await Authing.getUserById(user)).username;
    const directResult = await Posting.getAllSuggestedCircles(username);
    let result = [];
    for (const suggestedCircle of directResult) {
      result.push(suggestedCircle.name);
    }
    return { circles: result };
  }

  @Router.get("/suggestedCircles/description/:circleName")
  async getSuggestedCircleDescription(session: SessionDoc, circleName: string) {
    const user = Sessioning.getUser(session);
    const username = (await Authing.getUserById(user)).username;
    const result = await Posting.getSuggestionDescription(username, circleName);
    return { description: result?.description };
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  @Router.get("/cycles/stats")
  async getCycleStats(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const stats = await Logging.calculateCycleStats(user);
    return { stats };
  }

  @Router.get("/activity/stats")
  async getActivityStats(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const stats = await Logging.calculateActivityStats(user);
    return { stats };
  }

  @Router.post("/logs")
  async createLog(session: SessionDoc, dateOfLog: Date, symptoms: Symptom[], mood: Mood | null, flow: FlowIntensity | null, notes: string) {
    const user = Sessioning.getUser(session);
    return await Logging.create(user, dateOfLog, symptoms, mood, flow, notes);
  }

  @Router.post("/activity/logs")
  async createActivityLog(session: SessionDoc, dateOfLog: Date, activities: Activity[]) {
    const user = Sessioning.getUser(session);
    return await Logging.createActivityLog(user, dateOfLog, activities);
  }

  @Router.put("/logs/:id")
  async updateLog(session: SessionDoc, id: string, symptoms: Symptom[], mood: Mood | null, flow: FlowIntensity | null, notes: string) {
    console.log("in routes, updating for id: ", id);
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Logging.assertAuthorIsUser(oid, user);
    return await Logging.update(oid, symptoms, mood, flow, notes);
  }

  @Router.put("/activity/logs/:id")
  async updateActivityLog(session: SessionDoc, id: string, activities: Activity[]) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Logging.assertAuthorIsUser(oid, user);
    return await Logging.updateActivityLog(oid, activities);
  }

  @Router.get("/log")
  async getLog(session: SessionDoc, date: Date) {
    const user = Sessioning.getUser(session);
    return await Logging.getLogByDate(user, date);
  }

  @Router.get("/activity/log")
  async getActivityLog(session: SessionDoc, date: Date) {
    const user = Sessioning.getUser(session);
    return await Logging.getActivityLogByDate(user, date);
  }

  @Router.get("/circles")
  @Router.validate(z.object({ user: z.string().optional() }))
  async getPosts(user: string) {
    const id = (await Authing.getUserByUsername(user))._id;
    return await Authing.getUserCircles(id);
  }

  @Router.get("/reacts")
  async getReactsOnPost(postID: string) {
    const oid = new ObjectId(postID);
    const result = await Reacting.getReactCountsOnPost(oid);
    return result;
  }

  @Router.post("/reacts")
  async toggleReaction(session: SessionDoc, postID: string, emoji: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(postID);
    let emojiChoice: ReactEmoji;
    switch (emoji) {
      case "thumb":
        emojiChoice = ReactEmoji.Thumb;
        break;
      case "heart":
        emojiChoice = ReactEmoji.Heart;
        break;
      default:
        emojiChoice = ReactEmoji.Sad;
        break;
    }
    const alreadyReacted = await Reacting.checkIfReactionExists(user, oid, emojiChoice);
    if (alreadyReacted) {
      return await Reacting.removeUserReactionOnPost(user, oid, emojiChoice);
    } else {
      return await Reacting.reactToPost(user, oid, emojiChoice);
    }
  }

  @Router.get("/reacts/bySessionUser")
  async getReactionsByUserOnPost(session: SessionDoc, postID: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(postID);
    const thumb = await Reacting.checkIfReactionExists(user, oid, ReactEmoji.Thumb);
    const heart = await Reacting.checkIfReactionExists(user, oid, ReactEmoji.Heart);
    const sad = await Reacting.checkIfReactionExists(user, oid, ReactEmoji.Sad);
    return { thumb: thumb, heart: heart, sad: sad };
  }

  // Returns a list of reply objects
  @Router.get("/replies")
  async getRepliesOnPost(postID: string) {
    const oid = new ObjectId(postID);
    const replies = await Replying.getRepliesOnPost(oid);
    return { replies };
  }
  @Router.post("/invites")
  async sendInvite(session: SessionDoc, inviteUsername: string) {
    const myOid = Sessioning.getUser(session);
    const sentToUserOid = (await Authing.getUserByUsername(inviteUsername))._id;
    const alreadyInvited = await Inviting.checkIfInviteExists(myOid, sentToUserOid);
    if (alreadyInvited) {
      throw new Error("you already invited this user!");
    } else {
      const myUsername = (await Authing.getUserById(myOid)).username;
      const sentToUsername = (await Authing.getUserById(sentToUserOid)).username;
      if (myUsername == sentToUsername) {
        throw new Error("you cannot invite yourself!");
      }
      return await Inviting.inviteUser(myOid, myUsername, sentToUserOid, sentToUsername);
    }
  }

  @Router.delete("/invites/:sentToUsername")
  async removeSentInvite(session: SessionDoc, sentToUsername: string) {
    const user = Sessioning.getUser(session);
    const oidSentTo = (await Authing.getUserByUsername(sentToUsername))._id;
    return await Inviting.removeInvite(user, oidSentTo);
  }

  @Router.get("/invites")
  async getInvitedToBoards(session: SessionDoc) {
    const myOid = Sessioning.getUser(session);
    return await Inviting.getAllInvites(myOid);
  }

  @Router.get("/invites/sent")
  async getSentInvites(session: SessionDoc) {
    const myOid = Sessioning.getUser(session);
    return await Inviting.getAllInvitesSent(myOid);
  }

  @Router.post("/create/notification")
  async createNotification(session: SessionDoc, notifyAbout: string, frequency: string, timeFrame: { hours: number; minutes: number }) {
    const user = Sessioning.getUser(session);
    if (!notifyAbout || !frequency || !timeFrame || timeFrame.hours == null || timeFrame.minutes == null) {
      throw new Error("Invalid input: 'notifyAbout', 'frequency', and 'timeFrame' are required.");
    }

    // Call your NotificationConcept to create the notification
    const result = await Notification.createNotification(user, notifyAbout, frequency as "once" | "daily" | "weekly", {
      hours: timeFrame.hours,
      minutes: timeFrame.minutes,
    });
    return { msg: "Notification created successfully!", notification: result };
  }

  @Router.get("/notifications/deliver")
  async deliverNotifications() {
    const result = await Notification.deliverPendingNotifications();
    return result;
  }

  @Router.delete("/notifications/:id")
  async deleteNotification(id: string) {
    const notificationOid = new ObjectId(id);
    const result = await Notification.deleteNotification(notificationOid);
    return result;
  }

  @Router.delete("/notifications")
  async deleteNotifications(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const result = await Notification.deleteAllNotifications(user);
    return result;
  }

  @Router.get("/notifications/delivered")
  async getDeliveredNotifications(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const result = await Notification.getDeliveredNotifications(user);
    return result;
  }

  // debugging routes
  // @Router.get("/logs")
  // async getLogs() {
  //   return await Logging.getInstance().getLogs();
  // }

  // Route to add a new reply to a post
  @Router.post("/replies")
  async addReplyToPost(session: SessionDoc, postID: string, content: string) {
    const user = Sessioning.getUser(session); // Get the current user from session
    const oid = new ObjectId(postID);
    const username = (await Authing.getUserById(user)).username;

    // Add a new reply
    return await Replying.replyToPost(user, username, oid, content);
  }

  // Get all replies by specific user on specific post
  @Router.get("/replies/bySessionUser")
  async getRepliesByUserOnPost(session: SessionDoc, postID: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(postID);

    // Get user's reply to post
    const userReplies = await Replying.getUserRepliesOnPost(user, oid);

    if (userReplies.length > 0) {
      return { replies: userReplies };
    } else {
      return { msg: "You haven't replied to this post yet!" };
    }
  }

  @Router.get("/checklisting/:userId/:date")
  async getChecklist(userId: string, date: string) {
    const id = new ObjectId(userId);
    return await Checklist.getChecklist(id, date);
  }

  @Router.post("/checklisting/:userId/:date/initialize")
  async initializeChecklist(userId: string, date: string) {
    const id = new ObjectId(userId);
    await Checklist.initializeChecklist(id, date);
    return { msg: "Checklist initialized successfully!" };
  }

  @Router.post("/checklisting/:userId/:date/task")
  async addTask(userId: string, date: string, description: string) {
    const id = new ObjectId(userId);
    return await Checklist.addTask(id, date, description);
  }

  @Router.delete("/checklisting/:userId/:date/task/:taskIndex")
  async removeTask(userId: string, date: string, taskIndex: string) {
    const id = new ObjectId(userId);
    const index = parseInt(taskIndex, 10);
    return await Checklist.removeTask(id, date, index);
  }

  @Router.patch("/checklisting/:userId/:date/task/:taskIndex")
  async toggleTask(userId: string, date: string, taskIndex: string) {
    const id = new ObjectId(userId);
    const index = parseInt(taskIndex, 10);
    return await Checklist.toggleTask(id, date, index);
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
