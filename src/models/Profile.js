import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  taxId: {
    type: String,
    required: true,
  },
  filingStatus: {
    type: String,
    required: true,
    enum: ['single', 'married', 'head', 'separate'],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile; 