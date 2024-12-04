import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface ChecklistItem {
  text: string;
  checked: boolean;
  lastChecked: Date | null;
}

export interface ChecklistDoc extends BaseDoc {
  author: ObjectId;
  dateOfChecklist: Date;
  items: ChecklistItem[];
}

export default class ChecklistConcept {
  private static instance: ChecklistConcept;
  public readonly checklists: DocCollection<ChecklistDoc>;

  /**
   * Make an instance of Checklist.
   */
  constructor(collectionName: string) {
    this.checklists = new DocCollection<ChecklistDoc>(collectionName);
  }

  static getInstance(): ChecklistConcept {
    if (!ChecklistConcept.instance) {
      ChecklistConcept.instance = new ChecklistConcept("checklists");
    }
    return ChecklistConcept.instance;
  }

  /**
   * Create a new checklist entry (by author, for date DateOfChecklist)
   */
  async create(author: ObjectId, dateOfChecklist: Date, items: ChecklistItem[]) {
    const _id = await this.checklists.createOne({ author, dateOfChecklist, items });
    return { msg: "Checklist successfully created!", checklist: await this.checklists.readOne({ _id }) };
  }

  /**
   * Remove a specific checklist entry by its id
   */
  async delete(_id: ObjectId) {
    await this.checklists.deleteOne({ _id });
    return { msg: "Checklist deleted successfully!" };
  }

  /**
   * Add a new item to a user's checklist
   */
  async addItem(_id: ObjectId, text: string) {
    const checklist = await this.checklists.readOne({ _id });
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    const newItem: ChecklistItem = { text, checked: false, lastChecked: null };
    checklist.items.push(newItem);
    await this.checklists.partialUpdateOne({ _id }, { items: checklist.items });

    return { msg: "Item added successfully!", checklist };
  }

  /**
   * Remove an item from the checklist by its index
   */
  async removeItem(_id: ObjectId, itemIndex: number) {
    const checklist = await this.checklists.readOne({ _id });
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    if (itemIndex < 0 || itemIndex >= checklist.items.length) {
      throw new Error("Item index is out of bounds");
    }

    checklist.items.splice(itemIndex, 1);
    await this.checklists.partialUpdateOne({ _id }, { items: checklist.items });

    return { msg: "Item removed successfully!", checklist };
  }

  /**
   * Cross off an item (mark it as checked) and update the last checked time
   */
  async checkOffItem(_id: ObjectId, itemIndex: number) {
    const checklist = await this.checklists.readOne({ _id });
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    if (itemIndex < 0 || itemIndex >= checklist.items.length) {
      throw new Error("Item index is out of bounds");
    }

    const item = checklist.items[itemIndex];
    item.checked = true;
    item.lastChecked = new Date(); // Set last checked date to now
    await this.checklists.partialUpdateOne({ _id }, { items: checklist.items });

    return { msg: "Item checked off successfully!", checklist };
  }

  /**
   * Uncheck an item (mark it as unchecked) and reset the last checked time
   */
  async uncheckItem(_id: ObjectId, itemIndex: number) {
    const checklist = await this.checklists.readOne({ _id });
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    if (itemIndex < 0 || itemIndex >= checklist.items.length) {
      throw new Error("Item index is out of bounds");
    }

    const item = checklist.items[itemIndex];
    item.checked = false;
    item.lastChecked = null; // Reset last checked date
    await this.checklists.partialUpdateOne({ _id }, { items: checklist.items });

    return { msg: "Item unchecked successfully!", checklist };
  }

  /**
   * Fetch a checklist by author and date (useful to refresh data for a new day)
   */
  async getChecklistByDate(author: ObjectId, date: Date) {
    const checklist = await this.checklists.readOne({ author, dateOfChecklist: date });
    if (checklist === null) {
      return { msg: "Checklist not found" };
    }
    return { msg: "Successfully retrieved checklist!", checklist };
  }

  /**
   * Fetch all checklists for a specific user
   */
  async getChecklistsByUser(author: ObjectId) {
    return await this.checklists.readMany({ author });
  }

  /**
   * Update an existing checklist (change items or date)
   */
  async updateChecklist(_id: ObjectId, items: ChecklistItem[], dateOfChecklist: Date) {
    const checklist = await this.checklists.readOne({ _id });
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    const updatedChecklist = {
      ...checklist,
      items,
      dateOfChecklist,
    };

    await this.checklists.partialUpdateOne({ _id }, updatedChecklist);
    return { msg: "Checklist updated successfully!", checklist: updatedChecklist };
  }
}
