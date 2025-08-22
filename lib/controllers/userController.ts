import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../services/userService';
import dbConnect from '../db';

export class UserController {
  // Get user profile by ID
  static async getUserProfile(userId: string) {
    try {
      await dbConnect();
      
      const user = await UserService.getUserById(userId);
      return NextResponse.json(user);
    } catch (error: any) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch user data' },
        { status: 404 }
      );
    }
  }

  // Get user profile by email
  static async getUserProfileByEmail(email: string) {
    try {
      await dbConnect();
      
      const user = await UserService.getUserByEmail(email);
      return NextResponse.json(user);
    } catch (error: any) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch user data' },
        { status: 404 }
      );
    }
  }

  // Update onboarding data by ID or email
  static async updateOnboarding(request: NextRequest) {
    try {
      await dbConnect();
      
      const body = await request.json();
      const { userId, email, domain, onboardingData, isComplete = false } = body;

      if (!userId && !email) {
        return NextResponse.json(
          { error: 'User ID or email is required' },
          { status: 400 }
        );
      }

      let user;
      if (email) {
        // Use email-based update
        user = await UserService.updateOnboardingByEmail(email, {
          domain,
          onboardingData,
          isComplete,
        });
      } else {
        // Use ID-based update (for backward compatibility)
        user = await UserService.updateOnboarding(userId, {
          domain,
          onboardingData,
          isComplete,
        });
      }

      return NextResponse.json({
        success: true,
        message: isComplete ? 'Onboarding completed successfully' : 'Progress saved successfully',
        user,
      });
    } catch (error: any) {
      console.error('Onboarding update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update onboarding data' },
        { status: 500 }
      );
    }
  }

  // Update onboarding data by email
  static async updateOnboardingByEmail(request: NextRequest) {
    try {
      await dbConnect();
      
      const body = await request.json();
      const { email, domain, onboardingData, isComplete = false } = body;

      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      const user = await UserService.updateOnboardingByEmail(email, {
        domain,
        onboardingData,
        isComplete,
      });

      return NextResponse.json({
        success: true,
        message: isComplete ? 'Onboarding completed successfully' : 'Progress saved successfully',
        user,
      });
    } catch (error: any) {
      console.error('Onboarding update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update onboarding data' },
        { status: 500 }
      );
    }
  }
}
