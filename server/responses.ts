import { ObjectId } from "mongodb";
import { Authing } from "./app";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friending";
import { CircleDoc, MyCareBoardPostDoc, PostAuthorNotMatchError, SisterCirclePostDoc } from "./concepts/posting";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: MyCareBoardPostDoc | SisterCirclePostDoc | null) {
    if (!post) {
      return post;
    }
    if(!post.author) {
      return { ...post, author: null };
    }
    const author = await Authing.getUserById(post.author);
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: MyCareBoardPostDoc[] | SisterCirclePostDoc[]) {
    const postAuthorIDs = posts.map((post) => post.author) // some might be null (if anonymous)
    let usernamesToGet: ObjectId[] = postAuthorIDs.filter((id): id is ObjectId => id !== null);
    let authors = await Authing.idsToUsernames(usernamesToGet);
    authors = authors.reverse();

    let result: {post: MyCareBoardPostDoc | SisterCirclePostDoc , authorUsername: string | null}[] = [];
    for(const post of posts) {
      if(!post.author)
        result.push({ post: post , authorUsername: null });
      else {
        const nextAuthor = authors.pop();
        if(nextAuthor)
          result.push({ post: post , authorUsername: nextAuthor });
      }
    }

    return result;
  }

  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await Authing.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }

  static async circles(circles: CircleDoc[]) {
    return circles.map((circle) => ({ id: circle._id.toString(), name: circle.name }));
  }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await Authing.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.from), Authing.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.user1), Authing.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.from), Authing.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.user1), Authing.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});
