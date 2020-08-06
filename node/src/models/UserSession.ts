/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
UserSessionSchema.index({
  _id: -1,
  sessionId: 1,
  lessonId: 1,
  username: 1,
  graderGrade: -1,
  createdAt: -1,
});
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
