// server/concepts/checklisting.ts - implemented by Ao Qu

import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface Task {
  description: string;
  completed: boolean;
}

export interface ChecklistDoc extends BaseDoc {
  userId: ObjectId;
  date: string; // Stored as ISO date string (e.g., "2024-12-05")
  tasks: Task[];
}

/**
 * concept: Checklist
 */
export default class ChecklistConcept {
  public readonly userChecklist: DocCollection<ChecklistDoc>;

  constructor(checklistCollection: string) {
    this.userChecklist = new DocCollection<ChecklistDoc>(checklistCollection);
  }

  // Initialize a checklist for a user on a specific date
  async initializeChecklist(userId: ObjectId, date: string) {
    const existingChecklist = await this.userChecklist.readOne({ userId, date });
    if (!existingChecklist) {
      await this.userChecklist.createOne({
        userId,
        date,
        tasks: [],
      });
    }
  }

  // Get the checklist for a user on a specific date
  async getChecklist(userId: ObjectId, date: string) {
    const checklist = await this.userChecklist.readOne({ userId, date });
    if (!checklist) {
      throw new NotFoundError(`Checklist for userId ${userId} on ${date} not found`);
    }
    return checklist;
  }

  // Add a task to the user's checklist on a specific date
  async addTask(userId: ObjectId, date: string, description: string) {
    const checklist = await this.userChecklist.readOne({ userId, date });
    if (!checklist) {
      throw new NotFoundError(`Checklist for userId ${userId} on ${date} not found`);
    }

    // Add the task manually to the array
    const updateTasks = [...checklist.tasks, { description, completed: false }];
    await this.userChecklist.partialUpdateOne({ userId, date }, { tasks: updateTasks });
    return { msg: "Task added successfully!" };
  }

  // Remove a task from the checklist by its index
  async removeTask(userId: ObjectId, date: string, taskIndex: number) {
    const checklist = await this.getChecklist(userId, date);

    if (taskIndex < 0 || taskIndex >= checklist.tasks.length) {
      throw new NotFoundError(`Task at index ${taskIndex} not found in the checklist`);
    }

    checklist.tasks.splice(taskIndex, 1); // Remove task at the specified index

    await this.userChecklist.replaceOne({ userId, date }, checklist);

    return { msg: "Task removed successfully!" };
  }

  // Toggle task completion status by its index
  async toggleTask(userId: ObjectId, date: string, taskIndex: number) {
    const checklist = await this.getChecklist(userId, date);

    if (taskIndex < 0 || taskIndex >= checklist.tasks.length) {
      throw new NotFoundError(`Task at index ${taskIndex} not found in the checklist`);
    }

    checklist.tasks[taskIndex].completed = !checklist.tasks[taskIndex].completed; // Toggle status

    await this.userChecklist.replaceOne({ userId, date }, checklist);

    return { msg: `Task at index ${taskIndex} completion status toggled!` };
  }
}
