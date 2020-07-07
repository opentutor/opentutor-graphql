import mongoose, { Schema, Document } from 'mongoose';

export interface ExpectationScore extends Document {
  classifierGrade: string;
  graderGrade: string;
}

export const ExpectationScoreSchema = new Schema({
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

export default mongoose.model<ExpectationScore>(
  'ExpectationScore',
  ExpectationScoreSchema
);
