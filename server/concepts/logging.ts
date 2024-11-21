import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export enum Symptom {
Headache, Fatigue, Cramps, Acne, Constipation, Nausea, Bloating, Chills, Diarrhea, MoodSwings, DrySkin
}

export enum Mood {
    Angry, Happy, Calm, Confused, Sad
}

export enum FlowIntensity {
    Light, Medium, Heavy
}

export interface LoggingDoc extends BaseDoc {
  author: ObjectId;
  dateOfLog: Date;
  symptoms: Symptom[];
  mood: Mood | null;
  flow: FlowIntensity | null;
  notes: string;
}


export default class LoggingConcept {
  public readonly logs: DocCollection<LoggingDoc>;

  /**
   * Make an instance of Logging.
   */
  constructor(collectionName: string) {
    this.logs = new DocCollection<LoggingDoc>(collectionName);
  }

  /**
   * Create a new logged entry (by author, for date DateOfLog)
   */
  async create(author: ObjectId, dateOfLog: Date, symptoms: Symptom[], mood: Mood | null, flow: FlowIntensity | null, notes: string) {
    const _id = await this.logs.createOne({ author, dateOfLog, symptoms, mood, flow, notes });
    return { msg: "Log successfully created!", log: await this.logs.readOne({ _id }) };
  }

  /**
   * Remove a specific daily log by its id
   */
  async delete(_id: ObjectId) {
    await this.logs.deleteOne({ _id });
    return { msg: "Log deleted successfully!" };
  }

}

