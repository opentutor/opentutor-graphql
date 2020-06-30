import mongoose, { Schema, Document, Model } from 'mongoose';
import { Question, QuestionSchema } from './Question';
import { Response, ResponseSchema } from './Response';

export interface UserSession extends Document {
  sessionId: string;
  username: string;
  question: Question;
  userResponses: [Response];
}

export interface UserSessionModel extends Model<UserSession> {
  setGrade(
    sessionId: string,
    userAnswerIndex: number,
    grade: string
  ): Promise<UserSessionModel>;
}

export const UserSessionSchema = new Schema(
  {
    sessionId: { type: String, required: '{PATH} is required!' },
    username: { type: String },
    question: { type: QuestionSchema },
    userResponses: [ResponseSchema],
  },
  { timestamps: true }
);

UserSessionSchema.statics.setGrade = async function(
  sessionId: string,
  userAnswerIndex: number,
  grade: string
) {
  const userSessionModel = this;
  const changesAsSet: any = {};
  changesAsSet[
    `userResponses.${userAnswerIndex}.expectationScore.graderGrade`
  ] = grade;
  return await userSessionModel.findOneAndUpdate(
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
