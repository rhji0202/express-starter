import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { generateToken } from '../utils/hash.util';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * 사용자 컨트롤러 클래스
 * HTTP 요청을 처리하고 적절한 응답을 반환
 */
export class UserController {
  /**
   * 사용자 등록
   * @param req HTTP 요청 객체
   * @param res HTTP 응답 객체
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // 필수 필드 검증
      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          message: 'Email, password, and name are required'
        });
        return;
      }

      // 사용자 등록
      const user = await userService.register({ email, password, name });

      // JWT 토큰 생성
      const token = generateToken({
        id: user.id!,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id!,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Email already registered') {
          res.status(409).json({
            success: false,
            message: error.message
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }
    }
  }

  /**
   * 사용자 로그인
   * @param req HTTP 요청 객체
   * @param res HTTP 응답 객체
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 필수 필드 검증
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // 로그인 처리
      const user = await userService.login(email, password);

      // JWT 토큰 생성
      const token = generateToken({
        id: user.id!,
        email: user.email,
        role: user.role
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id!,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Invalid email or password' ||
          error.message === 'Account is deactivated'
        ) {
          res.status(401).json({
            success: false,
            message: error.message
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Internal server error'
          });
        }
      }
    }
  }

  /**
   * 사용자 프로필 조회
   * @param req 인증된 HTTP 요청 객체
   * @param res HTTP 응답 객체
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const user = await userService.getProfile(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id!,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * 모든 사용자 목록 조회 (관리자용)
   * @param req HTTP 요청 객체
   * @param res HTTP 응답 객체
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await userService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        data: {
          users: result.users,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: result.pages
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * 사용자 프로필 업데이트
   * @param req 인증된 HTTP 요청 객체
   * @param res HTTP 응답 객체
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { name } = req.body;

      const updatedUser = await userService.updateProfile(userId, { name });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id!,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// 컨트롤러 인스턴스 생성
export const userController = new UserController();

export default userController;