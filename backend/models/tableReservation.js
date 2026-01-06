const mongoose = require('mongoose');

const tableReservationSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: [true, 'Table number is required'],
        unique: true,
        trim: true
    },
    guests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: [1, 'At least 1 guest is required'],
        max: [12, 'Maximum 12 guests per table']
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'pending', 'cancelled'],
        default: 'available'
    },
    restaurantAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RestaurantDeliveryAddress',
        required: false
    },
    restaurantAddressDetails: {
        address: { type: String },
        restaurantName: { type: String },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    reservationDate: {
        type: Date,
        required: false
    },
    reservationTime: {
        type: String,
        required: false
    },
    customerName: {
        type: String,
        required: false,
        trim: true
    },
    customerEmail: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    customerPhone: {
        type: String,
        required: false,
        trim: true
    },
    specialRequests: {
        type: String,
        required: false,
        trim: true
    },
    videoLink: {
        type: String,
        required: false,
        trim: true,
        match: [/^https?:\/\/.+$/, 'Please provide a valid URL']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

tableReservationSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('tableNumber')) {
        this.tableNumber = `T${String(this.tableNumber).padStart(2, '0')}`;
    }
    next();
});

const TableReservation = mongoose.model('TableReservation', tableReservationSchema);

module.exports = TableReservation;