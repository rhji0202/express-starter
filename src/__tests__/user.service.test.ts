import { UserService } from '../services/user.service';
import { userRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';
import bcrypt from 'bcryptjs';

// Mock 리포지토리와 bcrypt
jest.mock('../repositories/user.repository');
jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const mockUser: IUser = {
        id: 1,
        ...userData,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.register(userData);

      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: userData.email,
        name: userData.name,
        password: expect.any(String),
        role: 'user'
      }));
      expect(result).toEqual(mockUser);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User'
      };

      (userRepository.create as jest.Mock).mockRejectedValue(
        new Error('Email already exists')
      );

      await expect(userService.register(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.login(loginData.email, loginData.password);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(userService.login(loginData.email, loginData.password)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile by id', async () => {
      const userId = 1;
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = 999;

      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await userService.getProfile(userId);
      expect(result).toBeNull();
    });
  });
});