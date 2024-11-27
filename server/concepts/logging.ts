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

export interface CycleStats {
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  commonSymptoms: { symptom: Symptom; frequency: number }[];
  commonMoods: { mood: Mood; frequency: number }[];
  regularityScore: number; // 0-100%
  lastPeriodStart: Date | null;
  predictedNextPeriod: Date | null;
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

  async calculateCycleStats(author: ObjectId): Promise<CycleStats> {
    // Get all logs for user, sorted by date
    const logs = await this.logs.readMany(
      { author },
      { sort: { dateOfLog: 1 } }
    );

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
      log.symptoms.forEach(symptom => {
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
        const periodLength = Math.ceil(
          (lastPeriodEnd.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        periodLengths.push(periodLength);
        currentPeriodStart = null;
      }
    }

    // Calculate cycle lengths
    for (let i = 1; i < periodStarts.length; i++) {
      const cycleLength = Math.ceil(
        (periodStarts[i].getTime() - periodStarts[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(cycleLength);
    }

    // Calculate averages
    const avgCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : null;

    const avgPeriodLength = periodLengths.length > 0
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : null;

    // Calculate regularity score (based on cycle length consistency)
    const regularityScore = cycleLengths.length > 1
      ? this.calculateRegularityScore(cycleLengths)
      : 0;

    // Predict next period
    const lastPeriodStart = periodStarts[periodStarts.length - 1] || null;
    const predictedNextPeriod = lastPeriodStart && avgCycleLength
      ? new Date(lastPeriodStart.getTime() + avgCycleLength * 24 * 60 * 60 * 1000)
      : null;

    return {
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
      commonSymptoms: this.sortByFrequency(symptomFrequency).map(({item, frequency}) => ({symptom: item, frequency})),
      commonMoods: this.sortByFrequency(moodFrequency).map(({item, frequency}) => ({mood: item, frequency})),
      regularityScore,
      lastPeriodStart,
      predictedNextPeriod
    };
  }

  private calculateRegularityScore(cycleLengths: number[]): number {
    const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);
    // Higher score for lower standard deviation (more regular cycles)
    const score = Math.max(0, 100 - (stdDev * 5));
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
      { sort: { dateOfLog: -1 } }  // Most recent first
    );
    return logs;
  }
}
