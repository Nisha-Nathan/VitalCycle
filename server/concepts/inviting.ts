import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export interface InviteDoc extends BaseDoc {
  sentFromID: ObjectId;
  sentFromUsername: string;
  sentToID: ObjectId;
  sentToUsername: string;
}

export default class ReactingConcept {
  public readonly invites: DocCollection<InviteDoc>;

  constructor(inviteCollection: string) {
    this.invites = new DocCollection<InviteDoc>(inviteCollection);
  }

  // Create a new Invite
  async inviteUser(sentFromID: ObjectId, sentFromUsername: string, sentToID: ObjectId, sentToUsername: string) {
    const alreadyInvited = await this.checkIfInviteExists(sentFromID, sentToID);
    if (alreadyInvited) throw new Error("You have already invited this user!");
    const invite = {
      sentFromID: sentFromID,
      sentFromUsername: sentFromUsername,
      sentToID: sentToID,
      sentToUsername: sentToUsername,
    };
    const _id = await this.invites.createOne(invite);
    return { msg: "Invite created!", react: await this.invites.readOne({ _id }) };
  }

  // Get All User Ids that a specific user is invited to
  async getAllInvites(userID: ObjectId) {
    return await this.invites.readMany({ sentToID: userID });
  }

  // Get All invites that a user sent out
  async getAllInvitesSent(userID: ObjectId) {
    return await this.invites.readMany({ sentFromID: userID });
  }

  // Checking if a user has already been invited to a specific careboard
  async checkIfInviteExists(sentFrom: ObjectId, sentTo: ObjectId) {
    const result = await this.invites.readMany({ sentFromID: sentFrom, sentToID: sentTo });
    return result.length !== 0;
  }

  // Remove a reaction
  async removeInvite(sentFrom: ObjectId, sentTo: ObjectId) {
    await this.invites.deleteOne({ sentFromID: sentFrom, sentToID: sentTo });
    return { msg: "Invite deleted!" };
  }
}
