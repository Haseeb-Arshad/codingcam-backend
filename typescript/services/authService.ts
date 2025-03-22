import jwt from 'jsonwebtoken';
import config from '../config/environment';
import User, { IUser } from '../models/User';

export const AuthService = {
  async register(email: string, password: string, username: string, fullName?: string): Promise<{ user: Omit<IUser, 'password'>, token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      fullName
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '30d' });

    // Remove password from returned user object 
    const userObject: any = user.toObject();
    delete userObject.password;

    return { user: userObject, token };
  },

  async login(email: string, password: string): Promise<{ user: Omit<IUser, 'password'>, token: string }> {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '30d' });

    // Remove password from returned user object
    const userObject: any = user.toObject();
    delete userObject.password;

    return { user: userObject, token };
  },

  verifyToken(token: string): { id: string } {
    try {
      return jwt.verify(token, config.jwtSecret) as { id: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};