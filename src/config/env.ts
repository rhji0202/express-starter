import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

/**
 * 애플리케이션 환경 변수 인터페이스
 */
export interface Environment {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  BCRYPT_SALT_ROUNDS: number;
}

/**
 * 환경 변수 유효성 검사
 * @param env 환경 변수 객체
 * @returns 검증된 환경 변수
 */
const validateEnvironment = (env: NodeJS.ProcessEnv): Environment => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'JWT_EXPIRE'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  return {
    NODE_ENV: env.NODE_ENV || 'development',
    PORT: parseInt(env.PORT || '3000', 10),
    JWT_SECRET: env.JWT_SECRET!,
    JWT_EXPIRE: env.JWT_EXPIRE!,
    BCRYPT_SALT_ROUNDS: parseInt(env.BCRYPT_SALT_ROUNDS || '12', 10)
  };
};

// 환경 변수 객체
export const env: Environment = validateEnvironment(process.env);

export default env;