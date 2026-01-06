import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Select, MenuItem, InputLabel, FormControl, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Tooltip, Fade, Zoom, Snackbar, Alert, CircularProgress,
  Chip, Divider, Grid
} from '@mui/material';
import { Add, Delete, TableBar, Edit, Info, CalendarMonth, AccessTime, Person, Email, Phone, Comment } from '@mui/icons-material';
import axios from 'axios';

const TableReservations = () => {
  const [state, setState] = useState({
    open: false,
    tableNumber: '',
    guests: '',
    status: 'available',
    reservations: [],
    loading: true,
    error: null,
    snackbar: { open: false, message: '', severity: 'success' },
    editMode: false,
    currentTableId: null,
    deleteConfirmOpen: false,
    tableToDelete: null,
    reservationDetailsOpen: false,
    selectedReservation: null,
    restaurantAddresses: [],
    selectedAddress: null,
    loadingAddresses: false,
    filterRestaurant: '',
    videoLink: ''
  });

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'http://localhost:3005/api/table-reservations'
    : 'http://localhost:3005/api/table-reservations';

  const dialogStyles = {
    paper: { background: 'linear-gradient(145deg, #1e1e1e, #121212)', color: '#fff', borderRadius: '16px', minWidth: { xs: '90%', sm: '400px' }, maxWidth: '500px', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)' },
    title: { backgroundColor: '#1e1e1e', color: '#FFD700', fontWeight: 600, fontSize: '1.5rem', borderBottom: '1px solid #FFD700', py: 2, display: 'flex', alignItems: 'center', gap: 1 },
    actions: { backgroundColor: '#1e1e1e', p: 2, borderTop: '1px solid #FFD700', '& .MuiButton-root': { textTransform: 'none', fontWeight: 600, px: 3, py: 1, borderRadius: '8px' } }
  };

  const fetchTables = async () => {
    try {
      setState(s => ({ ...s, loading: true }));
      const token = localStorage.getItem('token');
      const url = state.filterRestaurant ? `${API_URL}?restaurantAddress=${state.filterRestaurant}` : API_URL;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setState(s => ({ ...s, reservations: response.data.data.tables || [], error: null, loading: false }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load tables.';
      setState(s => ({ ...s, error: message, snackbar: { open: true, message, severity: 'error' }, loading: false }));
    }
  };

  const fetchRestaurantAddresses = async () => {
    setState(s => ({ ...s, loadingAddresses: true }));
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NODE_ENV === 'production' ? 'http://localhost:3005' : 'http://localhost:3005';
      const response = await axios.get(`${baseUrl}/api/restaurant-delivery-addresses`, { headers: { Authorization: `Bearer ${token}` } });
      setState(s => ({ ...s, restaurantAddresses: response.data, loadingAddresses: false }));
    } catch (error) {
      setState(s => ({ ...s, loadingAddresses: false }));
    }
  };

  useEffect(() => {
    fetchTables();
    fetchRestaurantAddresses();
  }, []);

  useEffect(() => {
    if (state.filterRestaurant) fetchTables();
  }, [state.filterRestaurant]);

  const handleOpen = (table = null) => {
    setState(s => ({
      ...s,
      open: true,
      editMode: !!table,
      currentTableId: table?._id || null,
      tableNumber: table ? table.tableNumber.substring(1) : '',
      guests: table ? table.guests : '',
      status: table ? table.status : 'available',
      selectedAddress: table?.restaurantAddress ? s.restaurantAddresses.find(addr => addr._id === table.restaurantAddress) : null,
      videoLink: table?.videoLink || ''
    }));
  };

  const handleClose = () => {
    setState(s => ({
      ...s,
      open: false,
      tableNumber: '',
      guests: '',
      status: 'available',
      selectedAddress: null,
      editMode: false,
      currentTableId: null,
      videoLink: ''
    }));
  };

  const handleAddReservation = async () => {
    const { tableNumber, guests, status, selectedAddress, editMode, currentTableId, videoLink } = state;
    if (!tableNumber || !guests || (!editMode && !selectedAddress)) {
      setState(s => ({ ...s, snackbar: { open: true, message: 'Please fill all required fields', severity: 'error' } }));
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('tableNumber', `T${tableNumber}`);
      formData.append('guests', parseInt(guests));
      formData.append('status', status);
      if (selectedAddress) {
        formData.append('restaurantAddress', selectedAddress._id);
        formData.append('restaurantAddressDetails', JSON.stringify({
          address: selectedAddress.address,
          restaurantName: selectedAddress.restaurantName,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude
        }));
      }
      formData.append('videoLink', videoLink);

      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      editMode && currentTableId
        ? await axios.patch(`${API_URL}/${currentTableId}`, formData, config)
        : await axios.post(API_URL, formData, config);

      setState(s => ({ ...s, snackbar: { open: true, message: editMode ? 'Table updated!' : 'Table added!', severity: 'success' } }));
      fetchTables();
      handleClose();
    } catch (err) {
      setState(s => ({ ...s, snackbar: { open: true, message: err.response?.data?.message || 'Failed to save table.', severity: 'error' } }));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const reservation = state.reservations.find(r => r._id === id);
      const addressToUse = state.selectedAddress || reservation?.restaurantAddressDetails;
      await axios.patch(`${API_URL}/${id}`, {
        status: newStatus,
        restaurantAddress: state.selectedAddress ? state.selectedAddress._id : reservation?.restaurantAddress,
        restaurantAddressDetails: addressToUse ? {
          address: addressToUse.address,
          restaurantName: addressToUse.restaurantName,
          latitude: addressToUse.latitude,
          longitude: addressToUse.longitude
        } : reservation?.restaurantAddressDetails
      }, { headers: { Authorization: `Bearer ${token}` } });

      setState(s => ({
        ...s,
        reservations: s.reservations.map(r => r._id === id ? {
          ...r,
          status: newStatus,
          restaurantAddress: state.selectedAddress ? state.selectedAddress._id : r.restaurantAddress,
          restaurantAddressDetails: state.selectedAddress ? {
            address: state.selectedAddress.address,
            restaurantName: state.selectedAddress.restaurantName,
            latitude: state.selectedAddress.latitude,
            longitude: state.selectedAddress.longitude
          } : r.restaurantAddressDetails
        } : r),
        snackbar: { open: true, message: 'Status updated!', severity: 'success' }
      }));
    } catch (err) {
      setState(s => ({ ...s, snackbar: { open: true, message: err.response?.data?.message || 'Failed to update status.', severity: 'error' } }));
    }
  };

  const handleDelete = async () => {
    if (!state.tableToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${state.tableToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setState(s => ({
        ...s,
        reservations: s.reservations.filter(r => r._id !== state.tableToDelete.id),
        snackbar: { open: true, message: 'Table deleted!', severity: 'success' },
        deleteConfirmOpen: false,
        tableToDelete: null
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        snackbar: { open: true, message: err.response?.data?.message || 'Failed to delete table.', severity: 'error' },
        deleteConfirmOpen: false
      }));
    }
  };

  const getStatusColor = status => ({
    available: '#4caf50',
    booked: '#1976d2',
    pending: '#ff9800',
    cancelled: '#d32f2f'
  }[status] || '#ffffff');

  const getStatusText = status => ({
    available: 'Available',
    booked: 'Confirmed',
    pending: 'Pending Approval',
    cancelled: 'Cancelled'
  }[status] || status.charAt(0).toUpperCase() + status.slice(1));

  const { open, tableNumber, guests, status, reservations, loading, error, snackbar, editMode,
    deleteConfirmOpen, tableToDelete, reservationDetailsOpen, selectedReservation,
    restaurantAddresses, selectedAddress, loadingAddresses, filterRestaurant, videoLink } = state;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#121212', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, p: 3, background: 'linear-gradient(145deg, #1e1e1e, #121212)', borderRadius: '12px', border: '1px solid #FFD700', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)' }}>
          <Typography variant="h3" sx={{ color: '#FFD700', fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}><TableBar sx={{ mr: 1 }} /> Table Reservations</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: { xs: 2, sm: 0 } }}>
            <FormControl sx={{ minWidth: 200, backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
              <InputLabel sx={{ color: '#FFD700' }}>Filter by Restaurant</InputLabel>
              <Select value={filterRestaurant} onChange={e => setState(s => ({ ...s, filterRestaurant: e.target.value }))} label="Filter by Restaurant" sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' } }}>
                <MenuItem value="">All Restaurants</MenuItem>
                {restaurantAddresses.map(address => (
                  <MenuItem key={address._id} value={address._id}>{address.restaurantName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" sx={{ backgroundColor: '#FFD700', color: '#121212', fontWeight: 600, borderRadius: '8px', textTransform: 'none', '&:hover': { backgroundColor: '#FFC107' } }} startIcon={<Add />} onClick={() => handleOpen()}>
              Add New Table
            </Button>
          </Box>
        </Box>

        {reservations.filter(r => r.status === 'pending' && r.customerName).length > 0 && (
          <Box sx={{ p: 3, background: 'linear-gradient(145deg, #332700, #2a2000)', borderRadius: '12px', border: '1px solid #ff9800', mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}><Info sx={{ mr: 1 }} /> Pending Reservations</Typography>
            <Typography sx={{ color: '#fff', mb: 2 }}>You have {reservations.filter(r => r.status === 'pending' && r.customerName).length} pending reservation(s).</Typography>
            {reservations.filter(r => r.status === 'pending' && r.customerName).map(reservation => (
              <Box key={reservation._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 152, 0, 0.15)', borderRadius: '8px', p: 2, mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>Table {reservation.tableNumber} - {reservation.customerName}</Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>{new Date(reservation.reservationDate).toLocaleDateString()} at {reservation.reservationTime} • {reservation.guests} guests</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => handleStatusChange(reservation._id, 'cancelled')} sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}>Reject</Button>
                  <Button variant="contained" size="small" onClick={() => handleStatusChange(reservation._id, 'booked')} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}>Approve</Button>
                  <Button variant="outlined" size="small" onClick={() => setState(s => ({ ...s, selectedReservation: reservation, reservationDetailsOpen: true }))} sx={{ borderColor: '#ff9800', color: '#ff9800', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.1)' } }}>Details</Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress sx={{ color: '#FFD700' }} /></Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: 'center', color: '#ff4444' }}>
          <Typography variant="h6">{error}</Typography>
          <Button variant="outlined" sx={{ mt: 2, color: '#FFD700', borderColor: '#FFD700' }} onClick={fetchTables}>Try Again</Button>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ background: 'linear-gradient(145deg, #1e1e1e, #121212)', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                {['Table Number', 'Guests', 'Status', 'Restaurant', 'Reservation Info', 'Actions'].map((header, idx) => (
                  <TableCell key={idx} align={idx < 5 ? 'left' : 'right'} sx={{ color: '#FFD700', fontWeight: 600, fontSize: '1.1rem', py: 3 }}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', color: '#fff', py: 3 }}>No tables found. Add a new table to get started.</TableCell></TableRow>
              ) : (
                reservations.map(reservation => (
                  <Fade key={reservation._id} in>
                    <TableRow sx={{ backgroundColor: '#1a1a1a', '&:hover': { backgroundColor: '#2a2a2a', transform: 'translateY(-2px)' } }}>
                      <TableCell sx={{ color: '#fff', fontSize: '1rem', py: 2.5, borderBottom: '1px solid #333' }}>{reservation.tableNumber}</TableCell>
                      <TableCell align="center" sx={{ color: '#fff', fontSize: '1rem', py: 2.5, borderBottom: '1px solid #333' }}>{reservation.guests}</TableCell>
                      <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                        <Select value={reservation.status} onChange={e => handleStatusChange(reservation._id, e.target.value)} size="small" sx={{ minWidth: 120, color: '#fff', backgroundColor: getStatusColor(reservation.status), borderRadius: '8px', fontWeight: 500, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                          {['available', 'booked', 'pending', 'cancelled'].map(s => <MenuItem key={s} value={s} sx={{ color: '#121212' }}>{getStatusText(s)}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#fff', fontSize: '0.9rem', py: 2.5, borderBottom: '1px solid #333' }}>{reservation.restaurantAddressDetails?.restaurantName || 'Not specified'}</TableCell>
                      <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                        {reservation.status === 'booked' || reservation.customerName ? (
                          <Tooltip title="View Reservation Details"><IconButton onClick={() => setState(s => ({ ...s, selectedReservation: reservation, reservationDetailsOpen: true }))} sx={{ color: '#4caf50' }}><Info /></IconButton></Tooltip>
                        ) : (
                          <Chip label="No Reservation" size="small" sx={{ backgroundColor: '#333', color: '#aaa', fontSize: '0.75rem' }} />
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                        <Tooltip title="Edit Table"><IconButton onClick={() => handleOpen(reservation)} sx={{ color: '#FFD700', mr: 1 }} aria-label="Edit table"><Edit /></IconButton></Tooltip>
                        <Tooltip title="Delete Table"><IconButton onClick={() => setState(s => ({ ...s, tableToDelete: { id: reservation._id, tableNumber: reservation.tableNumber }, deleteConfirmOpen: true }))} sx={{ color: '#ff4444' }} aria-label="Delete table"><Delete /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} TransitionComponent={Zoom} transitionDuration={300} PaperProps={{ sx: dialogStyles.paper }}>
        <DialogTitle sx={dialogStyles.title}><TableBar /> {editMode ? 'Edit Table' : 'Add New Table'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Table Number" type="number" value={tableNumber} onChange={e => setState(s => ({ ...s, tableNumber: e.target.value }))} fullWidth margin="normal" inputProps={{ min: 1 }} variant="outlined" disabled={editMode} helperText={editMode ? "Table number cannot be changed" : ""} sx={{ backgroundColor: '#1a1a1a', borderRadius: '8px', '& .MuiInputLabel-root': { color: '#FFD700' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' }, '&:hover fieldset': { borderColor: '#FFD700' } }, '& .MuiInputBase-input': { color: '#fff' } }} />
            <TextField label="Number of Guests" type="number" value={guests} onChange={e => setState(s => ({ ...s, guests: e.target.value }))} fullWidth margin="normal" inputProps={{ min: 1, max: 12 }} variant="outlined" disabled={editMode} helperText={editMode ? "Guest count cannot be changed" : ""} sx={{ backgroundColor: '#1a1a1a', borderRadius: '8px', '& .MuiInputLabel-root': { color: '#FFD700' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' }, '&:hover fieldset': { borderColor: '#FFD700' } }, '& .MuiInputBase-input': { color: '#fff' } }} />
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: '#FFD700' }}>Status</InputLabel>
              <Select value={status} label="Status" onChange={e => setState(s => ({ ...s, status: e.target.value }))} sx={{ color: '#fff', backgroundColor: '#1a1a1a', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' } }}>
                {['available', 'booked', 'pending', 'cancelled'].map(s => <MenuItem key={s} value={s}>{getStatusText(s)}</MenuItem>)}
              </Select>
            </FormControl>
            {!editMode && (
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: '#FFD700' }}>Restaurant Address</InputLabel>
                <Select value={selectedAddress?._id || ''} label="Restaurant Address" onChange={e => setState(s => ({ ...s, selectedAddress: restaurantAddresses.find(addr => addr._id === e.target.value) }))} disabled={loadingAddresses} sx={{ color: '#fff', backgroundColor: '#1a1a1a', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' } }}>
                  {loadingAddresses ? <MenuItem value="">Loading addresses...</MenuItem> : restaurantAddresses.map(address => <MenuItem key={address._id} value={address._id}>{address.restaurantName} - {address.address}</MenuItem>)}
                </Select>
              </FormControl>
            )}
            <TextField label="3D Video Link" value={videoLink} onChange={e => setState(s => ({ ...s, videoLink: e.target.value }))} fullWidth margin="normal" variant="outlined" helperText="Enter a URL for the 3D video" sx={{ backgroundColor: '#1a1a1a', borderRadius: '8px', '& .MuiInputLabel-root': { color: '#FFD700' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' }, '&:hover fieldset': { borderColor: '#FFD700' } }, '& .MuiInputBase-input': { color: '#fff' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={dialogStyles.actions}>
          <Button onClick={handleClose} sx={{ color: '#fff' }}>Cancel</Button>
          <Button onClick={handleAddReservation} variant="contained" sx={{ backgroundColor: '#FFD700', color: '#121212', '&:hover': { backgroundColor: '#FFC107' } }}>{editMode ? 'Save Changes' : 'Add Table'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setState(s => ({ ...s, snackbar: { ...s.snackbar, open: false } }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setState(s => ({ ...s, snackbar: { ...s.snackbar, open: false } }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      <Dialog open={deleteConfirmOpen} onClose={() => setState(s => ({ ...s, deleteConfirmOpen: false }))} TransitionComponent={Zoom} transitionDuration={300} PaperProps={{ sx: { ...dialogStyles.paper, border: '1px solid #ff4444', boxShadow: '0 8px 32px rgba(255, 68, 68, 0.2)' } }}>
        <DialogTitle sx={{ ...dialogStyles.title, color: '#ff4444', borderBottom: '1px solid #ff4444' }}><Delete /> Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography sx={{ color: '#fff', mb: 2 }}>Are you sure you want to delete table <strong>{tableToDelete?.tableNumber}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ ...dialogStyles.actions, borderTop: '1px solid #ff4444' }}>
          <Button onClick={() => setState(s => ({ ...s, deleteConfirmOpen: false }))} sx={{ color: '#fff' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ backgroundColor: '#ff4444', '&:hover': { backgroundColor: '#d32f2f' } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reservationDetailsOpen} onClose={() => setState(s => ({ ...s, reservationDetailsOpen: false }))} TransitionComponent={Zoom} transitionDuration={300} PaperProps={{ sx: { ...dialogStyles.paper, border: '1px solid #4caf50', boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)', maxWidth: '600px' } }}>
        <DialogTitle sx={{ ...dialogStyles.title, color: '#4caf50', borderBottom: '1px solid #4caf50' }}><Info /> Reservation Details</DialogTitle>
        {selectedReservation && (
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, display: 'flex', alignItems: 'center' }}><TableBar sx={{ mr: 1 }} /> Table Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography sx={{ color: '#aaa', mb: 1 }}>Table Number:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.tableNumber}</Typography></Grid>
                <Grid item xs={6}><Typography sx={{ color: '#aaa', mb: 1 }}>Capacity:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.guests} {selectedReservation.guests > 1 ? 'guests' : 'guest'}</Typography></Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: '#aaa', mb: 1 }}>Status:</Typography>
                  <Select value={selectedReservation.status} onChange={e => { handleStatusChange(selectedReservation._id, e.target.value); setState(s => ({ ...s, selectedReservation: { ...s.selectedReservation, status: e.target.value } })); }} size="small" fullWidth sx={{ color: '#fff', backgroundColor: getStatusColor(selectedReservation.status), borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>
                    {['available', 'booked', 'pending', 'cancelled'].map(s => <MenuItem key={s} value={s} sx={{ color: '#121212' }}>{getStatusText(s)}</MenuItem>)}
                  </Select>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 3, borderColor: '#333' }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, display: 'flex', alignItems: 'center' }}><TableBar sx={{ mr: 1 }} /> Restaurant Location</Typography>
              <Grid container spacing={2}>
                {selectedReservation.status === 'pending' ? (
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#FFD700' }}>Restaurant Address</InputLabel>
                      <Select value={selectedAddress?._id || selectedReservation.restaurantAddress || ''} label="Restaurant Address" onChange={e => setState(s => ({ ...s, selectedAddress: restaurantAddresses.find(addr => addr._id === e.target.value) }))} disabled={loadingAddresses} sx={{ color: '#fff', backgroundColor: '#1a1a1a', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' } }}>
                        {loadingAddresses ? <MenuItem value="">Loading addresses...</MenuItem> : restaurantAddresses.map(address => <MenuItem key={address._id} value={address._id}>{address.restaurantName} - {address.address}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12}><Typography sx={{ color: '#aaa', mb: 1 }}>Restaurant Name:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.restaurantAddressDetails?.restaurantName || 'Not provided'}</Typography></Grid>
                    <Grid item xs={12}><Typography sx={{ color: '#aaa', mb: 1 }}>Address:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.restaurantAddressDetails?.address || 'Not provided'}</Typography></Grid>
                  </>
                )}
              </Grid>
            </Box>
            <Divider sx={{ my: 3, borderColor: '#333' }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#4caf50', mb: 2, display: 'flex', alignItems: 'center' }}><Person sx={{ mr: 1 }} /> Customer Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><Typography sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center' }}><Person fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /> Name:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.customerName || 'Not provided'}</Typography></Grid>
                <Grid item xs={6}><Typography sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center' }}><Email fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /> Email:</Typography><Typography sx={{ color: '#fff', fontWeight: 500, wordBreak: 'break-all' }}>{selectedReservation.customerEmail || 'Not provided'}</Typography></Grid>
                <Grid item xs={6}><Typography sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center' }}><Phone fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /> Phone:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.customerPhone || 'Not provided'}</Typography></Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 3, borderColor: '#333' }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#1976d2', mb: 2, display: 'flex', alignItems: 'center' }}><CalendarMonth sx={{ mr: 1 }} /> Reservation Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center' }}><CalendarMonth fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /> Date:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.reservationDate ? new Date(selectedReservation.reservationDate).toLocaleDateString() : 'Not provided'}</Typography></Grid>
                <Grid item xs={6}><Typography sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center' }}><AccessTime fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /> Time:</Typography><Typography sx={{ color: '#fff', fontWeight: 500 }}>{selectedReservation.reservationTime || 'Not provided'}</Typography></Grid>
                <Grid item xs={12}><Typography sx={{ color: '#aaa', mb: 1, display: 'flex', alignItems: 'center' }}><Comment fontSize="small" sx={{ mr: 1, opacity: 0.7 }} /> Special Requests:</Typography><Typography sx={{ color: '#fff', fontWeight: 500, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', minHeight: '60px' }}>{selectedReservation.specialRequests || 'No special requests'}</Typography></Grid>
              </Grid>
            </Box>
            {selectedReservation.videoLink && (
              <Box sx={{ mb: 3 }}>
                <Divider sx={{ my: 3, borderColor: '#333' }} />
                <Typography variant="h6" sx={{ color: '#2196f3', mb: 2, display: 'flex', alignItems: 'center' }}><CalendarMonth sx={{ mr: 1 }} /> 3D Video</Typography>
                <Button variant="outlined" href={selectedReservation.videoLink} target="_blank" sx={{ color: '#2196f3', borderColor: '#2196f3' }}>View 3D Video</Button>
              </Box>
            )}
          </DialogContent>
        )}
        <DialogActions sx={{ ...dialogStyles.actions, borderTop: '1px solid #4caf50', flexWrap: 'wrap', gap: 1 }}>
          {selectedReservation?.status === 'pending' && (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', mb: 2, gap: 2 }}>
              <Button onClick={() => { handleStatusChange(selectedReservation._id, 'cancelled'); setState(s => ({ ...s, selectedReservation: { ...s.selectedReservation, status: 'cancelled' } })); }} variant="contained" sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' }, flex: 1 }}>Reject Reservation</Button>
              <Button onClick={() => { handleStatusChange(selectedReservation._id, 'booked'); setState(s => ({ ...s, selectedReservation: { ...s.selectedReservation, status: 'booked' } })); }} variant="contained" sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' }, flex: 1 }}>Approve Reservation</Button>
            </Box>
          )}
          <Button onClick={() => setState(s => ({ ...s, reservationDetailsOpen: false }))} variant="outlined" sx={{ color: '#fff', borderColor: '#4caf50', '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' } }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TableReservations;