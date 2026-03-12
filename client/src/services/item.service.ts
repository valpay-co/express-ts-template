import apiService from './api';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { Item, ItemFormData } from '../types/item';

const itemService = {
  async getAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Promise<PaginatedResponse<Item>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    return apiService.get(`/items?${params.toString()}`);
  },

  async getById(id: string): Promise<ApiResponse<Item>> {
    return apiService.get(`/items/${id}`);
  },

  async create(data: ItemFormData): Promise<ApiResponse<Item>> {
    return apiService.post('/items', data);
  },

  async update(id: string, data: Partial<ItemFormData>): Promise<ApiResponse<Item>> {
    return apiService.patch(`/items/${id}`, data);
  },

  async remove(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/items/${id}`);
  },
};

export default itemService;
