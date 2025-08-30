import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/hash.util';
import { userRepository } from '../repositories/user.repository';

/**
 * 인증 미들웨어 인터페이스
 */
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * JWT 토큰 인증 미들웨어
 * 요청 헤더의 Authorization 토큰을 검증하고 사용자 정보를 추가
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    // 토큰 검증
    const decoded = verifyToken(token);
    
    // 사용자 정보 조회
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    // 사용자 계정 활성화 확인
    if (!user.isActive) {
      res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
      return;
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: user.id!,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.log(error);
    
    // TokenExpiredError인 경우 특별 처리
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  }
};

/**
 * 관리자 권한 확인 미들웨어
 * 사용자가 관리자 역할인지 확인
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
    return;
  }

  next();
};

/**
 * 사용자 자신 또는 관리자 권한 확인 미들웨어
 * 사용자가 자신의 데이터에 접근하거나 관리자인 경우 허용
 */
export const requireSelfOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
    return;
  }

  const targetUserId = req.params.userId || req.body.userId;
  
  if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
    return;
  }

  next();
};

export default {
  authenticateToken,
  requireAdmin,
  requireSelfOrAdmin
};