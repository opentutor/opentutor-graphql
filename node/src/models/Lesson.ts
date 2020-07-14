import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaginatedResolveResult } from './PaginatedResolveResult';
import {
  LessonExpectation,
  LessonExpectationSchema,
} from './LessonExpectation';

export interface Lesson extends Document {
  lessonId: string;
  name: string;
  intro: string;
  question: string;
  expectations: [LessonExpectation];
  conclusion: string;
}

export interface LessonModel extends Model<Lesson> {
  paginate(
    query?: any,
    options?: any,
    callback?: any
  ): Promise<PaginatedResolveResult<Lesson>>;
}

export const LessonSchema = new Schema(
  {
    lessonId: { type: String, required: '{PATH} is required!' },
    name: { type: String },
    intro: { type: String },
    question: { type: String },
    expectations: { type: [LessonExpectationSchema] },
    conclusion: { type: String },
  },
  { timestamps: true }
);
LessonSchema.plugin(require('mongoose-cursor-pagination').default);

export default mongoose.model<Lesson, LessonModel>('Lesson', LessonSchema);
