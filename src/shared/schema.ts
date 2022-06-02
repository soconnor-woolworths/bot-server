import { Schema, model } from "mongoose";

interface ILookUpUrl {
  _id: string;
  expiryDate: Date;
  updatedAt: Date;
  createdAt: Date;
}

const lookUpUrlSchema = new Schema<ILookUpUrl>(
  {
    _id: { type: String, required: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const LookUpUrl = model<ILookUpUrl>("LookupUrl", lookUpUrlSchema);
