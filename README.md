# Eco-Track

Eco-Track is a comprehensive SaaS web application designed for waste management and sustainability tracking. It leverages AI-powered waste classification and IoT-enabled smart bin monitoring to provide an intelligent, seamless experience for eco-conscious environments.

## Features

- **AI Waste Classification**: Automatically classify waste types from images using on-device machine learning (TensorFlow.js).
- **SmartBin IoT Dashboard**: Monitor real-time fill levels, statuses, and locations of connected smart bins via an interactive map interface.
- **Insights & Analytics**: Track your personal or organizational environmental impact with detailed charts and historical scan data.
- **EcoBot Assistant**: An integrated intelligent chatbot providing on-demand advice for proper waste disposal.
- **Secure Authentication**: Robust JWT-based authentication system ensuring data privacy.
- **Modern UI/UX**: A highly responsive, clinical, and fluid design optimized for all devices.

## Project Structure

This project is structured as a full-stack MERN application with two main components:

- `/client`: The React-based frontend application.
- `/server`: The Node.js and Express backend REST API.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Atlas cluster or local instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pratikjais1505/Eco-Track-Waste-Manager.git
   cd Eco-Track
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `/server` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `/client` directory with the following variables:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

To run the application locally, you'll need to start both the backend server and the frontend development server.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm start
```

The client application will typically be available at `http://localhost:3000`.

## Technologies

- **Frontend**: React, TensorFlow.js, Axios, Vanilla CSS
- **Backend**: Node.js, Express.js, Mongoose, JWT
- **Database**: MongoDB
- **Tools**: IoT integration simulators, interactive maps

## License

This project is licensed under the MIT License.
