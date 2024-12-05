// server/concepts/opting.ts - implemented by Ao Qu

import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface UserOptingDoc extends BaseDoc {
  userId: ObjectId;
  sisterCircle: boolean;
  myCareBoard: boolean;
}

/**
 * concept: Opting
 */
export default class OptingConcept {
  public readonly userOpting: DocCollection<UserOptingDoc>;

  constructor(optCollection: string) {
    this.userOpting = new DocCollection<UserOptingDoc>(optCollection);
  }

  // Initialize user opting preferences
  async initializeUserOpting(userId: ObjectId) {
    const existingOpting = await this.userOpting.readOne({ userId });
    if (!existingOpting) {
      await this.userOpting.createOne({
        userId,
        sisterCircle: true,
        myCareBoard: true,
      });
    }
  }

  // Get user opting preferences
  async getUserOptingStatus(userId: ObjectId) {
    const opting = await this.userOpting.readOne({ userId });
    if (!opting) {
      throw new NotFoundError(`User opting preferences for userId ${userId} not found`);
    }
    return opting;
  }

  // Set user opting preferences for a specific feature
  async setUserOptingStatus(userId: ObjectId, feature: "sisterCircle" | "myCareBoard", status: boolean) {
    const updateResult = await this.userOpting.partialUpdateOne({ userId }, { [feature]: status });

    if (!updateResult.matchedCount) {
      throw new NotFoundError(`User opting preferences for userId ${userId} not found`);
    }
    return { msg: `${feature} status updated successfully!` };
  }
}
