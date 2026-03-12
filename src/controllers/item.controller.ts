import { Request, Response, NextFunction } from 'express';
import itemService from '../services/item.service';
import { successResponse } from '../utils/response';
import logger from '../utils/logger';

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    logger.info('Getting all items', { page, limit, status, search });
    const result = await itemService.getAllItems(page, limit, status, search);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await itemService.getItemById(req.params.id);
    successResponse(res, item);
  } catch (error) {
    next(error);
  }
};

const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await itemService.createItem(req.body);
    successResponse(res, item, 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await itemService.updateItem(req.params.id, req.body);
    successResponse(res, item);
  } catch (error) {
    next(error);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await itemService.deleteItem(req.params.id);
    successResponse(res, { message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
