import mongoose, { Schema, Document } from 'mongoose';

export interface Expectation extends Document {
  text: string;
}

export const ExpectationSchema = new Schema({
  text: { type: String },
});

export default mongoose.model<Expectation>('Expectation', ExpectationSchema);
