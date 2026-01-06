const TableReservation = require('../models/tableReservation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const STATUS_FLOW = {
    available: ['reserved', 'maintenance'],
    reserved: ['booked', 'available'],
    booked: ['completed', 'cancelled'],
    maintenance: ['available'],
    pending: ['booked', 'cancelled'],
    cancelled: ['available'],
    completed: ['available']
};

exports.createTable = catchAsync(async (req, res, next) => {
    console.log('Request body:', req.body);
    
    const { tableNumber, guests, status = 'available', restaurantAddress, restaurantAddressDetails, videoLink } = req.body;
    
    let parsedAddressDetails;
    try {
        if (restaurantAddressDetails) {
            parsedAddressDetails = JSON.parse(restaurantAddressDetails);
        }
    } catch (error) {
        console.error('Error parsing restaurantAddressDetails:', error);
    }

    console.log('Parsed data:', { tableNumber, guests, status, restaurantAddress, videoLink });

    if (!tableNumber || !guests) {
        return next(new AppError('Table number and guests are required', 400));
    }

    const existingTable = await TableReservation.findOne({ tableNumber });
    if (existingTable) {
        return next(new AppError('A table with this number already exists', 400));
    }

    const newTable = await TableReservation.create({
        tableNumber,
        guests: parseInt(guests),
        status,
        restaurantAddress,
        restaurantAddressDetails: parsedAddressDetails,
        videoLink // Make sure this is being saved
    });
    
    // Log the created table to verify videoLink is saved
    console.log('Created table with videoLink:', newTable.videoLink);

    res.status(201).json({
        status: 'success',
        data: { table: newTable }
    });
});

exports.getAllTables = catchAsync(async (req, res, next) => {
    console.log('table Request Headers:', req.headers);
    
    const { restaurantAddress, restaurantAddressDetails, status } = req.query;
    let query = {};
    
    if (restaurantAddress) query.restaurantAddress = restaurantAddress;
    if (restaurantAddressDetails) query.restaurantAddressDetails = restaurantAddressDetails;
    if (status) query.status = status;
    
    // Explicitly select all fields including videoLink
    const tables = await TableReservation.find(query).select('+videoLink').sort({ tableNumber: 1 });

    res.status(200).json({
        status: 'success',
        results: tables.length,
        data: { tables }
    });
});

exports.updateTableStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const table = await TableReservation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!table) {
        return next(new AppError('No table found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { table }
    });
});

exports.getTablesByStatus = catchAsync(async (req, res, next) => {
    const { status, restaurantAddress, restaurantAddressDetails } = req.query;
    let query = {};

    if (status) query.status = status;
    if (restaurantAddress) query.restaurantAddress = restaurantAddress;
    if (restaurantAddressDetails) query.restaurantAddressDetails = restaurantAddressDetails;

    // Explicitly select all fields including videoLink
    const tables = await TableReservation.find(query).select('+videoLink').sort({ tableNumber: 1 });

    res.status(200).json({
        status: 'success',
        results: tables.length,
        data: { tables }
    });
});

exports.makeReservation = catchAsync(async (req, res, next) => {
    const { tableId, reservationDate, reservationTime, guests, customerName, customerEmail, customerPhone, specialRequests } = req.body;

    const table = await TableReservation.findById(tableId);

    if (!table) {
        return next(new AppError('No table found with that ID', 404));
    }

    if (table.status !== 'available') {
        return next(new AppError('This table is not available for reservation', 400));
    }

    table.status = 'pending';
    table.reservationDate = reservationDate;
    table.reservationTime = reservationTime;
    table.guests = guests;
    table.customerName = customerName;
    table.customerEmail = customerEmail;
    table.customerPhone = customerPhone;
    table.specialRequests = specialRequests;
    table.requestedAt = Date.now();

    await table.save();

    res.status(200).json({
        status: 'success',
        message: 'Reservation request submitted. Waiting for confirmation.',
        data: { reservation: table }
    });
});

exports.updateReservationStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;

    const table = await TableReservation.findById(id);

    if (!table) {
        return next(new AppError('No reservation found with that ID', 404));
    }

    const allowedStatuses = STATUS_FLOW[table.status] || [];
    if (!allowedStatuses.includes(status)) {
        return next(new AppError(`Cannot change status from ${table.status} to ${status}`, 400));
    }

    table.status = status;
    if (status === 'booked') table.confirmedAt = Date.now();
    else if (status === 'cancelled') table.cancelledAt = Date.now();
    else if (status === 'completed') table.completedAt = Date.now();

    await table.save();

    res.status(200).json({
        status: 'success',
        message: `Reservation ${status} successfully`,
        data: { reservation: table }
    });
});

exports.deleteTable = catchAsync(async (req, res, next) => {
    const table = await TableReservation.findByIdAndDelete(req.params.id);

    if (!table) {
        return next(new AppError('No table found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});