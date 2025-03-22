import mongoose, { Document, Schema } from 'mongoose';

export interface ILanguage extends Document {
  name: string;
  createdAt: Date;
}

const LanguageSchema = new Schema<ILanguage>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILanguage>('Language', LanguageSchema);
