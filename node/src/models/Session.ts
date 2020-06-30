import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaginatedResolveResult } from './PaginatedResolveResult';

export interface Session extends Document {
  sessionId: string;
  classifierGrade: number;
  grade: number;
}

export interface SessionModel extends Model<Session> {
  paginate(
    query?: any,
    options?: any,
    callback?: any
  ): Promise<PaginatedResolveResult<Session>>;
}

export const SessionSchema = new Schema(
  {
    sessionId: { type: String, required: '{PATH} is required!' },
    classifierGrade: { type: Number },
    grade: { type: Number },
  },
  { timestamps: true }
);

SessionSchema.plugin(require('mongoose-cursor-pagination').default);

export default mongoose.model<Session, SessionModel>('Session', SessionSchema);
