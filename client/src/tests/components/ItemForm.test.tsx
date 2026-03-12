import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemForm from '../../components/items/ItemForm';

describe('ItemForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<ItemForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText('Create Item')).toBeInTheDocument();
  });

  it('should show "Update Item" when initialData is provided', () => {
    render(
      <ItemForm
        initialData={{ name: 'Test', description: 'Desc', status: 'active' }}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Update Item')).toBeInTheDocument();
  });

  it('should call onSubmit with form data', () => {
    render(<ItemForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Item' } });

    const submitButton = screen.getByText('Create Item');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Item' })
    );
  });

  it('should disable submit when saving', () => {
    render(<ItemForm onSubmit={mockOnSubmit} saving={true} />);

    expect(screen.getByText('Saving...')).toBeDisabled();
  });
});
