# Phreddit

Phreddit is a mock version of Reddit developed as a full-stack web application for the CSE 316 course. The project demonstrates how to build a Reddit-style platform using the MERN stack (MongoDB, Express.js, React.js, Node.js). It features a custom-designed user interface and runs on the default development server.

## Features

- Post creation, voting, and commenting
- Subreddit-style thread organization
- Full-stack MERN architecture
- Fully custom UI (no external component libraries)
- Optional user authentication (extendable)

## Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Other:** RESTful API, JavaScript (ES6+), custom CSS

## Folder Structure

```bash
phreddit/
├── backend/              # Node.js backend with Express routes
│   ├── models/           # Mongoose schemas for posts, users, comments
│   └── routes/           # API endpoints
├── frontend/             # React application
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page views (e.g. Home, Post, Thread)
│   └── App.js            # Main React component
├── .env                  # Environment variables
├── package.json          # Root dependencies
└── README.md             # Project documentation
```
## Getting Started
Prerequisites

Make sure you have the following installed:
- Node.js (>= 16)
- MongoDB
- Git

Tip: Use nvm to manage Node.js versions and pipenv for isolated Python environments if needed.
Installation

    Clone the repository:

bash

git clone https://github.com/your-username/phreddit.git
cd phreddit

    Install backend dependencies:

bash

cd backend
npm install

    Install frontend dependencies:

bash

cd ../frontend
npm install

Running the App

    Start MongoDB (if not already running):

bash

mongod

    Start the backend server:

bash

cd backend
npm start

    Start the frontend server in a separate terminal:

bash

cd frontend
npm start

    Navigate to http://localhost:3000 in your browser.

Screenshots

Add screenshots or demo gifs here if available.
Course Info

This project was created for:
CSE 316: Software Development
Stony Brook University
License

This project is for educational use only and is not affiliated with Reddit.
Feel free to fork or adapt it for your own learning or portfolio.
