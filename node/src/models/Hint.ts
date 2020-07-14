import mongoose, { Schema, Document } from 'mongoose';

export interface Hint extends Document {
  text: string;
}

export const HintSchema = new Schema({
  text: { type: String },
});

export default mongoose.model<Hint>('Hint', HintSchema);
