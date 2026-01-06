const mongoose = require('mongoose');


const subCategory = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});

const subCategoryModal = mongoose.model("subCategories", subCategory);

subCategoryModal.createCollection().then(function (collection) {
    console.log(`${collection.collectionName} is created`);
});

module.exports = subCategoryModal;
