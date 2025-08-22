import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true, 
    maxlength: 50 
  },
  lastName: { 
    type: String, 
    required: true, 
    maxlength: 50 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  onboarding: { 
    type: Boolean, 
    default: false 
  },
  domain: { 
    type: String, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
