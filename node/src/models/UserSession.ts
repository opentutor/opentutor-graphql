import mongoose, { Schema, Document } from 'mongoose';
import QuestionSchema, { Question } from './Question';

export interface UserSession extends Document {
  username: string;
  question: Question;
}

export const UserSessionSchema = new Schema(
  {
    username: { type: String, required: '{PATH} is required!' },
    question: { type: QuestionSchema.schema },
  },
  { timestamps: true }
);

UserSessionSchema.plugin(require('./plugins/mongoose-find-one-by-id-or-alias'));
UserSessionSchema.plugin(require('./plugins/mongoose-no-underscore-id'));
UserSessionSchema.plugin(require('mongoose-cursor-pagination').default);

export default mongoose.model<UserSession>('UserSession', UserSessionSchema);
