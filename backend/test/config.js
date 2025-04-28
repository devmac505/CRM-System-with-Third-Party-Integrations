// Test configuration
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/crm-system-test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.PORT = 5001;

// Mock third-party API keys for testing
process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
process.env.MAILCHIMP_API_KEY = 'test_mailchimp_key';
process.env.MAILCHIMP_SERVER_PREFIX = 'test_prefix';
process.env.FACEBOOK_APP_ID = 'test_facebook_id';
process.env.FACEBOOK_APP_SECRET = 'test_facebook_secret';
