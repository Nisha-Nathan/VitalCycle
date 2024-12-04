import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export interface ReplyDoc extends BaseDoc {
  author: ObjectId;
  username: string;
  postID: ObjectId;
  content: string;
}

export default class ReplyingConcept {
  public readonly replies: DocCollection<ReplyDoc>;

  constructor(replyCollection: string) {
    this.replies = new DocCollection<ReplyDoc>(replyCollection);
  }

  // Create a new post reply
  async replyToPost(author: ObjectId, username: string, postID: ObjectId, content: string) {
    const reply = {
      author: author,
      username: username,
      postID: postID,
      content: content,
    };
    const _id = await this.replies.createOne(reply);
    return { msg: "Reply created!", react: await this.replies.readOne({ _id }) };
  }

  // Get all replies on a specific post by a specific user
  async getUserRepliesOnPost(user: ObjectId, postID: ObjectId) {
    return await this.replies.readMany({ user, postID });
  }

  // Get all replies on a specific post
  async getRepliesOnPost(postID: ObjectId) {
    return await this.replies.readMany({ postID });
  }

  // Remove a reply
  async removeUserReplyOnPost(author: ObjectId, postID: ObjectId) {
    await this.replies.deleteOne({ author, postID });
    return { msg: "Reply deleted!" };
  }
}
