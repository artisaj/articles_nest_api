import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.id || (req as any).headers['x-request-id'];
    
    if (requestId) {
      res.setHeader('X-Request-Id', requestId);
    }
    
    next();
  }
}
