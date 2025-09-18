/**
 * Authentication routes
 */

import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserModel } from '../models/User';
import { Database } from '../models/Database';
import { authenticateToken } from '../middleware/auth';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';

const router = Router();
const database = new Database();
const userModel = new UserModel(database);
const authController = new AuthController(userModel);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateUserRegistration, (req, res) => {
  authController.register(req, res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateUserLogin, (req, res) => {
  authController.login(req, res);
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, (req, res) => {
  authController.getProfile(req, res);
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, (req, res) => {
  authController.updateProfile(req, res);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, (req, res) => {
  authController.logout(req, res);
});

export default router;