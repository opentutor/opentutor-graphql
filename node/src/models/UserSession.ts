import mongoose, { Schema, Document, Model } from 'mongoose';
import { Response, ResponseSchema } from './Response';
import { Question, QuestionSchema } from './Question';
import Session from './Session';

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
  ): Promise<UserSession>;
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

UserSessionSchema.statics.setGrade = async function (
  sessionId: string,
  userAnswerIndex: number,
  userExpectationIndex: number,
  grade: string
) {
  const userSession = await this.findOne({ sessionId: sessionId });
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

const calculateScore = (userSession: UserSession) => {
  let score = 0;
  let numExpectations = 0;

  for (let i = 0; i < userSession.userResponses.length; i++) {
    const userResponse = userSession.userResponses[i];
    numExpectations += userResponse.expectationScores.length;
    for (let j = 0; j < userResponse.expectationScores.length; j++) {
      const expectationScore = userResponse.expectationScores[j];
      if (!expectationScore.graderGrade) {
        return null;
      }
      const val =
        expectationScore.graderGrade === 'Good'
          ? 1
          : expectationScore.graderGrade === 'Neutral'
          ? 0.5
          : 0;
      score += val;
    }
  }

  return score / numExpectations;
};

export default mongoose.model<UserSession, UserSessionModel>(
  'UserSession',
  UserSessionSchema
);
