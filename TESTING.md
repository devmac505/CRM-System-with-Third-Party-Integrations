# Testing Guide for CRM System

This document provides instructions for testing the CRM system with third-party integrations.

## Backend Testing

The backend uses Mocha and Chai for unit and integration testing.

### Running Backend Tests

1. Navigate to the backend directory:
```
cd backend
```

2. Run the tests:
```
npm test
```

3. Run tests with coverage:
```
npm run test:coverage
```

### Test Files

- `auth.test.js` - Tests for authentication endpoints
- `customer.test.js` - Tests for customer management
- `lead.test.js` - Tests for lead management
- `order.test.js` - Tests for order processing with Stripe integration

## Frontend Testing

The frontend uses Cypress for end-to-end testing.

### Running Cypress Tests

1. Navigate to the frontend directory:
```
cd frontend
```

2. Open Cypress Test Runner:
```
npm run cypress:open
```

3. Run all tests in headless mode:
```
npm run cypress:run
```

### Test Files

- `auth.cy.js` - Tests for user authentication flows
- `customers.cy.js` - Tests for customer management
- `leads.cy.js` - Tests for lead management and sales pipeline
- `orders.cy.js` - Tests for order processing and payment
- `campaigns.cy.js` - Tests for email campaign management

## Manual Testing Checklist

### Authentication
- [ ] User registration
- [ ] User login
- [ ] Password validation
- [ ] Role-based access control

### Customer Management
- [ ] Create new customer
- [ ] View customer details
- [ ] Update customer information
- [ ] Delete customer
- [ ] Search and filter customers

### Lead Management
- [ ] Create new lead
- [ ] Track lead through sales pipeline
- [ ] Add interactions to lead
- [ ] Convert lead to customer
- [ ] View sales pipeline visualization

### Order Processing
- [ ] Create new order
- [ ] Add products to order
- [ ] Process payment with Stripe
- [ ] Update order status
- [ ] View order history

### Campaign Management
- [ ] Create email campaign
- [ ] Select audience for campaign
- [ ] Design email content
- [ ] Schedule campaign
- [ ] Send campaign via Mailchimp
- [ ] View campaign metrics

### Third-Party Integrations
- [ ] Stripe payment processing
- [ ] Mailchimp email marketing
- [ ] Facebook social media interaction

## Testing Environment Setup

### Backend Testing Environment
- Create a `.env.test` file in the backend directory with test credentials
- Use a separate test database to avoid affecting production data

### Frontend Testing Environment
- Create test fixtures in `cypress/fixtures` directory
- Use mock API responses for third-party services

## Troubleshooting Common Issues

### Backend Tests
- Ensure MongoDB is running locally or use the mock database
- Check that all environment variables are set correctly
- Verify that third-party API keys are valid (or properly mocked)

### Frontend Tests
- Make sure the backend server is running during end-to-end tests
- Check browser console for JavaScript errors
- Verify that selectors in Cypress tests match the actual DOM elements

## Continuous Integration

The test suite is configured to run automatically on each pull request and merge to the main branch using GitHub Actions.
