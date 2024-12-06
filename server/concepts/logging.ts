import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

// export enum Symptom {
// Headache, Fatigue, Cramps, Acne, Constipation, Nausea, Bloating, Chills, Diarrhea, MoodSwings, DrySkin
// }

// export enum Mood {
//     Angry, Happy, Calm, Confused, Sad
// }

export enum Symptom {
  AbdominalCramps = "Abdominal Cramps",
  Headache = "Headache",
  Acne = "Acne",
  Fatigue = "Fatigue",
  Constipation = "Constipation",
  Diarrhea = "Diarrhea",
  Nausea = "Nausea",
  Bloating = "Bloating",
  Chills = "Chills",
  MoodSwings = "Mood swings",
  DrySkin = "Dry skin",
}

export enum Mood {
  Angry = "Angry",
  Happy = "Happy",
  Calm = "Calm",
  Sad = "Sad",
  Confused = "Confused",
}

export enum FlowIntensity {
  Light = "Light",
  Medium = "Medium",
  Heavy = "Heavy",
}

export interface ExerciseLog {
  activity: string; // Type of exercise
  duration: number; // Duration in minutes
  intensity: string; // Exercise intensity (e.g., "Low", "Medium", "High")
}

export interface LoggingDoc extends BaseDoc {
  author: ObjectId;
  dateOfLog: Date;
  symptoms: Symptom[];
  mood: Mood | null;
  flow: FlowIntensity | null;
  notes: string;
  exercises: ExerciseLog[];
}

export interface CycleStats {
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  commonSymptoms: { symptom: Symptom; frequency: number }[];
  commonMoods: { mood: Mood; frequency: number }[];
  regularityScore: number; // 0-100%
  lastPeriodStart: Date | null;
  predictedNextPeriod: Date | null;
}

export interface WeightLog {
  _id: ObjectId;
  userId: ObjectId;
  weight: number;
  date: Date;
}

export default class LoggingConcept {
  private static instance: LoggingConcept;
  public readonly logs: DocCollection<LoggingDoc>;

  /**
   * Make an instance of Logging.
   */
  constructor(collectionName: string) {
    this.logs = new DocCollection<LoggingDoc>(collectionName);
  }

  static getInstance(): LoggingConcept {
    if (!LoggingConcept.instance) {
      LoggingConcept.instance = new LoggingConcept("logs");
    }
    return LoggingConcept.instance;
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

  async update(_id: ObjectId, symptoms: Symptom[], mood: Mood | null, flow: FlowIntensity | null, notes: string) {
    const log = await this.logs.readOne({ _id });
    if (!log) {
      throw new Error("Log not found");
    }
    const id = await this.logs.partialUpdateOne({ _id }, { symptoms, mood, flow, notes });
    return { msg: "Log updated successfully!", log: await this.logs.readOne({ _id: id }) };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const log = await this.logs.readOne({ _id });
    if (!log) {
      throw new Error("Log not found");
    } else if (log.author.toString() !== user.toString()) {
      throw new Error("User is not the author of this log");
    }
  }

  async getLogByDate(author: ObjectId, date: Date) {
    const log = await this.logs.readOne({ author, dateOfLog: date });
    if (log === null) {
      // return { msg: "Log not found" };
      return;
    }
    return {  log };
  }

  async getLogs() {
    return await this.logs.readMany({});
  }

  async deleteAllLogs() {
    return await this.logs.deleteMany({});
  }

  async calculateCycleStats(author: ObjectId): Promise<CycleStats> {
    // Get all logs for user, sorted by date
    const logs = await this.logs.readMany({ author }, { sort: { dateOfLog: 1 } });

    // Find period start dates (days with flow logged)
    const periodStarts: Date[] = [];
    let currentPeriodStart: Date | null = null;
    let lastPeriodEnd: Date | null = null;
    const cycleLengths: number[] = [];
    const periodLengths: number[] = [];

    // Track symptoms and moods
    const symptomFrequency: Map<Symptom, number> = new Map();
    const moodFrequency: Map<Mood, number> = new Map();

    for (const log of logs) {
      // Track symptom frequencies
      log.symptoms.forEach((symptom) => {
        symptomFrequency.set(symptom, (symptomFrequency.get(symptom) || 0) + 1);
      });

      // Track mood frequencies
      if (log.mood !== null) {
        moodFrequency.set(log.mood, (moodFrequency.get(log.mood) || 0) + 1);
      }

      // Period tracking logic
      if (log.flow !== null) {
        if (currentPeriodStart === null) {
          currentPeriodStart = log.dateOfLog;
          periodStarts.push(log.dateOfLog);
        }
        lastPeriodEnd = log.dateOfLog;
      } else if (currentPeriodStart !== null && lastPeriodEnd !== null) {
        // Period ended
        const periodLength = Math.ceil((lastPeriodEnd.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
        periodLengths.push(periodLength);
        currentPeriodStart = null;
      }
    }

    // Calculate cycle lengths
    for (let i = 1; i < periodStarts.length; i++) {
      const cycleLength = Math.ceil((periodStarts[i].getTime() - periodStarts[i - 1].getTime()) / (1000 * 60 * 60 * 24));
      cycleLengths.push(cycleLength);
    }

    // Calculate averages
    const avgCycleLength = cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : null;

    const avgPeriodLength = periodLengths.length > 0 ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) : null;

    // Calculate regularity score (based on cycle length consistency)
    const regularityScore = cycleLengths.length > 1 ? this.calculateRegularityScore(cycleLengths) : 0;

    // Predict next period
    const lastPeriodStart = periodStarts[periodStarts.length - 1] || null;
    const predictedNextPeriod = lastPeriodStart && avgCycleLength ? new Date(lastPeriodStart.getTime() + avgCycleLength * 24 * 60 * 60 * 1000) : null;

    return {
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
      commonSymptoms: this.sortByFrequency(symptomFrequency).map(({ item, frequency }) => ({ symptom: item, frequency })),
      commonMoods: this.sortByFrequency(moodFrequency).map(({ item, frequency }) => ({ mood: item, frequency })),
      regularityScore,
      lastPeriodStart,
      predictedNextPeriod,
    };
  }

  // Method to create a new log with exercises
  async createExerciseLog(
    author: ObjectId,
    dateOfLog: Date,
    symptoms: Symptom[],
    mood: Mood | null,
    flow: FlowIntensity | null,
    notes: string,
    exercises: ExerciseLog[], // New exercise log data
  ) {
    const _id = await this.logs.createOne({
      author,
      dateOfLog,
      symptoms,
      mood,
      flow,
      notes,
      exercises, // Saving exercise log data
    });
    return { msg: "Log successfully created with exercise data!", log: await this.logs.readOne({ _id }) };
  }

  // Method to add an exercise entry to an existing log
  async addExerciseToLog(_id: ObjectId, exercise: ExerciseLog) {
    const log = await this.logs.readOne({ _id });
    if (!log) {
      throw new Error("Log not found");
    }

    log.exercises.push(exercise); // Add new exercise to the exercises array
    await this.logs.partialUpdateOne({ _id }, { exercises: log.exercises });
    return { msg: "Exercise added successfully!", log: await this.logs.readOne({ _id }) };
  }

  // Get exercise logs for a specific date
  async getExerciseLogs(author: ObjectId, date: Date) {
    const log = await this.logs.readOne({ author, dateOfLog: date });
    if (log === null) {
      return { msg: "Log not found" };
    }
    return { msg: "Successfully retrieved exercise logs!", exercises: log.exercises };
  }

  private calculateRegularityScore(cycleLengths: number[]): number {
    const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);
    // Higher score for lower standard deviation (more regular cycles)
    const score = Math.max(0, 100 - stdDev * 5);
    return Math.round(score);
  }

  private sortByFrequency<T>(frequencyMap: Map<T, number>): { item: T; frequency: number }[] {
    return Array.from(frequencyMap.entries())
      .map(([item, freq]) => ({ item, frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  async getLogsForExport(author: ObjectId) {
    const logs = await this.logs.readMany(
      { author },
      { sort: { dateOfLog: -1 } }, // Most recent first
    );
    return logs;
  }

  // async logWeight(userId: ObjectId, weight: number) {
  //   const weightValidation = this.validateWeight(weight);
  //   if (weightValidation.error) {
  //     throw new Error(weightValidation.error);
  //   }

  //   const log = await this.logs.createOne({
  //     userId,
  //     weight,
  //     date: new Date(),
  //   });
  //   return { msg: "Weight logged successfully!", log };
  // }

  // async getWeightHistory(userId: ObjectId) {
  //   const weights = await this.logs
  //     .find({ userId, weight: { $exists: true } })
  //     .sort({ date: -1 })
  //     .toArray();
  //   return weights;
  // }

  // private validateWeight(weight: number) {
  //   if (typeof weight !== "number") {
  //     return { error: "Weight must be a number" };
  //   }
  //   if (weight <= 0) {
  //     return { error: "Weight must be greater than 0" };
  //   }
  //   if (weight > 500) {
  //     return { error: "Weight seems unrealistic" };
  //   }
  //   return { error: null };
  // }
}
