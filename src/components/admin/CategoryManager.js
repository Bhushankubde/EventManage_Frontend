import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';

export const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Items in this category might be affected.')) return;
    try {
      await api.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="glass-panel p-6 rounded-2xl border border-border group hover:border-primary/50 transition-colors flex flex-col h-full">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description || 'No description provided.'}
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenModal(category)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(category.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-muted rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground glass-panel rounded-2xl border border-dashed border-border">
            No categories found. Create one to organize your inventory!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form id="categoryForm" onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Audio Equipment"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Optional description..."
                ></textarea>
              </div>
            </form>
            
            <div className="p-6 border-t border-border flex justify-end space-x-4 bg-muted/30 rounded-b-2xl">
              <button 
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 rounded-lg border border-border hover:bg-muted font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="categoryForm"
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {editingCategory ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
