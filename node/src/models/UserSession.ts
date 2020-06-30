import mongoose, { Schema, Document, Model } from 'mongoose';
import { Question, QuestionSchema } from './Question';
import { Response, ResponseSchema } from './Response';

export interface UserSession extends Document {
  sessionId: string;
  username: string;
  score: number;
  question: Question;
  userResponses: [Response];
}

export interface UserSessionModel extends Model<UserSession> {
  setGrade(
    sessionId: string,
    userAnswerIndex: number,
    userExpectationIndex: number,
    grade: string
  ): Promise<UserSessionModel>;
}

export const UserSessionSchema = new Schema(
  {
    sessionId: { type: String, required: '{PATH} is required!' },
    username: { type: String },
    score: { type: Number },
    question: { type: QuestionSchema },
    userResponses: [ResponseSchema],
  },
  { timestamps: true }
);

UserSessionSchema.statics.setGrade = async function(
  sessionId: string,
  userAnswerIndex: number,
  userExpectationIndex: number,
  grade: string
) {
  const changesAsSet: any = {};
  changesAsSet[
    `userResponses.${userAnswerIndex}.expectationScores.${userExpectationIndex}.graderGrade`
  ] = grade;
  return await this.findOneAndUpdate(
    sessionId,
    {
      $set: changesAsSet,
    },
    {
      new: true,
    }
  );
};

export default mongoose.model<UserSession, UserSessionModel>(
  'UserSession',
  UserSessionSchema
);
