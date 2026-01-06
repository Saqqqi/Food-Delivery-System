const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51RH8dIFzTlhdF43Nw4bjjutDYe4GlI0GrCPQIBMDOgl7xBnbb14rztbdZFQSKs1EAdOh2MRtGNNPHdJWjhCQngz300mUqMxkGO");

// Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "gbp", metadata = {} } = req.body;
    
    // Validate amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/pence
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;