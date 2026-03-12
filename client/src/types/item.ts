export interface Item {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
}
