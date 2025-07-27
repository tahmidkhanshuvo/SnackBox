# SnackBox: Canteen Management System

**Course**: CSE 3100

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Running the Application](#running-the-application)
4. [Usage](#usage)
5. [Tech Stack](#tech-stack)
6. [File Structure](#file-structure)
7. [Contributing](#contributing)
8. [Team](#team)
9. [License](#license)

---

## Project Overview

SnackBox is a web-based Canteen Management System designed to streamline the ordering, preparation, and delivery of meals in institutional canteens. Built as a course project for **CSE 3100**, SnackBox offers an intuitive interface for customers, staff, and administrators.

Key goals:

- Reduce order waiting times
- Digitalize menu & inventory management
- Provide real-time order tracking

---

## Features

- **User Roles & Authentication**: Admin, Staff, Customer
- **Dynamic Menu Management**: Create, update, delete items; categorize by meal type
- **QR-based Table Ordering**: Scan code to assign orders to tables
- **Inventory Control**: Track stock levels, low-stock alerts
- **Order Workflow**: Placed → In Progress → Ready → Delivered
- **Payments & Wallet**: Support for multiple payment methods and in-app wallet
- **Analytics Dashboard**: Sales reports, best-selling items, peak hours
- **Loyalty Program**: Earn and redeem BoxPoints for free snacks
- **Feedback System**: Quick thumbs-up/down on each dish

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- PostgreSQL (v12+)
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SnackBox.git
   cd SnackBox
   ```
2. **Backend setup**
   ```bash
   cd server
   npm install
   cp .env.example .env       # configure your DB and API keys
   npm run migrate            # apply database migrations
   npm run seed               # seed initial data (optional)
   ```
3. **Frontend setup**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

- **Start the backend**
  ```bash
  cd server
  npm start
  ```
- **Start the frontend**
  ```bash
  cd client
  npm start
  ```

Visit `http://localhost:3000` to explore SnackBox.

---

## Usage

1. **Register** as a customer or log in with provided test credentials.
2. **Browse the menu**, add items to your SnackBox, and check out via preferred payment method.
3. **Staff view**: monitor real-time orders and update statuses.
4. **Admin dashboard**: manage menu, inventory, users, and view analytics.

---

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: PostgreSQL, Sequelize ORM
- **Caching & Real-Time**: Redis, Socket.io
- **Notifications**: Twilio SMS, Firebase Cloud Messaging

---

## File Structure

```plaintext
SnackBox/
├── client/          # React frontend
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── migrations/
└── README.md        # Project documentation
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request.

Please ensure code follows existing style conventions and includes relevant tests.

---

## Team

- **Tahmid Khan**
- **Tahmid Amir**
- **Saobia Islam Tinni**
- **Nusrat Jahan Mim**

---

## UI Design
The UI will feature a modern, responsive dashboard with role-based navigation, and support for both light and dark themes.

**Figma Link**: [SnackBox UI Design](https://www.figma.com/community/file/1531246323983921162)



## License

This project is licensed under the [MIT License](LICENSE).

