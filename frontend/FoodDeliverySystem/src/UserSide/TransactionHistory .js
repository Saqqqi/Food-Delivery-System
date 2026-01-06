import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Avatar
} from '@mui/material';
import { format } from 'date-fns';
import { CreditCard, Receipt, Payment } from '@mui/icons-material';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/orders/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch transactions');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getPaymentIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCard />;
      case 'paypal':
        return <Payment />;
      default:
        return <Receipt />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" style={{ padding: '2rem' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom style={{ marginBottom: '2rem' }}>
        Transaction History
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn._id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar style={{ marginRight: '1rem', backgroundColor: '#f5f5f5' }}>
                      {getPaymentIcon(txn.paymentDetails.method)}
                    </Avatar>
                    <div>
                      <Typography variant="body1">
                        {txn.paymentDetails.method === 'card' 
                          ? `Card ending in ${txn.paymentDetails.cardLast4}`
                          : txn.paymentDetails.method}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {txn.paymentDetails.transactionId}
                      </Typography>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={txn.paymentDetails.method}
                    variant="outlined"
                    icon={getPaymentIcon(txn.paymentDetails.method)}
                  />
                  {txn.paymentDetails.cardBrand && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      {txn.paymentDetails.cardBrand}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                    ${txn.totalAmount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {format(new Date(txn.paymentDetails.transactionDate), 'PPpp')}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={txn.status}
                    color={
                      txn.status === 'delivered' ? 'success' :
                      txn.status === 'cancelled' ? 'error' :
                      'primary'
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TransactionHistory;