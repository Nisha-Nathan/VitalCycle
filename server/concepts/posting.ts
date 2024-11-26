import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


export interface SisterCirclePostDoc extends BaseDoc {
  author: ObjectId;
  username: string | null; // Null for anonymous
  title: string;
  content: string;
  anonymous: boolean;
  circles: string[];
}

export interface MyCareBoardPostDoc extends BaseDoc {
  author: ObjectId;
  username: string;
  title: string;
  content: string;
}

export interface CircleDoc extends BaseDoc {
  name: string;
}

/**
 * concept: Posting [Author]
 */
export default class PostingConcept {
  public readonly sisterCirclePosts: DocCollection<SisterCirclePostDoc>;
  public readonly myCareBoardPosts: DocCollection<MyCareBoardPostDoc>;
  public readonly circles: DocCollection<CircleDoc>;

  constructor(sisterCircleCollection: string, careBoardCollection: string, circlesCollection: string) {
    this.sisterCirclePosts = new DocCollection<SisterCirclePostDoc>(sisterCircleCollection);
    this.myCareBoardPosts = new DocCollection<MyCareBoardPostDoc>(careBoardCollection);
    this.circles = new DocCollection<CircleDoc>(circlesCollection);

    // Initialize default circles
    this.initializeDefaultCircles();
  }

  private async initializeDefaultCircles() {
    const existingCircles = await this.circles.readMany({});
    if (existingCircles.length === 0) {
      await this.circles.createOne({ name: "Fertility" });
      await this.circles.createOne({ name: "Menopause" });
    }
  }
  
  private async ensureCircles(circles: string[]): Promise<string[]> {
      // Fetch existing circles from the database
      const existingCircles = await this.circles.readMany({ name: { $in: circles } });
    
      // Create a Set of existing circle names for quick lookup
      const existingNamesSet = new Set(existingCircles.map(c => c.name));

      // Iterate over the input circles and add missing ones to the database
      for (const circle of circles) {
          if (!existingNamesSet.has(circle)) {
              await this.circles.createOne({ name: circle });
              existingNamesSet.add(circle); // Update the Set to include the newly added circle
          }
      }

      return circles;
  }

  // Create SisterCircle Post
  async createSisterCirclePost(author: ObjectId, username: string | null, title: string, content: string, anonymous: boolean, circles: string[]) {
    const validatedCircles = await this.ensureCircles(circles);
    const post = {
      author: author,
      username: anonymous ? null : username,
      title,
      content,
      anonymous,
      circles: validatedCircles,
    };
    const _id = await this.sisterCirclePosts.createOne(post);
    return { msg: "SisterCircle post created!", post: await this.sisterCirclePosts.readOne({ _id }) };
  }

  // Create MyCareBoard Post
  async createMyCareBoardPost(author: ObjectId, username: string, title: string, content: string) {
    const post = {
      author,
      username,
      title,
      content,
    };
    const _id = await this.myCareBoardPosts.createOne(post);
    return { msg: "MyCareBoard post created!", post: await this.myCareBoardPosts.readOne({ _id }) };
  }

  // Fetch all circles
  async getAllCircles() {
    return await this.circles.readMany({}, { sort: { name: 1 } }); // Sort alphabetically
  }

  // Get all SisterCircle posts sorted by dateUpdated (descending)
  async getAllSisterCirclePosts() {
    return await this.sisterCirclePosts.readMany({}, { sort: { dateUpdated: -1 } });
  }

  // Fetch SisterCircle Posts by Author
  async getSisterCirclePostsByAuthor(author: ObjectId) {
    return await this.sisterCirclePosts.readMany({ author });
  }

  // Fetch MyCareBoard Posts by Author
  async getMyCareBoardPostsByAuthor(author: ObjectId) {
    return await this.myCareBoardPosts.readMany({ author });
  }

  // Delete SisterCircle Post
  async deleteSisterCirclePost(_id: ObjectId) {
    await this.sisterCirclePosts.deleteOne({ _id });
    return { msg: "SisterCircle post deleted!" };
  }

  // Delete MyCareBoard Post
  async deleteMyCareBoardPost(_id: ObjectId) {
    await this.myCareBoardPosts.deleteOne({ _id });
    return { msg: "MyCareBoard post deleted!" };
  }

  // Assert that the user is the author of a post (common for both SisterCircle and MyCareBoard)
  async assertAuthorIsUser(_id: ObjectId, user: ObjectId, collectionType: "SisterCircle" | "MyCareBoard") {
    const collection = collectionType === "SisterCircle" ? this.sisterCirclePosts : this.myCareBoardPosts;

    const post = await collection.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`${collectionType} post ${_id} does not exist!`);
    }

    if (!post.author || post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(public readonly author: ObjectId, public readonly _id: ObjectId) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}

