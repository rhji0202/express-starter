import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

/**
 * 사용자 인터페이스
 */
export interface IUser {
  id?: number;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 사용자 모델 정의
 */
@Table({
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: (user: User) => {
      user.email = user.email.toLowerCase().trim();
    },
    beforeUpdate: (user: User) => {
      user.email = user.email.toLowerCase().trim();
    }
  }
})
export class User extends Model<IUser> implements IUser {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  declare id?: number;

  @Column({
      type: DataType.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        },
        len: {
          args: [5, 255] as [number, number],
          msg: 'Email must be between 5 and 255 characters'
        }
      }
    })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required'
      },
      len: {
        args: [6, 100] as [number, number],
        msg: 'Password must be between 6 and 100 characters'
      }
    }
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'Name cannot exceed 50 characters'
      },
      notNull: {
        msg: 'Name is required'
      }
    }
  })
  declare name: string;

  @Column({
    type: DataType.ENUM('user', 'admin'),
    defaultValue: 'user'
  })
  declare role: 'user' | 'admin';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  declare isActive: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare lastLogin?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare createdAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare updatedAt?: Date;

  /**
   * 비밀번호 해싱 훅
   */
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      try {
        const salt = await bcrypt.genSalt(12);
        instance.password = await bcrypt.hash(instance.password, salt);
      } catch (error) {
        throw new Error('Password hashing failed');
      }
    }
  }

  /**
   * 비밀번호 비교 메서드
   * @param candidatePassword 비교할 비밀번호
   * @returns 비밀번호 일치 여부
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * JSON 변환 시 비밀번호 제외
   */
  toJSON(): any {
    const values = { ...this.get() } as any;
    delete values.password;
    return values;
  }
}

export default User;