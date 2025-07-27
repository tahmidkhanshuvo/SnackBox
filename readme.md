
# 🍱 SnackBox: A Smart Canteen Management System

**Course:** CSE 3100  
A web-based system to streamline the operations of institutional canteens — from ordering to inventory and real-time analytics.

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Target Audience](#target-audience)
- [UI Design](#ui-design)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## 📌 About the Project

**SnackBox** is a full-stack Smart Canteen Management System developed as a course project for **CSE 3100**. It transforms traditional canteen operations by integrating:

- QR-based table orders  
- Smart inventory control  
- Real-time order tracking  
- Admin dashboards  
- Loyalty rewards & more

Our mission is to reduce order waiting time, digitize operations, and improve customer experience in institutional canteens.

---

## 🚀 Key Features

### ✅ Customer-Side
- Online food ordering & real-time status tracking
- QR-based table ordering
- AI-powered menu suggestions (upcoming)
- Feedback system for each item
- Meal plan subscriptions (optional)
- Wallet & BoxPoints loyalty system

### ✅ Staff/Admin-Side
- Live order dashboard with order state transitions
- CRUD interface for menu & inventory
- Stock alerts and waste logging
- Staff scheduling and management

### 📊 Analytics & Smart Modules
- Sales reports & revenue analytics
- Peak hours and best-selling item insights
- Promotion & coupon system
- Digital queue and display integration

---

## 🎯 Target Audience

- **Customers**: Students, faculty, guests
- **Staff**: Kitchen team, delivery, and table managers
- **Admins**: Canteen managers and institutional heads

---

## 🎨 UI Design

Modern, responsive dashboard with role-based navigation and light/dark theme support.

🔗 **Figma Link**: _[SnackBox UI Design](https://www.figma.com/community/file/1531246323983921162)_

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Ant Design / Material UI

### Backend
- Laravel (PHP REST API)

### Database
- MySQL / PostgreSQL

### Hosting / Cloud
- AWS / DigitalOcean / Vercel (TBD)

### DevOps & Tools
- GitHub
- Docker
- Postman
- Figma

---

## ⚙️ Getting Started

### 🔧 Prerequisites

- PHP >= 8.0
- Composer
- Node.js (for frontend)
- MySQL or PostgreSQL
- Redis (optional)

### 📦 Installation

#### Clone the repository

```bash
git clone https://github.com/your-username/SnackBox.git
cd SnackBox
```

#### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env      # Configure DB credentials
php artisan key:generate
php artisan migrate
php artisan db:seed       # Optional: Seed sample data
php artisan serve
```

#### Frontend (React)

```bash
cd ../frontend
npm install
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Usage

1. Register or log in using demo credentials.
2. Browse the menu, place an order, and select payment method.
3. View real-time order status and notifications.
4. Staff can manage order queues and inventory.
5. Admins can manage system-wide settings, analytics, and feedback.

---

## 📁 Project Structure

```
SnackBox/
├── frontend/            # React + Ant Design frontend
├── backend/             # Laravel backend
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── ...
└── README.md            # Project documentation
```

---

## 🤝 Contributing

Contributions are welcome:

1. Fork the repository
2. Create your branch: `git checkout -b feature/YourFeature`
3. Commit: `git commit -m 'Add YourFeature'`
4. Push: `git push origin feature/YourFeature`
5. Open a Pull Request

Please follow existing conventions and include tests where appropriate.

---

## 👥 Team

- **Tahmid Khan** (20220204086)
- **Tahmid Amir** (20220204082)
- **Saobia Islam Tinni** (20220204088)
- **Nusrat Jahan Mim** (20220204092)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

