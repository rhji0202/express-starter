import pino from 'pino';
import { env } from './env';

/**
 * Pino 로거 설정
 * 개발 환경과 프로덕션 환경에 따라 다른 설정을 적용합니다.
 */
const pinoConfig = {
  // 개발 환경: 가독성 좋은 포맷
   development: {
     level: 'debug',
     transport: {
       target: 'pino-pretty',
       options: {
         colorize: true,
         translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
         ignore: 'pid,hostname',
       },
     },
   },
  // 프로덕션 환경: JSON 포맷
  production: {
    level: 'info',
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  // 테스트 환경: 에러만 로깅
  test: {
    level: 'error',
  },
};

/**
 * 환경별 로거 인스턴스 생성
 * @returns Pino 로거 인스턴스
 */
export const createLogger = () => {
  const config = pinoConfig[env.NODE_ENV as keyof typeof pinoConfig] || pinoConfig.development;
  
  return pino({
    ...config,
    base: {
      env: env.NODE_ENV,
      app: 'express-app',
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        path: req.path,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          authorization: req.headers.authorization ? '***' : undefined,
        },
        remoteAddress: req.socket.remoteAddress,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        headers: {
          'content-type': res.getHeader('content-type'),
        },
      }),
      err: pino.stdSerializers.err,
    },
  });
};

// 전역 로거 인스턴스
export const logger = createLogger();

export default logger;