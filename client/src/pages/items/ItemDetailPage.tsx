import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import itemService from '../../services/item.service';
import ItemForm from '../../components/items/ItemForm';
import { Item, ItemFormData } from '../../types/item';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  const isNew = !id || id === 'new';

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      itemService.getById(id)
        .then((res) => setItem(res.data))
        .catch((err) => console.error('Failed to fetch item:', err))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleSubmit = async (data: ItemFormData) => {
    setSaving(true);
    try {
      if (isNew) {
        await itemService.create(data);
      } else if (id) {
        await itemService.update(id, data);
      }
      navigate('/items');
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/items')}>
          Back
        </Button>
        <Typography variant="h4" fontWeight={600}>
          {isNew ? 'New Item' : item?.name || 'Item Detail'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <ItemForm
          initialData={item ? { name: item.name, description: item.description, status: item.status } : undefined}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </Paper>
    </Box>
  );
};

export default ItemDetailPage;
