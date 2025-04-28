const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : {
      paymentIntents: {
        create: () => { throw new Error('Stripe API key not configured'); },
        retrieve: () => { throw new Error('Stripe API key not configured'); }
      },
      customers: {
        create: () => { throw new Error('Stripe API key not configured'); }
      },
      subscriptions: {
        create: () => { throw new Error('Stripe API key not configured'); }
      },
      webhooks: {
        constructEvent: () => { throw new Error('Stripe API key not configured'); }
      }
    };

// Create a payment intent
exports.createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency,
      metadata
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    throw new Error(`Stripe payment error: ${error.message}`);
  }
};

// Retrieve a payment intent
exports.retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe retrieve payment error:', error);
    throw new Error(`Stripe retrieve payment error: ${error.message}`);
  }
};

// Create a customer in Stripe
exports.createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });

    return customer;
  } catch (error) {
    console.error('Stripe create customer error:', error);
    throw new Error(`Stripe create customer error: ${error.message}`);
  }
};

// Create a subscription
exports.createSubscription = async (customerId, priceId) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent']
    });

    return subscription;
  } catch (error) {
    console.error('Stripe create subscription error:', error);
    throw new Error(`Stripe create subscription error: ${error.message}`);
  }
};

// Handle Stripe webhook events
exports.handleWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // Update order status in database
        return { success: true, paymentIntent };

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        console.log(`PaymentIntent for ${failedPaymentIntent.amount} failed.`);
        // Update order status in database
        return { success: false, paymentIntent: failedPaymentIntent };

      default:
        console.log(`Unhandled event type ${event.type}`);
        return { success: true, message: `Unhandled event type ${event.type}` };
    }
  } catch (error) {
    console.error('Stripe webhook error:', error);
    throw new Error(`Stripe webhook error: ${error.message}`);
  }
};
