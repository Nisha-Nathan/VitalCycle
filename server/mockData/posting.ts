import { ObjectId } from "mongodb";

export const mockAuthor1 = new ObjectId();
export const mockAuthor2 = new ObjectId();

export const sisterCircleMockData = [
  {
    _id: new ObjectId(),
    author: mockAuthor1,
    username: "user1",
    title: "Dealing with Menopause Symptoms",
    content: "I've been struggling with hot flashes. What are some remedies?",
    anonymous: false,
    circles: ["Menopause"],
    dateUpdated: new Date("2024-12-01"),
  },
  {
    _id: new ObjectId(),
    author: null,
    username: null,
    title: "Managing Fertility Treatments",
    content: "Any advice for managing stress during fertility treatments?",
    anonymous: true,
    circles: ["Fertility"],
    dateUpdated: new Date("2024-11-30"),
  },
  {
    _id: new ObjectId(),
    author: new ObjectId(),
    username: "wellnessFanatic",
    title: "Coping with Hormonal Changes",
    content: "Has anyone tried yoga or meditation for hormonal balance?",
    anonymous: false,
    circles: ["Menopause", "Fertility"],
    dateUpdated: new Date("2024-12-02"),
  },
  {
    _id: new ObjectId(),
    author: null,
    username: null,
    title: "Stigma Around Menstrual Health",
    content: "How do you handle discussions about menstrual health in public?",
    anonymous: true,
    circles: ["Menstrual Hygiene"],
    dateUpdated: new Date("2024-12-03"),
  },
  {
    _id: new ObjectId(),
    author: new ObjectId(),
    username: "fertilityWarrior",
    title: "Positive Stories from IVF",
    content: "I’m looking for positive IVF success stories. Please share!",
    anonymous: false,
    circles: ["Fertility"],
    dateUpdated: new Date("2024-12-01"),
  },
  {
    _id: new ObjectId(),
    author: new ObjectId(),
    username: "anonymous123",
    title: "Balancing Work and Menopause",
    content: "How do you stay productive at work while managing symptoms?",
    anonymous: true,
    circles: ["Menopause"],
    dateUpdated: new Date("2024-11-29"),
  },
];

export const myCareBoardMockData = [
  {
    _id: new ObjectId(),
    author: mockAuthor2,
    username: "caregiver123",
    title: "Supporting a Friend Through IVF",
    content: "What are some ways to offer emotional support?",
    postedOnUsername: "friend_user",
    dateUpdated: new Date("2024-11-28"),
  },
  {
    _id: new ObjectId(),
    author: mockAuthor1,
    username: "healthGuru",
    title: "Menstrual Cycle Tracking Tips",
    content: "Sharing my journey of learning to track cycles effectively.",
    postedOnUsername: "community_user",
    dateUpdated: new Date("2024-11-25"),
  },
  {
    _id: new ObjectId(),
    author: new ObjectId(),
    username: "mentalHealthAdvocate",
    title: "Tips for Self-Care During Fertility Treatments",
    content: "Sharing some helpful routines that worked for me.",
    postedOnUsername: "fertilityGroup",
    dateUpdated: new Date("2024-12-03"),
  },
  {
    _id: new ObjectId(),
    author: mockAuthor2,
    username: "caregiver123",
    title: "How to Discuss Menopause Openly",
    content: "What are some conversation starters about menopause?",
    postedOnUsername: "supportCircle",
    dateUpdated: new Date("2024-11-27"),
  },
  {
    _id: new ObjectId(),
    author: new ObjectId(),
    username: "cycleTrackerPro",
    title: "Best Apps for Menstrual Tracking",
    content: "Any recommendations for accurate and user-friendly apps?",
    postedOnUsername: "trackingExperts",
    dateUpdated: new Date("2024-11-26"),
  },
  {
    _id: new ObjectId(),
    author: mockAuthor1,
    username: "healthGuru",
    title: "Diet Tips for Hormonal Balance",
    content: "Can certain foods help stabilize hormones? Let’s discuss!",
    postedOnUsername: "healthCommunity",
    dateUpdated: new Date("2024-11-25"),
  },
];

export const circleMockData = [
  {
    _id: new ObjectId(),
    name: "Fertility",
    description: "Discussions about fertility challenges and treatments.",
  },
  {
    _id: new ObjectId(),
    name: "Menopause",
    description: "Support for those experiencing menopause symptoms.",
  },
  {
    _id: new ObjectId(),
    name: "Menstrual Hygiene",
    description: "Tips and experiences related to menstrual health.",
  },
  {
    _id: new ObjectId(),
    name: "Mental Health",
    description: "A space to discuss mental health challenges and strategies.",
  },
  {
    _id: new ObjectId(),
    name: "Work-Life Balance",
    description: "Tips and advice for balancing work, family, and personal health.",
  },
];
