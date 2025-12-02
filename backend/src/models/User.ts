import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
  githubRaw?: unknown;

  // Processed analysis snapshot
  analysis?: unknown;

  aiInsights?: {
    roadmap: string[];
    skillGaps: string[];
    recommendedSkills: string[];
    readinessScore: number;
    updatedAt: Date;
    role?: string;
    seniorFeedback?: string;
  };

  leetcodeUsername?: string;
  leetcodeRaw?: unknown;

  linkedinSkillsRaw?: unknown;
  linkedinSkills?: string[];

  // Sync timestamps for cron jobs
  lastSyncedAt?: Date;
  lastAISyncAt?: Date;
  lastCompanyMatchSyncAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, index: true },
    githubId: { type: String, index: true },
    githubUsername: { type: String },
    githubAccessToken: { type: String },
    githubRaw: { type: Schema.Types.Mixed },

    analysis: { type: Schema.Types.Mixed },
    aiInsights: { type: Schema.Types.Mixed },

    leetcodeUsername: { type: String },
    leetcodeRaw: { type: Schema.Types.Mixed },

    linkedinSkillsRaw: { type: Schema.Types.Mixed },
    linkedinSkills: [{ type: String }],

    lastSyncedAt: { type: Date },
    lastAISyncAt: { type: Date },
    lastCompanyMatchSyncAt: { type: Date }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);


