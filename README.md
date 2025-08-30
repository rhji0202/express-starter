# Express.js Starter Project

Node.js와 Express.js를 사용한 기본적인 웹 애플리케이션 스타터 프로젝트입니다. 사용자 인증 기능을 포함하고 있습니다.

## 🚀 기능

- 사용자 등록 및 로그인
- JWT 기반 인증
- Sequelize ORM을 사용한 데이터베이스 연동
- TypeScript 지원
- 환경 변수 설정
- 로깅 시스템
- 단위 테스트

## 📦 설치

```bash
# 저장소 클론
git clone https://github.com/rhji0202/express-starter.git
cd express-starter

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 설정 등을 구성하세요
```

## ⚙️ 설정

### 환경 변수

`.env` 파일에 다음 변수들을 설정해야 합니다:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=express_app
DB_USER=username
DB_PASSWORD=password
JWT_SECRET=your-jwt-secret-key
```

### 데이터베이스

프로젝트는 PostgreSQL 데이터베이스를 사용합니다. 다른 데이터베이스를 사용하려면 `src/config/db.ts` 파일에서 Sequelize 설정을 수정하세요.

## 🏃 실행

```bash
# 개발 모드 실행
npm run dev

# 프로덕션 빌드 및 실행
npm run build
npm start
```

## 📁 프로젝트 구조

```
src/
├── config/          # 설정 파일들
│   ├── db.ts       # 데이터베이스 연결
│   ├── env.ts      # 환경 변수
│   └── logger.ts   # 로깅 설정
├── controllers/     # 컨트롤러
├── middlewares/     # 미들웨어
├── models/         # 데이터베이스 모델
├── repositories/    # 데이터 접근 계층
├── routes/         # 라우트 정의
├── services/       # 비즈니스 로직
├── utils/          # 유틸리티 함수
└── index.ts        # 애플리케이션 진입점
```

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage
```

## 📝 API 문서

### 사용자 관련 API

- `POST /api/users/register` - 사용자 등록
- `POST /api/users/login` - 사용자 로그인
- `GET /api/users/profile` - 사용자 프로필 조회 (인증 필요)

## 🔧 개발

### 코드 스타일

```bash
# 코드 린팅
npm run lint

# 코드 포맷팅
npm run format
```

### 데이터베이스 마이그레이션

```bash
# 시드 데이터 생성
npm run seed
```

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.