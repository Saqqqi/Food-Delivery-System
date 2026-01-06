const categoryModel = require("../models/category");
require('dotenv').config();
const {
    validationResult
} = require("express-validator");

// Add a new category
async function addCategory(req, res) {
    try {
        const {
            name
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const newCat = new categoryModel({
            name
        });
        await newCat.save();

        res.status(201).json({
            message: 'Category added successfully'
        });
    } catch (err) {
        res.status(500).json({
            error: err.message || 'Server error'
        });
    }
}

// Get all categories
async function getCategory(req, res) {
    try {
        const categories = await categoryModel.find({});
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({
            error: err.message || 'Server error'
        });
    }
}

// Delete a category
async function deleteCategory(req, res) {
    const {
        id
    } = req.params;

    try {
        const deletedCategory = await categoryModel.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        res.status(200).json({
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

// Update a category
async function updateCategory(req, res) {
    const {
        id
    } = req.params;
    const {
        name
    } = req.body;

    try {
        const updatedCategory = await categoryModel.findByIdAndUpdate(
            id, {
                name
            }, {
                new: true
            }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        res.status(200).json({
            message: 'Category updated successfully',
            updatedCategory
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
}

module.exports = {
    addCategory,
    getCategory,
    deleteCategory,
    updateCategory
};