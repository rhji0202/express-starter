import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

/**
 * Pino 기반 Request/Response 로깅 미들웨어
 * 고성능 JSON 로깅을 제공합니다.
 */
export const pinoLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // 요청 정보 로깅
  logger.info({
    type: 'request',
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ...(req.body && Object.keys(req.body).length > 0 && { requestBody: req.body }),
  }, '[REQUEST] Incoming request');

  // 응답 완료 시 로깅
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    const logData = {
      type: 'response',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      responseSize: res.get('Content-Length') || 'unknown',
    };

    if (res.statusCode >= 400) {
      logger.error(logData, '[ERROR] Request completed with error');
    } else {
      logger.info(logData, '[SUCCESS] Request completed successfully');
    }
  });

  // 응답 본문 캡처 (선택적)
  const originalSend = res.send;
  res.send = function(body: any): Response {
    if (res.statusCode >= 400) {
      logger.debug({ responseBody: body }, 'Error response body');
    }
    return originalSend.call(this, body);
  };

  next();
};

/**
 * 상세 로깅 미들웨어
 * 디버깅용 상세 정보를 로깅합니다.
 */
export const detailedPinoLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // 상세 요청 정보 로깅
  logger.debug({
    type: 'detailed_request',
    method: req.method,
    path: req.path,
    url: req.url,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    headers: {
      'content-type': req.get('Content-Type'),
      accept: req.get('Accept'),
      authorization: req.get('Authorization') ? '***' : undefined,
    },
    query: req.query,
    ...(req.body && Object.keys(req.body).length > 0 && { body: req.body }),
  }, '🔍 Detailed request info');

  // 응답 완료 시 상세 로깅
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    logger.debug({
      type: 'detailed_response',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: responseTime,
      responseSize: res.get('Content-Length'),
      responseHeaders: {
        'content-type': res.get('Content-Type'),
      },
    }, '📊 Detailed response info');
  });

  next();
};

export default {
  pinoLoggingMiddleware,
  detailedPinoLoggingMiddleware,
};