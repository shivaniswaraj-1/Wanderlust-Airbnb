# Wanderlust Airbnb Application Documentation

## Overview
Wanderlust is a web application built to showcase and manage property listings, similar to Airbnb. The application is built using Node.js with Express.js framework for the backend, MongoDB for the database, and EJS for server-side rendering of views.

## Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **View Engine**: EJS (Embedded JavaScript)
- **ODM**: Mongoose

## Project Structure
```
.
├── app.js              # Main application file
├── init/               # Database initialization
│   ├── data.js        # Sample data
│   └── index.js       # Initialization script
├── models/            # Database models
│   └── listing.js     # Listing model definition
└── views/             # View templates
    └── listings/      # Listing-related views
        └── index.ejs  # Listings list view
```

## How It Works

### 1. Database Connection
- The application connects to a local MongoDB instance at `mongodb://127.0.0.1:27017/wanderlust`
- Connection is established when the application starts
- Uses Mongoose as the ODM (Object Data Modeling) library

### 2. Data Model
The `Listing` model (`models/listing.js`) defines the schema for property listings with the following fields:
- `title` (String, required)
- `description` (String)
- `image` (String with default value)
- `location` (String)
- `country` (String)

### 3. Database Initialization
The `init` folder contains scripts to populate the database:
- `data.js`: Contains sample listing data
- `index.js`: Script to clear existing data and insert sample data

### 4. Backend (app.js)
The Express application:
1. Sets up the EJS view engine
2. Defines routes:
   - GET "/": Simple root route
   - GET "/listings": Fetches all listings and renders them
3. Listens on port 8080

### 5. Frontend
The frontend is currently minimal, using EJS templates:
- `views/listings/index.ejs`: Displays a simple list of all listings
- Each listing title is clickable and links to its detailed view (though the detail view is not implemented yet)

### 6. Workflow
1. When the server starts:
   - Connects to MongoDB
   - Sets up Express middleware and routes
   - Starts listening for requests

2. When a user visits "/listings":
   - Server fetches all listings from MongoDB
   - Renders the index.ejs template with the listing data
   - User sees the list of all listings

3. Database Initialization (separate process):
   - Run init/index.js to reset and populate the database
   - Clears existing listings
   - Inserts sample data from data.js

## Current Features
1. View all listings
2. Database connection and management
3. Basic routing structure
4. Sample data initialization