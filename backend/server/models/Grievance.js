import mongoose from 'mongoose';

const statuteSchema = new mongoose.Schema(
  {
    act: { type: String, required: true },
    section: { type: String, required: true },
    title: { type: String, default: '' },
    relevance: { type: String, default: '' },
    source: { type: String, default: '' },
  },
  { _id: false }
);

const grievanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plainText: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Property / Rent',
        'Consumer',
        'Police / Criminal',
        'RTI',
        'Employment',
        'Government Services',
        'Family',
        'Other',
      ],
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    additionalDetails: {
      type: String,
      default: '',
    },
    legalDraft: {
      type: String,
      default: '',
    },
    simplifiedExplanation: {
      type: String,
      default: '',
    },
    statutes: {
      type: [statuteSchema],
      default: [],
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Grievance', grievanceSchema);
