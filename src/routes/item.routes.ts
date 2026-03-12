import express from 'express';
import { query, body, param } from 'express-validator';
import itemController from '../controllers/item.controller';

const router = express.Router();

// GET /api/items — list all items (paginated)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'inactive', 'archived']),
    query('search').optional().isString().trim(),
  ],
  itemController.getAll
);

// GET /api/items/:id — get item by ID
router.get(
  '/:id',
  [param('id').isMongoId()],
  itemController.getById
);

// POST /api/items — create new item
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('description').optional().isString().trim(),
    body('status').optional().isIn(['active', 'inactive', 'archived']),
  ],
  itemController.create
);

// PATCH /api/items/:id — update item
router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('name').optional().isString().trim(),
    body('description').optional().isString().trim(),
    body('status').optional().isIn(['active', 'inactive', 'archived']),
  ],
  itemController.update
);

// DELETE /api/items/:id — delete item
router.delete(
  '/:id',
  [param('id').isMongoId()],
  itemController.remove
);

export default router;
