import bcrypt from 'bcryptjs';
import User from '../models/User';

export class UserService {
  // Create new user
  static async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }]
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new Error('Email already exists');
        }
        if (existingUser.phone === userData.phone) {
          throw new Error('Phone number already exists');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
      });

      await user.save();

      // Return user without password
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email }).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update onboarding data by ID
  static async updateOnboarding(
    userId: string, 
    data: { domain?: string }
  ) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update fields
      if (data.domain !== undefined) {
        user.domain = data.domain;
        user.onboarding = true;
      }

      await user.save();

      // Return updated user without password
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Update onboarding data by email
  static async updateOnboardingByEmail(
    email: string, 
    data: { domain?: string }
  ) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      // Update fields
      if (data.domain !== undefined) {
        user.domain = data.domain;
        user.onboarding = true;
      }

      await user.save();

      // Return updated user without password
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }
}
