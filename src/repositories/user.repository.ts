import { IUser, User } from '../models/user.model';

/**
 * 사용자 생성 인터페이스
 */
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

/**
 * 사용자 업데이트 인터페이스
 */
export interface UpdateUserData {
  name?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

/**
 * 사용자 리포지토리 클래스
 * 데이터베이스 CRUD 연산을 담당
 */
export class UserRepository {
  /**
   * 새로운 사용자 생성
   * @param userData 생성할 사용자 데이터
   * @returns 생성된 사용자
   */
  async create(userData: CreateUserData): Promise<IUser> {
    try {
      // 기본값 설정
      const userDataWithDefaults = {
        ...userData,
        isActive: true,
        role: 'user' as const
      };
      return await User.create(userDataWithDefaults);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * 이메일로 사용자 조회
   * @param email 사용자 이메일
   * @returns 사용자 객체 또는 null
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ where: { email: email.toLowerCase() } });
  }

  /**
   * 사용자 ID로 조회
   * @param id 사용자 ID
   * @returns 사용자 객체 또는 null
   */
  async findById(id: number): Promise<IUser | null> {
    return User.findByPk(id);
  }

  /**
   * 모든 사용자 조회 (페이징 지원)
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @returns 사용자 목록
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{
    users: IUser[];
    total: number;
    pages: number;
  }> {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      pages: Math.ceil(count / limit)
    };
  }

  /**
   * 사용자 정보 업데이트
   * @param id 사용자 ID
   * @param updateData 업데이트할 데이터
   * @returns 업데이트된 사용자
   */
  async update(id: number, updateData: UpdateUserData): Promise<IUser | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    return user.update({ ...updateData, updatedAt: new Date() });
  }

  /**
   * 사용자 삭제
   * @param id 사용자 ID
   * @returns 삭제된 사용자
   */
  async delete(id: number): Promise<boolean> {
    const result = await User.destroy({ where: { id } });
    return result > 0;
  }

  /**
   * 사용자 로그인 시간 업데이트
   * @param id 사용자 ID
   * @returns 업데이트된 사용자
   */
  async updateLastLogin(id: number): Promise<IUser | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    return user.update({ lastLogin: new Date() });
  }
}

// 리포지토리 인스턴스 생성
export const userRepository = new UserRepository();

export default userRepository;