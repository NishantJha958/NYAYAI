import mongoose from 'mongoose';

const legalDraftSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grievance',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    simplifiedContent: {
      type: String,
      default: '',
    },
    statutes: {
      type: [
        {
          act: String,
          section: String,
          title: String,
          relevance: String,
          source: String,
        },
      ],
      default: [],
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
  },
  { timestamps: true }
);

export default mongoose.model('LegalDraft', legalDraftSchema);
