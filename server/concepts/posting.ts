import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { circleMockData, myCareBoardMockData, sisterCircleMockData } from "../mockData/posting";
import { NotAllowedError, NotFoundError } from "./errors";

export interface SisterCirclePostDoc extends BaseDoc {
  author: ObjectId | null;
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
  postedOnUsername: string;
}

export interface CircleDoc extends BaseDoc {
  name: string;
  description?: string;
}

export interface CircleSuggestionDoc extends BaseDoc {
  author: ObjectId;
  username: string;
  name: string;
  description?: string;
}

const predefinedCircles = ["Fertility", "Menopause", "Menstrual Hygiene"];

/**
 * concept: Posting [Author]
 */
export default class PostingConcept {
  public readonly sisterCirclePosts: DocCollection<SisterCirclePostDoc>;
  public readonly myCareBoardPosts: DocCollection<MyCareBoardPostDoc>;
  public readonly circles: DocCollection<CircleDoc>;
  public readonly suggestedCircles: DocCollection<CircleSuggestionDoc>;

  constructor(sisterCircleCollection: string, careBoardCollection: string, circlesCollection: string, suggestedCircleCollection: string) {
    this.sisterCirclePosts = new DocCollection<SisterCirclePostDoc>(sisterCircleCollection);
    this.myCareBoardPosts = new DocCollection<MyCareBoardPostDoc>(careBoardCollection);
    this.circles = new DocCollection<CircleDoc>(circlesCollection);
    this.suggestedCircles = new DocCollection<CircleSuggestionDoc>(suggestedCircleCollection);

    // Initialize default circles
    void this.initializeDefaultCircles();
    // void this.injectMockData();
  }

  async injectMockData() {
    // Add circles
    for (const circle of circleMockData) {
      await this.circles.createOne(circle);
    }

    // Add SisterCircle posts
    for (const post of sisterCircleMockData) {
      await this.sisterCirclePosts.createOne(post);
    }

    // Add MyCareBoard posts
    for (const post of myCareBoardMockData) {
      await this.myCareBoardPosts.createOne(post);
    }

    console.log("Mock data injected successfully!");
  }
  private async initializeDefaultCircles() {
    const existingCircles = await this.circles.readMany({});

    for (const circle of predefinedCircles) {
      if (!existingCircles.some((c) => c.name === circle)) {
        await this.circles.createOne({ name: circle });
      }
    }
  }

  private async ensureCircles(circles: string[]): Promise<string[]> {
    // Fetch existing circles from the database
    const existingCircles = await this.circles.readMany({ name: { $in: circles } });

    // Create a Set of existing circle names for quick lookup
    const existingNamesSet = new Set(existingCircles.map((c) => c.name));

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
  async createSisterCirclePost(author: ObjectId | null, username: string | null, title: string, content: string, anonymous: boolean, circles: string[]) {
    //const validatedCircles = await this.ensureCircles(circles);
    const post = {
      author: author,
      username: anonymous ? null : username,
      title,
      content,
      anonymous,
      circles: circles,
    };
    const _id = await this.sisterCirclePosts.createOne(post);
    return { msg: "SisterCircle post created!", post: await this.sisterCirclePosts.readOne({ _id }) };
  }

  // Create MyCareBoard Post
  async createMyCareBoardPost(author: ObjectId, username: string, title: string, content: string, postedOnUsername: string) {
    const post = {
      author,
      username,
      title,
      content,
      postedOnUsername,
    };
    const _id = await this.myCareBoardPosts.createOne(post);
    return { msg: "MyCareBoard post created!", post: await this.myCareBoardPosts.readOne({ _id }) };
  }

  // Create Suggested Circle
  async createSuggestedCircle(author: ObjectId, username: string, circleName: string, description?: string) {
    //this.ensureCircleDoesntExist(author, circleName);
    const circleToSuggest = {
      author,
      username,
      name: circleName,
      description,
    };

    const _id = await this.suggestedCircles.createOne(circleToSuggest);
    return { msg: "Circle Suggestion Created!", circle: await this.suggestedCircles.readOne({ _id }) };
  }

  // Delete suggested circle
  async deleteSuggestedCircle(author: ObjectId, circleName: string) {
    await this.suggestedCircles.deleteOne({ author, name: circleName });
    return { msg: "Suggested circle deleted!" };
  }

  // Get all circles suggested by username
  async getAllSuggestedCircles(username: string) {
    const result = await this.suggestedCircles.readMany({ username });
    return result;
  }

  // Get all circles suggested by username
  async getSuggestionDescription(username: string, circleName: string) {
    const result = await this.suggestedCircles.readOne({ username, name: circleName });
    return result;
  }

  async ensureCircleDoesntExist(author: ObjectId, circleName: string) {
    const result = await this.circles.readMany({ name: circleName });
    if (result.length > 0) throw new Error("You cannot suggest this circle because it already exists in Sister Circles!");
    const result2 = await this.suggestedCircles.readMany({ author, name: circleName });
    if (result2.length > 0) throw new Error("You cannot suggest this circle because you have already suggested it!");
  }

  // Fetch all circles
  async getAllCircles() {
    return await this.circles.readMany({}, { sort: { name: 1 } }); // Sort alphabetically
  }

  // Get all SisterCircle posts sorted by dateUpdated (descending)
  async getAllSisterCirclePosts() {
    return await this.sisterCirclePosts.readMany({}, { sort: { dateUpdated: -1 } });
  }

  async getSisterCirclePostsByCircle(circleName: string) {
    const circle = await this.circles.readOne({ name: circleName });
    if (!circle) {
      throw new Error(`Circle with name ${circleName} not found`);
    }
    const posts = await this.sisterCirclePosts.readMany({ circles: { $in: [circle.name] } }, { sort: { dateUpdated: -1 } });
    return posts;
  }

  // Fetch SisterCircle Posts by Author
  async getSisterCirclePostsByAuthor(author: ObjectId) {
    return await this.sisterCirclePosts.readMany({ author }, { sort: { dateUpdated: -1 } });
  }

  private titleContains(title: string, search: string): boolean {
    return title.toLowerCase().includes(search.toLowerCase());
  }

  // Fetch SisterCircle Posts by title
  async getSisterCirclePostsByTitle(title: string) {
    if (!title) {
      throw new Error("Title search string cannot be empty");
    }

    try {
      // Fetch all posts
      const posts = await this.sisterCirclePosts.readMany({}, { sort: { dateUpdated: -1 } });

      // Filter posts where the title contains the search string (case-insensitive)
      const filteredPosts = posts.filter((post) => this.titleContains(post.title, title));

      // Return the filtered posts
      return filteredPosts;
    } catch (error) {
      console.error("Error fetching posts by title:", error);
      throw new Error("Failed to fetch posts by title");
    }
  }

  // Fetch MyCareboard Posts by Board Posted To
  async getMyCareBoardPostsByDestinationUsername(postedOnUsername: string) {
    return await this.myCareBoardPosts.readMany({ postedOnUsername }, { sort: { dateUpdated: -1 } });
  }

  // Fetch MyCareBoard Posts by Author
  async getMyCareBoardPostsByAuthor(author: ObjectId) {
    return await this.myCareBoardPosts.readMany({ author }, { sort: { dateUpdated: -1 } });
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
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
