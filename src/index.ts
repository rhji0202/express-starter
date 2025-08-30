import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import userRoutes from './routes/user.routes';
import { pinoLoggingMiddleware } from './middlewares/pino.logging.middleware';

/**
 * Express 애플리케이션 클래스
 * 서버 설정과 미들웨어 구성을 담당
 */
class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * 미들웨어 초기화
   */
  private initializeMiddlewares(): void {
    // 보안 미들웨어
    this.app.use(helmet());
    
    // CORS 설정
    this.app.use(cors({
      origin: env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }));

    // JSON 파싱
    this.app.use(express.json({ limit: '10mb' }));
    
    // URL 인코딩
    this.app.use(express.urlencoded({ extended: true }));

    // Pino 기반 요청/응답 로깅 미들웨어
    this.app.use(pinoLoggingMiddleware);
  }

  /**
   * 라우트 초기화
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API routes
    this.app.use('/api/users', userRoutes);

    // 404 처리
    this.app.use('*', (_, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });
  }

  /**
   * 에러 처리 미들웨어
   */
  private initializeErrorHandling(): void {
    // 전역 에러 처리
    this.app.use((error: any, _: express.Request, res: express.Response, __: express.NextFunction) => {
      logger.error({ error }, 'Unhandled error');
      
      res.status(error.status || 500).json({
        success: false,
        message: env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
        ...(env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });

    // 프로미스 rejection 처리
    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ promise, reason }, 'Unhandled Rejection');
      process.exit(1);
    });

    // 처리되지 않은 예외 처리
    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught Exception');
      process.exit(1);
    });
  }

  /**
   * 서버 시작
   */
  public async start(): Promise<void> {
    try {
      // 데이터베이스 연결
      await connectDatabase();
      
      // 서버 시작
      this.app.listen(env.PORT, () => {
        logger.info(`[SERVER] Server is running on port ${env.PORT}`);
        logger.info(`[ENV] Environment: ${env.NODE_ENV}`);
        logger.info(`[TIME] Started at: ${new Date().toISOString()}`);
      });
    } catch (error) {
      logger.error(`Failed to start server: ${error}`);
      process.exit(1);
    }
  }
}

// 애플리케이션 인스턴스 생성 및 시작
const app = new App();
app.start();

export default app;