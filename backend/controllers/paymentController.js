const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const createPaymentIntent = async (req, res) => {
  console.log("Creating payment intent with body:", req.body);
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      throw new Error('Amount and currency are required');
    }

    // Validate minimum amount for PKR (140 PKR ≈ $0.50 USD)
    if (currency.toLowerCase() === 'pkr' && amount < 14000) { // 14000 paisa = 140 PKR
      throw new Error('The minimum transaction amount for PKR is 140 PKR. Please increase the amount.');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });

    console.log('Payment Intent created:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
};