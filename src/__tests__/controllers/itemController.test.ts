import itemController from '../../controllers/item.controller';
import itemService from '../../services/item.service';

// Mock dependencies
jest.mock('../../services/item.service');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const mockRequest = (overrides: any = {}) => ({
  params: {},
  query: {},
  body: {},
  ...overrides,
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('ItemController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated items', async () => {
      const mockData = {
        data: [{ _id: '1', name: 'Test Item', status: 'active' }],
        total: 1,
        page: 1,
        limit: 10,
      };
      (itemService.getAllItems as jest.Mock).mockResolvedValue(mockData);

      const req = mockRequest({ query: { page: '1', limit: '10' } });
      const res = mockResponse();

      await itemController.getAll(req as any, res as any, mockNext);

      expect(itemService.getAllItems).toHaveBeenCalledWith(1, 10, undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should pass filters to service', async () => {
      const mockData = { data: [], total: 0, page: 1, limit: 10 };
      (itemService.getAllItems as jest.Mock).mockResolvedValue(mockData);

      const req = mockRequest({
        query: { page: '1', limit: '10', status: 'active', search: 'test' },
      });
      const res = mockResponse();

      await itemController.getAll(req as any, res as any, mockNext);

      expect(itemService.getAllItems).toHaveBeenCalledWith(1, 10, 'active', 'test');
    });

    it('should call next on error', async () => {
      const error = new Error('Service error');
      (itemService.getAllItems as jest.Mock).mockRejectedValue(error);

      const req = mockRequest();
      const res = mockResponse();

      await itemController.getAll(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should return a single item', async () => {
      const mockItem = { _id: '1', name: 'Test Item', status: 'active' };
      (itemService.getItemById as jest.Mock).mockResolvedValue(mockItem);

      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await itemController.getById(req as any, res as any, mockNext);

      expect(itemService.getItemById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      const error = new Error('Not found');
      (itemService.getItemById as jest.Mock).mockRejectedValue(error);

      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await itemController.getById(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should create an item and return 201', async () => {
      const mockItem = { _id: '1', name: 'New Item', status: 'active' };
      (itemService.createItem as jest.Mock).mockResolvedValue(mockItem);

      const req = mockRequest({ body: { name: 'New Item' } });
      const res = mockResponse();

      await itemController.create(req as any, res as any, mockNext);

      expect(itemService.createItem).toHaveBeenCalledWith({ name: 'New Item' });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const mockItem = { _id: '1', name: 'Updated Item', status: 'active' };
      (itemService.updateItem as jest.Mock).mockResolvedValue(mockItem);

      const req = mockRequest({ params: { id: '1' }, body: { name: 'Updated Item' } });
      const res = mockResponse();

      await itemController.update(req as any, res as any, mockNext);

      expect(itemService.updateItem).toHaveBeenCalledWith('1', { name: 'Updated Item' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('remove', () => {
    it('should delete an item', async () => {
      const mockItem = { _id: '1', name: 'Deleted Item' };
      (itemService.deleteItem as jest.Mock).mockResolvedValue(mockItem);

      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await itemController.remove(req as any, res as any, mockNext);

      expect(itemService.deleteItem).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
