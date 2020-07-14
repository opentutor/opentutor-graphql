import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaginatedResolveResult } from './PaginatedResolveResult';

export interface Session extends Document {
  sessionId: string;
  lessonId: string;
  username: string;
  classifierGrade: number;
  grade: number;
}

export interface SessionModel extends Model<Session> {
  paginate(
    query?: any,
    options?: any,
    callback?: any
  ): Promise<PaginatedResolveResult<Session>>;

  setGrade(sessionId: string, grade: number): Promise<Session>;
}

export const SessionSchema = new Schema(
  {
    sessionId: { type: String, required: '{PATH} is required!' },
    lessonId: { type: String },
    username: { type: String },
    classifierGrade: { type: Number },
    grade: { type: Number },
  },
  { timestamps: true }
);
SessionSchema.plugin(require('mongoose-cursor-pagination').default);

SessionSchema.statics.setGrade = async function (
  sessionId: string,
  grade: number
) {
  return await this.findOneAndUpdate(
    {
      sessionId: sessionId,
    },
    {
      $set: {
        grade: grade,
      },
    },
    {
      new: true,
    }
  );
};

export default mongoose.model<Session, SessionModel>('Session', SessionSchema);
