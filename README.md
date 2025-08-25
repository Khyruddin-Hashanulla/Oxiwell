# Oxiwell Health Center Management System

A comprehensive full-stack healthcare management platform built with modern web technologies.

![OrbitIQ Banner] (https://media.licdn.com/dms/image/v2/D562DAQEEzCzMANiPDw/profile-treasury-image-shrink_1920_1920/B56ZjBd8kcHcAs-/0/1755592511206?e=1756756800&v=beta&t=Y8dEafXcTysms3jQbUky8P9EOTuLYkxffQv_106mrLA)

## 🏥 Overview

Oxiwell is a role-based healthcare management system that enables patients, doctors, and administrators to efficiently manage healthcare operations including appointments, medical records, prescriptions, and billing.

## 🚀 Tech Stack

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** + **Cloudinary** for file uploads

### Deployment
- **Backend**: Render
- **Frontend**: Vercel/GitHub Pages
- **Database**: MongoDB Atlas

## 👥 User Roles & Features

### 🧑 Patient
- Register/Login
- Book appointments with doctors
- View prescription history
- Upload/view medical reports (PDF/images)
- Profile management

### 👨‍⚕️ Doctor
- View appointments
- Accept/Reject appointments
- Write and update prescriptions
- View patient health history
- Add medical notes

### 👩‍💼 Admin
- Manage doctors and patients
- Approve or block users
- View all appointments
- Generate invoices
- Analytics dashboard

## 📁 Project Structure

```
oxiwell/
├── frontend/          # React.js frontend
├── backend/           # Node.js backend
├── README.md
└── .gitignore
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 📝 API Documentation

The API endpoints are organized by user roles:
- `/api/auth` - Authentication routes
- `/api/patients` - Patient-specific routes
- `/api/doctors` - Doctor-specific routes
- `/api/admin` - Admin-specific routes
- `/api/appointments` - Appointment management
- `/api/prescriptions` - Prescription management
- `/api/reports` - Medical report uploads

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy the backend service

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
