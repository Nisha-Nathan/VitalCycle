/* eslint-disable @typescript-eslint/no-unused-vars */
import AuthenticatingConcept from "./concepts/authenticating";
import FriendingConcept from "./concepts/friending";
import InvitingConcept from "./concepts/inviting";
import PostingConcept from "./concepts/posting";
import ReactingConcept from "./concepts/reacting";
import ReplyingConcept from "./concepts/replying";
import SessioningConcept from "./concepts/sessioning";
import ChecklistConcept from "./concepts/checklisting";
import OptingConcept from "./concepts/opting";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("sisterCirclePosts", "careBoardPosts", "circles");
export const Friending = new FriendingConcept("friends");
export const Reacting = new ReactingConcept("reacts");
export const Replying = new ReplyingConcept("replies");
export const Checklist = new ChecklistConcept("checklists");
export const Inviting = new InvitingConcept("invites");
export const Opting = new OptingConcept("opting");
export { default as Logging } from "./concepts/logging";
