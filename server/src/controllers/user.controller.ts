import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createUserSchema, changePasswordSchema, resetPasswordSchema } from '../validators/user.validator';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .populate('parentUserId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
};

export const getMyInspectors = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const inspectors = await User.find({ parentUserId: userId, role: 'inspection' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: inspectors });
  } catch (error) {
    console.error('Error fetching my inspectors:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching inspectors' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: error.issues[0]?.message || 'Invalid password input' 
      });
    }
    console.error('Password update failure:', error);
    res.status(500).json({ success: false, message: 'Server error while changing password' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const { name, email, password, role, parentUserId } = validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      parentUserId: role === 'inspection' ? parentUserId : undefined
    });

    const userToReturn = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      parentUserId: newUser.parentUserId,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ success: true, data: userToReturn });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: error.issues[0]?.message || 'Invalid user data' 
      });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Server error while creating user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    
    // Prevent an admin from deleting themselves
    if (userId === req.user?.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting user' });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const validatedData = resetPasswordSchema.parse(req.body);
    const { newPassword } = validatedData;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: error.issues[0]?.message || 'Invalid password format' 
      });
    }
    console.error('Password reset failure:', error);
    res.status(500).json({ success: false, message: 'Server error while resetting password' });
  }
};
