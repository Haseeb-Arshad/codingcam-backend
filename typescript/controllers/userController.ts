import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const UserController = {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
  
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const { username, fullName, country, timezone } = req.body;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { username, fullName, country, timezone },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  },
  
  async getPublicProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId).select('username fullName country timezone');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};