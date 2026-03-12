import express from 'express';
import itemRoutes from './item.routes';

const router = express.Router();

// Item routes (example entity)
router.use('/items', itemRoutes);

export default router;
