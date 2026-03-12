import { UpdateQuery } from 'mongoose';
import Item, { IItem } from '../models/Item';
import logger from '../utils/logger';

const findById = async (id: string): Promise<IItem | null> => {
  try {
    logger.info('Finding item by ID', { id });
    return await Item.findById(id);
  } catch (error) {
    logger.error('Error finding item by ID:', error);
    throw error;
  }
};

const create = async (data: Partial<IItem>): Promise<IItem> => {
  try {
    logger.info('Creating new item');
    return await Item.create(data);
  } catch (error) {
    logger.error('Error creating item:', error);
    throw error;
  }
};

const update = async (
  id: string,
  updateData: UpdateQuery<IItem>
): Promise<IItem | null> => {
  try {
    logger.info('Updating item', { id });
    return await Item.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    logger.error('Error updating item:', error);
    throw error;
  }
};

const remove = async (id: string): Promise<IItem | null> => {
  try {
    logger.info('Deleting item', { id });
    return await Item.findByIdAndDelete(id);
  } catch (error) {
    logger.error('Error deleting item:', error);
    throw error;
  }
};

const findPaginated = async (
  filter: Record<string, any> = {},
  page: number = 1,
  limit: number = 10,
  sort: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<{ data: IItem[]; total: number }> => {
  try {
    logger.info('Finding paginated items', { filter, page, limit });

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Item.countDocuments(filter),
    ]);

    return { data, total };
  } catch (error) {
    logger.error('Error finding paginated items:', error);
    throw error;
  }
};

export default {
  findById,
  create,
  update,
  remove,
  findPaginated,
};
