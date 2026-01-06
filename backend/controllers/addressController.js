const addressModel = require("../models/address");
require('dotenv').config();

async function addAddress(req, res) {
    const { user_id, house_no, street, city, postcode, instructions } = req.body;

    try {
        let existingAddress = await addressModel.findOne({ user_id });

        if (existingAddress) {
            existingAddress.house_no = house_no;
            existingAddress.street = street;
            existingAddress.city = city;
            existingAddress.postcode = postcode;
            existingAddress.instructions = instructions;

            const updatedAddress = await existingAddress.save();
            return res.status(200).json(updatedAddress);
        }

        const newAddress = new addressModel({
            user_id,
            house_no,
            street,
            city,
            postcode,
            instructions
        });

        const savedAddress = await newAddress.save();
        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAddress(req, res) {
    try {
        const { user_id } = req.params;
        const address = await addressModel.findOne({ user_id });

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    addAddress,
    getAddress
};