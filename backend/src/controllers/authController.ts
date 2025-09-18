/**
 * Authentication controller for user registration, login, and profile management
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { UserCreate, UserLogin, AuthResponse, ApiResponse } from '../types';

export class AuthController {
  private userModel: UserModel;

  constructor(userModel: UserModel) {
    this.userModel = userModel;
  }

  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserCreate = req.body;

      // Check if user already exists
      const existingUser = await this.userModel.findByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Create new user
      const user = await this.userModel.create(userData);

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        },
        message: 'User registered successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during registration'
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: UserLogin = req.body;

      // Verify user credentials
      const user = await this.userModel.verifyPassword(loginData.email, loginData.password);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        },
        message: 'Login successful'
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during login'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const user = await this.userModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      const response: ApiResponse<typeof userWithoutPassword> = {
        success: true,
        data: userWithoutPassword,
        message: 'Profile retrieved successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while retrieving profile'
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const updates = req.body;
      
      // Don't allow updating email if it's already taken
      if (updates.email) {
        const existingUser = await this.userModel.findByEmail(updates.email);
        if (existingUser && existingUser.id !== req.user.id) {
          res.status(409).json({
            success: false,
            error: 'Email already taken by another user'
          });
          return;
        }
      }

      const updatedUser = await this.userModel.update(req.user.id, updates);
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      const response: ApiResponse<typeof userWithoutPassword> = {
        success: true,
        data: userWithoutPassword,
        message: 'Profile updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while updating profile'
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(req: Request, res: Response): Promise<void> {
    // Since we're using JWT, logout is handled client-side by removing the token
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.json(response);
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(user: any): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
  }
}