import { userRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';
import { CreateUserData, UpdateUserData } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';

/**
 * 사용자 등록 데이터 인터페이스
 */
export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
}

/**
 * 사용자 서비스 클래스
 * 비즈니스 로직을 처리하는 서비스 레이어
 */
export class UserService {
  /**
   * 새로운 사용자 등록
   * @param userData 등록할 사용자 데이터
   * @returns 생성된 사용자
   */
  async register(userData: RegisterUserData): Promise<IUser> {
    const { email, password, name } = userData;

    // 이메일 중복 확인
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 사용자 생성
    const createUserData: CreateUserData = {
      email,
      password,
      name,
      role: 'user'
    };

    return userRepository.create(createUserData);
  }

  /**
   * 사용자 로그인
   * @param email 사용자 이메일
   * @param password 사용자 비밀번호
   * @returns 인증된 사용자
   */
  async login(email: string, password: string): Promise<IUser> {
    // 사용자 조회
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 계정 활성화 확인
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 마지막 로그인 시간 업데이트
    await userRepository.updateLastLogin(user.id!);

    return user;
  }

  /**
   * 사용자 프로필 조회
   * @param userId 사용자 ID
   * @returns 사용자 프로필
   */
  async getProfile(userId: number): Promise<IUser | null> {
    return userRepository.findById(userId);
  }

  /**
   * 사용자 프로필 업데이트
   * @param userId 사용자 ID
   * @param updateData 업데이트할 데이터
   * @returns 업데이트된 사용자
   */
  async updateProfile(
    userId: number,
    updateData: UpdateUserData
  ): Promise<IUser | null> {
    return userRepository.update(userId, updateData);
  }

  /**
   * 모든 사용자 목록 조회
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @returns 사용자 목록과 페이징 정보
   */
  async getAllUsers(page: number = 1, limit: number = 10) {
    return userRepository.findAll(page, limit);
  }

  /**
   * 사용자 계정 비활성화
   * @param userId 사용자 ID
   * @returns 비활성화된 사용자
   */
  async deactivateUser(userId: number): Promise<IUser | null> {
    return userRepository.update(userId, { isActive: false });
  }

  /**
   * 사용자 계정 활성화
   * @param userId 사용자 ID
   * @returns 활성화된 사용자
   */
  async activateUser(userId: number): Promise<IUser | null> {
    return userRepository.update(userId, { isActive: true });
  }

  /**
   * 사용자 삭제
   * @param userId 사용자 ID
   * @returns 삭제 성공 여부
   */
  async deleteUser(userId: number): Promise<boolean> {
    return userRepository.delete(userId);
  }
}

// 서비스 인스턴스 생성
export const userService = new UserService();

export default userService;