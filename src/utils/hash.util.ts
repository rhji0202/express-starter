import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * 비밀번호 해싱 함수
 * @param password 평문 비밀번호
 * @returns 해시된 비밀번호
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * 비밀번호 검증 함수
 * @param password 평문 비밀번호
 * @param hashedPassword 해시된 비밀번호
 * @returns 비밀번호 일치 여부
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * JWT 토큰 생성
 * @param payload 토큰에 담을 데이터
 * @returns 생성된 JWT 토큰
 */
export const generateToken = (payload: object): string => {
  const options: jwt.SignOptions = {
    expiresIn: parseInt(env.JWT_EXPIRE) || 3600,
    issuer: 'express-app'
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * JWT 토큰 검증
 * @param token 검증할 JWT 토큰
 * @returns 디코딩된 토큰 데이터
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * 토큰에서 사용자 ID 추출
 * @param token JWT 토큰
 * @returns 사용자 ID
 */
export const getUserIdFromToken = (token: string): string => {
  const decoded = verifyToken(token);
  return decoded.id || decoded._id;
};

/**
 * 토큰 만료 시간 확인
 * @param token JWT 토큰
 * @returns 만료까지 남은 시간(초)
 */
export const getTokenExpiry = (token: string): number => {
  const decoded = jwt.decode(token) as { exp: number };
  if (!decoded || !decoded.exp) {
    throw new Error('Invalid token');
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp - currentTime;
};

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getUserIdFromToken,
  getTokenExpiry
};