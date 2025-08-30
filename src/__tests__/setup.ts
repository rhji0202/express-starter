import { Sequelize } from 'sequelize';

// 테스트 전 데이터베이스 연결 설정
beforeAll(async () => {
  // 메모리 SQLite 데이터베이스 사용
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
  
  await sequelize.authenticate();
});

// 각 테스트 후 데이터베이스 정리
afterEach(async () => {
  // 테이블 데이터 정리
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
  
  await sequelize.sync({ force: true });
});

// 모든 테스트 후 데이터베이스 연결 종료
afterAll(async () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
  
  await sequelize.close();
});

// 더미 테스트 추가
describe('Setup', () => {
  it('should pass setup test', () => {
    expect(true).toBe(true);
  });
});