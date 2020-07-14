import mongoose, { Schema, Document, Model } from 'mongoose';
import { Response, ResponseSchema } from './Response';
import { Question, QuestionSchema } from './Question';
import Session from './Session';
import calculateScore from 'models/utils/calculate-score';

export interface UserSession extends Document {
  sessionId: string;
  lessonId: string;
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
  ): Promise<UserSession>;
}

export const UserSessionSchema = new Schema(
  {
    sessionId: { type: String, required: '{PATH} is required!' },
    lessonId: { type: String },
    username: { type: String },
    score: { type: Number },
    question: { type: QuestionSchema },
    userResponses: [ResponseSchema],
  },
  { timestamps: true }
);

UserSessionSchema.statics.setGrade = async function (
  sessionId: string,
  userAnswerIndex: number,
  userExpectationIndex: number,
  grade: string
) {
  const userSession = await this.findOne({ sessionId: sessionId });
  if (!userSession) {
    throw new Error(`failed to find userSession with sessionId ${sessionId}`);
  }

  userSession.userResponses[userAnswerIndex].expectationScores[
    userExpectationIndex
  ].graderGrade = grade;

  const score = calculateScore(userSession);
  userSession.score = score;
  await Session.setGrade(sessionId, score);

  const changesAsSet: any = {};
  changesAsSet[
    `userResponses.${userAnswerIndex}.expectationScores.${userExpectationIndex}.graderGrade`
  ] = grade;
  changesAsSet['score'] = score;

  return await this.findOneAndUpdate(
    {
      sessionId: sessionId,
    },
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
