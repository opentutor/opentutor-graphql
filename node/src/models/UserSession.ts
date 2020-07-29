import mongoose, { Schema, Document, Model } from 'mongoose';
import { Response, ResponseSchema } from './Response';
import { Question, QuestionSchema } from './Question';
import { PaginatedResolveResult } from './PaginatedResolveResult';
import calculateScore from 'models/utils/calculate-score';

export interface UserSession extends Document {
  sessionId: string;
  lessonId: string;
  username: string;
  graderGrade: number;
  classifierGrade: number;
  question: Question;
  userResponses: [Response];
}

export interface UserSessionModel extends Model<UserSession> {
  paginate(
    query?: any,
    options?: any,
    callback?: any
  ): Promise<PaginatedResolveResult<UserSession>>;

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
    lessonId: { type: String, required: '{PATH} is required!' },
    username: { type: String },
    graderGrade: { type: Number },
    classifierGrade: { type: Number },
    question: { type: QuestionSchema },
    userResponses: [ResponseSchema],
  },
  { timestamps: true }
);
UserSessionSchema.plugin(require('mongoose-cursor-pagination').default);

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

  const changesAsSet: any = {};
  changesAsSet[
    `userResponses.${userAnswerIndex}.expectationScores.${userExpectationIndex}.graderGrade`
  ] = grade;
  changesAsSet['graderGrade'] = score;

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
