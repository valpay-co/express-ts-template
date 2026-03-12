import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ItemFormData } from '../../types/item';

interface ItemFormProps {
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => void;
  saving?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ initialData, onSubmit, saving }) => {
  const [formData, setFormData] = useState<ItemFormData>(
    initialData || { name: '', description: '', status: 'active' }
  );

  const handleChange = (field: keyof ItemFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        fullWidth
        multiline
        rows={3}
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
          value={formData.status}
          label="Status"
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </Select>
      </FormControl>
      <Box mt={3}>
        <Button type="submit" variant="contained" disabled={saving || !formData.name}>
          {saving ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </Box>
    </Box>
  );
};

export default ItemForm;
