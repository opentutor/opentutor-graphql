import mongoose, { Schema, Document } from 'mongoose';
import { ExpectationScore, ExpectationScoreSchema } from './ExpectationScore';

export interface Response extends Document {
  text: string;
  expectationScore: ExpectationScore;
}

export const ResponseSchema = new Schema({
  text: { type: String },
  expectationScore: ExpectationScoreSchema,
});

export default mongoose.model<Response>('Response', ResponseSchema);
