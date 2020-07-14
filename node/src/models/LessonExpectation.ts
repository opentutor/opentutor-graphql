import mongoose, { Schema, Document } from 'mongoose';
import { Hint, HintSchema } from './Hint';

export interface LessonExpectation extends Document {
  expectation: string;
  hints: [Hint];
}

export const LessonExpectationSchema = new Schema({
  expectation: { type: String },
  hints: { type: [HintSchema] },
});

export default mongoose.model<LessonExpectation>(
  'LessonExpectation',
  LessonExpectationSchema
);
