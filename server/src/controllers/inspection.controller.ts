import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import InspectionBook from '../models/InspectionBook';
import { User } from '../models/User';
import { createInspectionSchema, updateInspectionSchema, batchSubmitSchema } from '../validators/inspection.validator';

export const createInspection = async (req: AuthRequest, res: Response) => {
  try {
    const inspectorId = req.user?.id;
    if (!inspectorId || !mongoose.Types.ObjectId.isValid(inspectorId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validatedData = createInspectionSchema.parse(req.body);

    // Get the parent user of the inspector
    const inspector = await User.findById(inspectorId);
    if (!inspector || !inspector.parentUserId) {
      return res.status(400).json({ success: false, message: 'Inspector has no assigned parent user' });
    }

    const inspectionData = {
      ...validatedData,
      inspectorId: new mongoose.Types.ObjectId(inspectorId),
      parentUserId: inspector.parentUserId,
      status: 'draft' as const
    };

    const newInspection = new InspectionBook(inspectionData);
    await newInspection.save();

    res.status(201).json({ success: true, data: newInspection });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || 'Invalid inspection input',
        errors: error.issues
      });
    }
    console.error('Error creating inspection:', error);
    res.status(500).json({ success: false, message: 'Server error while creating inspection' });
  }
};

export const getMyInspections = async (req: AuthRequest, res: Response) => {
  try {
    const inspectorId = req.user?.id;
    if (!inspectorId || !mongoose.Types.ObjectId.isValid(inspectorId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const inspections = await InspectionBook.find({ inspectorId }).sort({ createdAt: -1 });
    res.json({ success: true, data: inspections });
  } catch (error) {
    console.error('Error fetching my inspections:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching inspections' });
  }
};

export const getTeamInspections = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const inspections = await InspectionBook.find({ 
      parentUserId: userId,
      status: { $in: ['submitted', 'reviewed'] }
    })
      .populate('inspectorId', 'name email')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: inspections });
  } catch (error) {
    console.error('Error fetching team inspections:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching team inspections' });
  }
};

export const getInspectionById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid inspection ID format' });
    }

    const inspection = await InspectionBook.findById(id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    // Verify ownership (either the inspector who created it, or the parent user)
    if (inspection.inspectorId.toString() !== userId && inspection.parentUserId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: inspection });
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching inspection' });
  }
};

export const updateInspection = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const inspectorId = req.user?.id;
    
    if (!inspectorId || !mongoose.Types.ObjectId.isValid(inspectorId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid inspection ID format' });
    }

    const validatedData = updateInspectionSchema.parse(req.body);

    const inspection = await InspectionBook.findById(id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    // Only the inspector who created it can edit it
    if (inspection.inspectorId.toString() !== inspectorId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own inspections' });
    }

    if (inspection.status !== 'draft') {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot edit an inspection that has already been submitted' });
    }

    // Explicitly update only validated whitelisted fields (prevents mass-assignment of status, inspectorId, parentUserId)
    const updatedInspection = await InspectionBook.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedInspection });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || 'Invalid inspection update',
        errors: error.issues
      });
    }
    console.error('Error updating inspection:', error);
    res.status(500).json({ success: false, message: 'Server error while updating inspection' });
  }
};

export const deleteInspection = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const inspectorId = req.user?.id;
    
    if (!inspectorId || !mongoose.Types.ObjectId.isValid(inspectorId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid inspection ID format' });
    }

    const inspection = await InspectionBook.findById(id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    // Only the inspector who created it can delete it
    if (inspection.inspectorId.toString() !== inspectorId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own inspections' });
    }

    if (inspection.status !== 'draft') {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot delete an inspection that has already been submitted' });
    }

    await InspectionBook.findByIdAndDelete(id);

    res.json({ success: true, message: 'Inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting inspection' });
  }
};

export const submitInspectionsBatch = async (req: AuthRequest, res: Response) => {
  try {
    const inspectorId = req.user?.id;
    
    if (!inspectorId || !mongoose.Types.ObjectId.isValid(inspectorId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validatedData = batchSubmitSchema.parse(req.body);
    const { inspectionIds } = validatedData;

    // Update all provided inspections that belong to this inspector and are in 'draft' status
    const result = await InspectionBook.updateMany(
      { 
        _id: { $in: inspectionIds },
        inspectorId,
        status: 'draft' 
      },
      { $set: { status: 'submitted' } }
    );

    res.json({ 
      success: true, 
      message: `${result.modifiedCount} inspections submitted successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message || 'Invalid batch submission data',
        errors: error.issues
      });
    }
    console.error('Error batch submitting inspections:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting inspections' });
  }
};

export const getMyStats = async (req: AuthRequest, res: Response) => {
  try {
    const inspectorId = req.user?.id;
    
    if (!inspectorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [draftsCount, pendingCount, completedCount] = await Promise.all([
      InspectionBook.countDocuments({ inspectorId, status: 'draft' }),
      InspectionBook.countDocuments({ inspectorId, status: 'submitted' }),
      InspectionBook.countDocuments({ 
        inspectorId, 
        status: 'reviewed',
        createdAt: { $gte: startOfMonth }
      }),
    ]);

    res.json({
      success: true,
      data: {
        drafts: draftsCount,
        pending: pendingCount,
        completed: completedCount
      }
    });
  } catch (error) {
    console.error('Error getting inspection stats:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching stats' });
  }
};
