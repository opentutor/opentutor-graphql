import mongoose, { Schema, Document } from 'mongoose';
import { Expectation, ExpectationSchema } from './Expectation';

export interface Question extends Document {
  text: string;
  expectations: [Expectation];
}

export const QuestionSchema = new Schema({
  text: { type: String },
  expectations: [ExpectationSchema],
});

export default mongoose.model<Question>('Question', QuestionSchema);
