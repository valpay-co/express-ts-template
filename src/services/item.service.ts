import itemDao from '../daos/item.dao';
import { IItem } from '../models/Item';
import AppError from '../utils/appError';
import logger from '../utils/logger';

const getAllItems = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string
): Promise<{ data: IItem[]; total: number; page: number; limit: number }> => {
  try {
    logger.info('Getting all items', { page, limit, status, search });

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const result = await itemDao.findPaginated(filter, page, limit);
    return { ...result, page, limit };
  } catch (error) {
    logger.error('Error getting all items:', error);
    throw error;
  }
};

const getItemById = async (id: string): Promise<IItem> => {
  try {
    logger.info('Getting item by ID', { id });
    const item = await itemDao.findById(id);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    return item;
  } catch (error) {
    logger.error('Error getting item by ID:', error);
    throw error;
  }
};

const createItem = async (data: Partial<IItem>): Promise<IItem> => {
  try {
    logger.info('Creating item');
    return await itemDao.create(data);
  } catch (error) {
    logger.error('Error creating item:', error);
    throw error;
  }
};

const updateItem = async (
  id: string,
  data: Partial<IItem>
): Promise<IItem> => {
  try {
    logger.info('Updating item', { id });
    const item = await itemDao.update(id, data);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    return item;
  } catch (error) {
    logger.error('Error updating item:', error);
    throw error;
  }
};

const deleteItem = async (id: string): Promise<IItem> => {
  try {
    logger.info('Deleting item', { id });
    const item = await itemDao.remove(id);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    return item;
  } catch (error) {
    logger.error('Error deleting item:', error);
    throw error;
  }
};

export default {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
