import mongoose, { Schema, Document } from 'mongoose';

export interface Question extends Document {
  text: string;
}

export const QuestionSchema = new Schema({
  text: { type: String, required: '{PATH} is required!' },
});

export default mongoose.model<Question>('Question', QuestionSchema);
