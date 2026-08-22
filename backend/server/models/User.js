import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    preferredLang: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    age: { type: Number, min: 1, max: 120 },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
    profession: { type: String, default: '' },
    incomeBracket: {
      type: String,
      enum: ['Prefer not to say', 'Below ₹1 Lakh (BPL / EWS)', '₹1 Lakh - ₹3 Lakhs', '₹3 Lakhs - ₹8 Lakhs', 'Above ₹8 Lakhs'],
      default: 'Prefer not to say'
    },
    socialCategory: {
      type: String,
      enum: ['Prefer not to say', 'General', 'SC', 'ST', 'OBC', 'Women / Child', 'Person with Disability (PwD)'],
      default: 'Prefer not to say'
    }
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    preferredLang: this.preferredLang,
    state: this.state,
    city: this.city,
    age: this.age,
    gender: this.gender,
    profession: this.profession,
    incomeBracket: this.incomeBracket,
    socialCategory: this.socialCategory,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('User', userSchema);
