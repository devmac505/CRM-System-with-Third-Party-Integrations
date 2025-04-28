# CRM System with Third-Party Integrations

A comprehensive Customer Relationship Management (CRM) system that integrates with Stripe (payment gateway), Mailchimp (email marketing), and Facebook (social media interaction).

## Features

- **Customer Data Management**: Store and manage customer information
- **Sales Pipeline**: Track leads from first contact to final sale
- **Payment Processing**: Accept payments via Stripe integration
- **Email Marketing**: Create and send campaigns via Mailchimp
- **Social Media Integration**: Monitor and respond to Facebook interactions
- **User Authentication**: Secure login and role-based access control

## Tech Stack

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Stripe API for payment processing
- Mailchimp API for email marketing
- Facebook Graph API for social media interactions

### Frontend
- React with React Router
- Tailwind CSS for styling
- Axios for API requests
- Chart.js for data visualization

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Stripe, Mailchimp, and Facebook developer accounts

### Installation

1. Clone the repository
```
git clone <repository-url>
cd crm-system
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm-system
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=your_mailchimp_server_prefix
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Running the Application

1. Start the backend server
```
cd backend
npm run dev
```

2. Start the frontend development server
```
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/interactions` - Add interaction to lead

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `POST /api/orders/:id/payment` - Process payment for order

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/send` - Send campaign

## License

This project is licensed under the MIT License.
