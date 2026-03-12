import itemService from '../../services/item.service';
import apiService from '../../services/api';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('itemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call apiService.get with correct params', async () => {
      const mockResponse = { success: true, data: { data: [], total: 0, page: 1, limit: 10 } };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await itemService.getAll(1, 10);

      expect(apiService.get).toHaveBeenCalledWith('/items?page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should include search param when provided', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ success: true, data: { data: [], total: 0 } });

      await itemService.getAll(1, 10, undefined, 'test');

      expect(apiService.get).toHaveBeenCalledWith('/items?page=1&limit=10&search=test');
    });
  });

  describe('getById', () => {
    it('should call apiService.get with correct URL', async () => {
      const mockResponse = { success: true, data: { _id: '1', name: 'Test' } };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await itemService.getById('1');

      expect(apiService.get).toHaveBeenCalledWith('/items/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should call apiService.post with correct data', async () => {
      const data = { name: 'New Item', description: '', status: 'active' as const };
      const mockResponse = { success: true, data: { _id: '1', ...data } };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await itemService.create(data);

      expect(apiService.post).toHaveBeenCalledWith('/items', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('remove', () => {
    it('should call apiService.delete with correct URL', async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

      await itemService.remove('1');

      expect(apiService.delete).toHaveBeenCalledWith('/items/1');
    });
  });
});
