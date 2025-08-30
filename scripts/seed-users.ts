import { userService } from '../src/services/user.service';
import { connectDatabase } from '../src/config/db';

/**
 * 테스트 사용자 데이터 시딩 스크립트
 * 데이터베이스에 테스트용 사용자 2명을 추가합니다
 */
async function seedUsers() {
  // 데이터베이스 연결 초기화
  await connectDatabase();
  try {
    console.log('테스트 사용자 데이터 추가를 시작합니다...');

    // 테스트 사용자 1
    const user1 = await userService.register({
      email: 'user1@example.com',
      password: 'password123',
      name: '테스트 사용자1'
    });
    console.log('사용자1 추가 완료:', user1.email);

    // 테스트 사용자 2
    const user2 = await userService.register({
      email: 'user2@example.com',
      password: 'password123',
      name: '테스트 사용자2'
    });
    console.log('사용자2 추가 완료:', user2.email);

    console.log('테스트 사용자 데이터 추가가 완료되었습니다!');
    console.log('추가된 사용자:');
    console.log('-', user1.email, '(ID:', user1.id, ')');
    console.log('-', user2.email, '(ID:', user2.id, ')');

  } catch (error) {
    console.error('사용자 데이터 추가 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedUsers();