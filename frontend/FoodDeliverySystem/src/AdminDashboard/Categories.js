import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FaTrashAlt, FaPlus, FaEdit } from "react-icons/fa";

const API_URL = "http://localhost:3005/category";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      console.log(newCategory)
      await axios.post(API_URL, { name: newCategory });
      setNewCategory("");
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const handleEditClick = (category) => {
    setEditCategoryId(category._id);
    setEditCategoryName(category.name);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    if (editCategoryName.trim() === "") return;
    try {
      await axios.put(`${API_URL}/${editCategoryId}`, {
        name: editCategoryName,
      });
      setShowEditModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const currentPageCategories = Array.isArray(categories)
  ? categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  : [];


  return (
    <>
      <div className='container mx-auto p-6'>
        <div className="bg-gradient-to-b from-black to-slate-900 rounded-xl shadow-lg border border-yellow-500/30 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className='text-2xl font-bold text-yellow-500 font-serif'>Categories List</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className='flex items-center bg-blue-900/50 text-yellow-100 px-4 py-2 rounded-lg hover:bg-blue-800/70 border border-yellow-500/20 transition'
            >
              <FaPlus className='mr-2 text-yellow-400' /> Add Category
            </button>
          </div>

          <table className='w-full bg-gradient-to-b from-blue-900/30 to-black text-yellow-100 border border-yellow-500/20 rounded-lg overflow-hidden'>
            <thead className='bg-blue-900/50 text-yellow-400 border-b border-yellow-500/20'>
              <tr>
                <th className='p-3 text-left font-serif'>Name</th>
                <th className='p-3 text-left font-serif'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPageCategories.length < 1 ? (
                <tr>
                  <td colSpan='2' className='text-center p-4 text-yellow-400/60'>No Categories Found, Please Add Some...</td>
                </tr>
              ) : (
                currentPageCategories.map((category) => (
                  <tr key={category._id} className='border-b border-yellow-500/10 hover:bg-blue-900/20 transition'>
                    <td className='p-3'>{category.name}</td>
                    <td className='p-3'>
                      <button
                        onClick={() => handleEditClick(category)}
                        className='bg-yellow-800/40 text-yellow-300 px-3 py-1 rounded hover:bg-yellow-700/70 border border-yellow-600 transition mr-2'
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className='bg-red-900/40 text-red-300 px-3 py-1 rounded hover:bg-red-800/70 border border-red-800 transition'
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className='flex justify-between items-center mt-4 text-yellow-100'>
            <button
              className='px-3 py-1 bg-blue-900/40 border border-yellow-500/20 rounded hover:bg-blue-800/60 transition disabled:opacity-50'
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              className='px-3 py-1 bg-blue-900/40 border border-yellow-500/20 rounded hover:bg-blue-800/60 transition disabled:opacity-50'
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* Add Category Modal */}
        {showAddModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50'>
            <div className="bg-gradient-to-b from-black to-slate-900 border border-yellow-500/20 text-yellow-100 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center bg-blue-900/40 border-b border-yellow-500/20 p-4 rounded-t-lg">
                <h2 className="text-lg font-semibold text-yellow-400">Add Category</h2>
                <button onClick={() => setShowAddModal(false)} className="text-yellow-300 text-xl hover:text-yellow-100 transition">&times;</button>
              </div>
              <div className="p-4">
                <label className="block text-yellow-400 font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter category name"
                />
              </div>
              <div className="flex justify-end space-x-2 bg-blue-900/10 border-t border-yellow-500/20 p-4 rounded-b-lg">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-semibold"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50'>
          <div className="bg-gradient-to-b from-black to-slate-900 border border-yellow-500/20 text-yellow-100 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center bg-yellow-900/40 border-b border-yellow-500/20 p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold text-yellow-400">Edit Category</h2>
              <button onClick={() => setShowEditModal(false)} className="text-yellow-300 text-xl hover:text-yellow-100 transition">&times;</button>
            </div>
            <div className="p-4">
              <label className="block text-yellow-400 font-medium mb-2">Category Name</label>
              <input
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Edit category name"
              />
            </div>
            <div className="flex justify-end space-x-2 bg-blue-900/10 border-t border-yellow-500/20 p-4 rounded-b-lg">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-semibold"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;