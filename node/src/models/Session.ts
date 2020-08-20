/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaginatedResolveResult } from './PaginatedResolveResult';
import LessonSchema, { Lesson } from './Lesson';
import calculateScore from 'models/utils/calculate-score';

interface Expectation extends Document {
  text: string;
}

const ExpectationSchema = new Schema({
  text: { type: String },
});

interface Question extends Document {
  text: string;
  expectations: [Expectation];
}

const QuestionSchema = new Schema({
  text: { type: String },
  expectations: [ExpectationSchema],
});

interface ExpectationScore extends Document {
  classifierGrade: string;
  graderGrade: string;
}

const ExpectationScoreSchema = new Schema({
  classifierGrade: {
    type: String,
    enum: ['Good', 'Bad', 'Neutral'],
    default: 'Neutral',
  },
  graderGrade: {
    type: String,
    enum: ['Good', 'Bad', 'Neutral', null],
    default: null,
  },
});

interface Response extends Document {
  text: string;
  expectationScores: [ExpectationScore];
}

const ResponseSchema = new Schema({
  text: { type: String },
  expectationScores: [ExpectationScoreSchema],
});

export interface Session extends Document {
  sessionId: string;
  lessonId: string;
  lessonName: string;
  lessonCreatedBy: string;
  username: string;
  graderGrade: number;
  classifierGrade: number;
  question: Question;
  userResponses: [Response];
}

export const SessionSchema = new Schema(
  {
    sessionId: { type: String, required: '{PATH} is required!' },
    lessonId: { type: String, required: '{PATH} is required!' },
    lessonName: { type: String },
    lessonCreatedBy: { type: String },
    username: { type: String },
    graderGrade: { type: Number },
    classifierGrade: { type: Number },
    question: { type: QuestionSchema },
    userResponses: [ResponseSchema],
  },
  { timestamps: true }
);

export interface SessionModel extends Model<Session> {
  paginate(
    query?: any,
    options?: any,
    callback?: any
  ): Promise<PaginatedResolveResult<Session>>;

  getTrainingData(lessonId: string): any;

  updateLesson(lessonId: string, updatedLesson: Lesson): void;

  setGrade(
    sessionId: string,
    userAnswerIndex: number,
    userExpectationIndex: number,
    grade: string
  ): Promise<Session>;
}

SessionSchema.index({
  lessonName: -1,
  lessonCreatedBy: -1,
  createdAt: -1,
  classifierGrade: -1,
  graderGrade: -1,
  _id: -1,
});
SessionSchema.plugin(require('mongo-cursor-pagination').mongoosePlugin);

SessionSchema.statics.getTrainingData = async function (lessonId: string) {
  const lesson: Lesson = await LessonSchema.findOne({ lessonId });
  const sessions = await this.find({ lessonId });
  const data: any = {};
  for (let i = 0; i < lesson.expectations.length; i++) {
    data[i] = { Good: 0, Bad: 0, Neutral: 0, total: 0 };
  }

  // CSV of data to be used by classifier training
  let csv = 'exp_num,text,label';
  sessions.forEach((session: Session) => {
    session.userResponses.forEach((response: Response) => {
      for (let i = 0; i < response.expectationScores.length; i++) {
        const grade = response.expectationScores[i].graderGrade;
        if (grade) {
          data[i].total += 1;
          data[i][grade] += 1;
          // Classifier cannot use Neutral data
          if (grade !== 'Neutral') {
            const text = response.text.replace(/"/g, '""');
            csv += `\n${i},"${text}",${grade}`;
          }
        }
      }
    });
  });

  // Does the lesson have enough data for training, based on these requirements:
  //   * At least 10 graded answers per expectation
  //   * At least 2 Good and 2 Bad answers per expectation
  let isTrainable = true;
  for (let i = 0; i < lesson.expectations.length; i++) {
    if (data[i].total < 10) {
      isTrainable = false;
      break;
    }
    if (data[i].Good < 2 || data[i].Bad < 2) {
      isTrainable = false;
      break;
    }
  }

  return { data, csv, isTrainable };
};

SessionSchema.statics.updateLesson = async function (
  lessonId: string,
  updatedLesson: Lesson
) {
  await this.updateMany(
    {
      lessonId: lessonId,
    },
    {
      $set: {
        lessonId: updatedLesson.lessonId,
        lessonName: updatedLesson.name,
        lessonCreatedBy: updatedLesson.createdBy,
      },
    }
  );
};

SessionSchema.statics.setGrade = async function (
  sessionId: string,
  userAnswerIndex: number,
  userExpectationIndex: number,
  grade: string
) {
  const session = await this.findOne({ sessionId: sessionId });
  if (!session) {
    throw new Error(`failed to find session with sessionId ${sessionId}`);
  }

  session.userResponses[userAnswerIndex].expectationScores[
    userExpectationIndex
  ].graderGrade = grade;

  const score = calculateScore(session);
  session.score = score;

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

export default mongoose.model<Session, SessionModel>('Session', SessionSchema);
