const express = require('express');
const Order = require('../models/Order');
const { handleWebhookEvent } = require('../integrations/stripe');

// Initialize Stripe with fallback for testing
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : {
      webhooks: {
        constructEvent: () => { throw new Error('Stripe API key not configured'); }
      }
    };

const router = express.Router();

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    const result = await handleWebhookEvent(event);

    // Update order if payment was successful
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Find order by Stripe payment ID
      const order = await Order.findOne({ stripePaymentId: paymentIntent.id });

      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
      }
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true, result });
  } catch (error) {
    console.error(`Webhook handler failed: ${error.message}`);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;
