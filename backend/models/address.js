const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    house_no: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postcode: {
        type: String,
        required: true
    },
    instructions: {
        type: String
    }
}, {
    timestamps: true
});

const AddressModel = mongoose.model("Address", addressSchema);

module.exports = AddressModel;