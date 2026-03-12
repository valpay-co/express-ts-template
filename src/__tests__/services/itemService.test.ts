import itemService from '../../services/item.service';
import itemDao from '../../daos/item.dao';
import AppError from '../../utils/appError';

jest.mock('../../daos/item.dao');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('ItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllItems', () => {
    it('should return paginated items', async () => {
      const mockData = {
        data: [{ _id: '1', name: 'Test', status: 'active' }],
        total: 1,
      };
      (itemDao.findPaginated as jest.Mock).mockResolvedValue(mockData);

      const result = await itemService.getAllItems(1, 10);

      expect(itemDao.findPaginated).toHaveBeenCalledWith({}, 1, 10);
      expect(result).toEqual({ data: mockData.data, total: 1, page: 1, limit: 10 });
    });

    it('should apply status filter', async () => {
      (itemDao.findPaginated as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      await itemService.getAllItems(1, 10, 'active');

      expect(itemDao.findPaginated).toHaveBeenCalledWith({ status: 'active' }, 1, 10);
    });

    it('should apply search filter', async () => {
      (itemDao.findPaginated as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      await itemService.getAllItems(1, 10, undefined, 'test');

      expect(itemDao.findPaginated).toHaveBeenCalledWith(
        { name: { $regex: 'test', $options: 'i' } },
        1,
        10
      );
    });
  });

  describe('getItemById', () => {
    it('should return an item when found', async () => {
      const mockItem = { _id: '1', name: 'Test', status: 'active' };
      (itemDao.findById as jest.Mock).mockResolvedValue(mockItem);

      const result = await itemService.getItemById('1');

      expect(result).toEqual(mockItem);
    });

    it('should throw AppError when item not found', async () => {
      (itemDao.findById as jest.Mock).mockResolvedValue(null);

      await expect(itemService.getItemById('999')).rejects.toThrow(AppError);
      await expect(itemService.getItemById('999')).rejects.toThrow('Item not found');
    });
  });

  describe('createItem', () => {
    it('should create and return an item', async () => {
      const mockItem = { _id: '1', name: 'New Item', status: 'active' };
      (itemDao.create as jest.Mock).mockResolvedValue(mockItem);

      const result = await itemService.createItem({ name: 'New Item' });

      expect(itemDao.create).toHaveBeenCalledWith({ name: 'New Item' });
      expect(result).toEqual(mockItem);
    });
  });

  describe('updateItem', () => {
    it('should update and return an item', async () => {
      const mockItem = { _id: '1', name: 'Updated', status: 'active' };
      (itemDao.update as jest.Mock).mockResolvedValue(mockItem);

      const result = await itemService.updateItem('1', { name: 'Updated' });

      expect(result).toEqual(mockItem);
    });

    it('should throw AppError when item not found', async () => {
      (itemDao.update as jest.Mock).mockResolvedValue(null);

      await expect(itemService.updateItem('999', { name: 'X' })).rejects.toThrow('Item not found');
    });
  });

  describe('deleteItem', () => {
    it('should delete and return an item', async () => {
      const mockItem = { _id: '1', name: 'Deleted' };
      (itemDao.remove as jest.Mock).mockResolvedValue(mockItem);

      const result = await itemService.deleteItem('1');

      expect(itemDao.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockItem);
    });

    it('should throw AppError when item not found', async () => {
      (itemDao.remove as jest.Mock).mockResolvedValue(null);

      await expect(itemService.deleteItem('999')).rejects.toThrow('Item not found');
    });
  });
});
