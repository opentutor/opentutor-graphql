import mongoose, { Schema, Document } from 'mongoose';

export interface ExpectationScore extends Document {
  classifierGrade: string;
  graderGrade: string;
}

export const ExpectationScoreSchema = new Schema({
  classifierGrade: { type: String },
  graderGrade: { type: String },
});

export default mongoose.model<ExpectationScore>(
  'ExpectationScore',
  ExpectationScoreSchema
);
