import express from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    사용자 등록
 * @access  Public
 */
router.post('/register', userController.register.bind(userController));

/**
 * @route   POST /api/users/login
 * @desc    사용자 로그인
 * @access  Public
 */
router.post('/login', userController.login.bind(userController));

/**
 * @route   GET /api/users/profile
 * @desc    현재 사용자 프로필 조회
 * @access  Private
 */
router.get('/profile', authenticateToken, userController.getProfile.bind(userController));

/**
 * @route   PUT /api/users/profile
 * @desc    현재 사용자 프로필 업데이트
 * @access  Private
 */
router.put('/profile', authenticateToken, userController.updateProfile.bind(userController));

/**
 * @route   GET /api/users
 * @desc    모든 사용자 목록 조회 (관리자용)
 * @access  Private/Admin
 */
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers.bind(userController));

export default router;