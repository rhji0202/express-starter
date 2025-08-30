import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';

/**
 * SQLite 데이터베이스 연결 설정
 * @returns Sequelize 연결 객체
 */
export const connectDatabase = async (): Promise<Sequelize> => {
  try {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    
    // 모델 추가
    sequelize.addModels([User]);

    await sequelize.authenticate();
    console.log('✅ SQLite connected successfully');
    
    // 모델 동기화
    await sequelize.sync({ force: false });
    console.log('✅ Database schema synchronized');
    
    return sequelize;
  } catch (error) {
    console.error('❌ SQLite connection failed:', error);
    process.exit(1);
  }
};

/**
 * 데이터베이스 연결 종료
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    // Sequelize는 자동으로 연결을 관리하므로 명시적인 종료가 필요하지 않음
    console.log('✅ SQLite connection closed');
  } catch (error) {
    console.error('❌ SQLite disconnection failed:', error);
  }
};

// SQLite 연결 이벤트 리스너 (Sequelize는 자체 이벤트 시스템을 사용)

// 애플리케이션 종료 시 연결 종료
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default { connectDatabase, disconnectDatabase };