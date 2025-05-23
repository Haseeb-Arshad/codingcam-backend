import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};