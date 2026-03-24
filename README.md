# Society Subscription Management

A full-stack web application for managing residential society maintenance subscriptions, flats, payments, reports, and notifications.

The project includes:
- a `Next.js` frontend for admin and resident dashboards
- an `Express.js` backend API
- a `PostgreSQL` database
- push notification support through `OneSignal`

## Features

### Admin
- Admin login and protected admin routes
- Add, edit, list, and manage flats
- Manage subscription plans
- View monthly subscription records
- Mark subscriptions as paid
- Manual payment entry
- Payment and summary reports
- Download report data
- Send notifications to:
  - all users
  - users by flat type
  - a particular flat

### User
- Secure login
- Protected user routes
- View assigned flat details
- Check subscription status
- See pending and completed payments
- Simulated payment gateway flow
- Download payment receipts
- View and manage notifications
- Update profile and change password

## Tech Stack

### Frontend
- Next.js 16
- React 19
- Redux Toolkit
- Tailwind CSS v4
- Shadcn/Radix UI components
- Axios
- React Hot Toast
- Recharts
- React To Print

### Backend
- Express.js
- PostgreSQL
- pg
- JWT authentication
- bcrypt / bcryptjs
- cookie-parser
- cors

### Integrations
- OneSignal push notifications
- NextAuth Google provider support

## Project Structure

society-subscription-management/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── user/
│   │   ├── login/
│   │   ├── profile/
│   │   └── components/
│   ├── redux/
│   └── lib/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── db.js
└── README.md
```

## Main Modules

### Frontend
- `src/app/admin/*` admin dashboard, flats, subscriptions, reports, notifications, payment entry
- `src/app/user/*` resident dashboard, payments, subscriptions, notifications
- `src/app/components/*` navbar, sidebars, route protection, profile components, OneSignal provider
- `src/redux/*` authentication and app state

### Backend
- `backend/controllers/userController.js` auth, profile, notification APIs
- `backend/controllers/flatsController.js` flat CRUD and validation
- `backend/controllers/paymentController.js` payment flow and reports
- `backend/controllers/monthly_subscriptionsController.js` monthly subscription records
- `backend/controllers/subscription_plansController.js` plan management


## Environment Variables

Create a root `.env` for the frontend and a `backend/.env` for the server.

### Frontend `.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Backend `backend/.env`

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name
DB_PORT=5432

## Installation

### 1. Clone the project

```bash
git clone <https://github.com/chhavittn/society-subscription-management.git>
cd society-subscription-management
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

## Running the Project

### Start the backend

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:5000`.

### Start the frontend

```bash
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

```bash
cd backend
npm run dev
npm start
```

## Database

The backend is configured for PostgreSQL using `pg` and reads connection settings from environment variables in [db.js](/home/chhavi/Desktop/society-subscription-management/backend/db.js).

You should create the required tables for:
- users
- flats
- subscription_plans
- monthly_subscriptions
- payments
- notifications

## Future Improvements
- add stronger payment gateway integration
- add email notifications

## Author
chhavi