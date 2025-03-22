import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username, fullName } = req.body;
      
      const result = await AuthService.register(email, password, username, fullName);
      
      res.status(201).json(result);
    } catch (error) {
      if ((error as Error).message === 'User with this email already exists') {
        res.status(409).json({ message: (error as Error).message });
        return;
      }
      
      res.status(500).json({ message: (error as Error).message });
    }
  },
  
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);
      
      res.status(200).json(result);
    } catch (error) {
      if ((error as Error).message === 'Invalid credentials') {
        res.status(401).json({ message: (error as Error).message });
        return;
      }
      
      res.status(500).json({ message: (error as Error).message });
    }
  }
};