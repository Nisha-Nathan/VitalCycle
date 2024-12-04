import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export enum ReactEmoji {
  Heart,
  Sad,
  Thumb,
}

export interface ReactDoc extends BaseDoc {
  author: ObjectId;
  postID: ObjectId;
  emoji: ReactEmoji;
}

export default class ReactingConcept {
  public readonly reacts: DocCollection<ReactDoc>;

  constructor(reactCollection: string) {
    this.reacts = new DocCollection<ReactDoc>(reactCollection);
  }

  // Create a new Reaction
  async reactToPost(author: ObjectId, postID: ObjectId, emoji: ReactEmoji) {
    const alreadyReacted = await this.checkIfReactionExists(author, postID, emoji);
    if (alreadyReacted) throw new Error("You have already reacted to this post with this emoji!");
    const react = {
      author: author,
      postID: postID,
      emoji: emoji,
    };
    const _id = await this.reacts.createOne(react);
    return { msg: "React created!", react: await this.reacts.readOne({ _id }) };
  }

  // Get All Reacts on a Specific Post
  async getReactCountsOnPost(postID: ObjectId) {
    const thumbs = await this.reacts.readMany({ postID: postID, emoji: ReactEmoji.Thumb });
    const hearts = await this.reacts.readMany({ postID: postID, emoji: ReactEmoji.Heart });
    const sads = await this.reacts.readMany({ postID: postID, emoji: ReactEmoji.Sad });
    return { thumb: thumbs, heart: hearts, sad: sads };
  }

  // Get All Reacts on a Specific Post that are by a Specific User
  async getUserReactsOnPost(user: ObjectId, postID: ObjectId) {
    return await this.reacts.readMany({ user, postID });
  }

  // Checking if a user has already reacted with a particualar emoji to a post
  async checkIfReactionExists(user: ObjectId, postID: ObjectId, emoji: ReactEmoji) {
    const result = await this.reacts.readMany({ author: user, postID: postID, emoji: emoji });
    return result.length !== 0;
  }

  // Remove a reaction
  async removeUserReactionOnPost(author: ObjectId, postID: ObjectId, emoji: ReactEmoji) {
    await this.reacts.deleteOne({ author, postID, emoji });
    return { msg: "Reaction deleted!" };
  }
}
