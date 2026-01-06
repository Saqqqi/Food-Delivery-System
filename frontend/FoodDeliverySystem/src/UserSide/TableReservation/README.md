# Table Reservation Feature

## Overview
The Table Reservation feature allows users to view available tables at the restaurant, check their capacity, and make reservations online. Users can select a date and time, specify the number of guests, and provide their contact information to complete a reservation.

## Features
- View all tables with their availability status
- Filter tables by capacity and availability
- Make reservations by selecting an available table
- Fill out a reservation form with personal details
- Receive confirmation of successful reservations

## How to Use

### For Users
1. Navigate to the Table Reservation page from the main navigation menu
2. Browse the list of available tables
3. Click on an available table to make a reservation
4. Fill out the reservation form with:
   - Date and time of reservation
   - Number of guests
   - Your name
   - Email address
   - Phone number
   - Any special requests
5. Submit the form to complete your reservation

### For Developers

#### Frontend Components
- `TableReservation.js`: Main component for the table reservation page
- `TableReservation.css`: Styling for the table reservation components

#### Backend Integration
- API endpoint: `http://localhost:3005/api/table-reservations`
- Reservation endpoint: `http://localhost:3005/api/table-reservations/reserve`

#### Data Model
The table reservation system uses the following data model:

```javascript
{
  tableNumber: String,
  guests: Number,
  status: String, // 'available', 'booked', 'pending', 'cancelled'
  reservationDate: Date,
  reservationTime: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  specialRequests: String
}
```

## Future Enhancements
- Add ability to modify or cancel existing reservations
- Implement email notifications for reservation confirmations
- Add calendar view for selecting reservation dates
- Implement time slot availability checking
- Add admin dashboard for managing reservations