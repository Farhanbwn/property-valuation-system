import { z } from 'zod';
import mongoose from 'mongoose';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase().max(255),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  role: z.enum(['admin', 'user', 'inspection'], {
    message: 'Role must be either admin, user, or inspection'
  }),
  parentUserId: z.string().optional().refine(
    (val) => !val || mongoose.Types.ObjectId.isValid(val),
    { message: 'Invalid parentUserId format' }
  )
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(128),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long').max(128)
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters long').max(128)
});
