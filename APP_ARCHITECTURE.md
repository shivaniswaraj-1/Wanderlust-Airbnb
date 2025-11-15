# Wanderlust Application Architecture Documentation

## 1. System Overview

### Architecture
- **Frontend**: EJS templates with Bootstrap CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js
- **File Storage**: Cloudinary
- **Session Management**: express-session with MongoDB store
- **Form Validation**: Joi

### Core Features
1. User Authentication
2. Property Listings Management
3. Review System
4. Image Upload
5. Geolocation Support
6. Flash Messages

## 2. Component Breakdown

### A. Frontend Structure
```
views/
├── layouts/
│   └── boilerplate.ejs     # Main layout template
├── includes/
│   ├── navbar.ejs          # Navigation bar
│   ├── footer.ejs          # Footer component
│   └── flash.ejs           # Flash messages
└── listings/
    ├── index.ejs           # Listings overview
    ├── show.ejs            # Single listing view
    ├── new.ejs            # Create listing form
    └── edit.ejs           # Edit listing form
```

### B. Backend Structure
```
├── models/               # Database schemas
├── controllers/         # Business logic
├── routes/             # Route definitions
├── middleware/         # Custom middleware
└── utils/             # Helper functions
```

## 3. Workflow & Data Flow

### A. User Authentication Flow
1. **Signup Process**:
   - User enters credentials
   - Email verification with OTP
   - Password hashing via Passport
   - User stored in MongoDB

2. **Login Process**:
   - Local strategy authentication
   - Session creation
   - Flash message confirmation

### B. Listing Management Flow
1. **Create Listing**:
   - Authenticated user submits form
   - Image upload to Cloudinary
   - Geolocation data processing
   - MongoDB document creation

2. **View Listings**:
   - Fetch from MongoDB
   - Populate owner & reviews
   - Render with EJS template

3. **Edit/Delete Listing**:
   - Owner verification
   - Image update handling
   - Database update/delete

### C. Review System Flow
1. **Add Review**:
   - User authentication check
   - Review creation
   - Association with listing
   - Rating calculation

2. **Manage Reviews**:
   - Author verification
   - Cascade deletion
   - Rating update

## 4. Key Features Implementation

### A. Image Handling (cloudConfig.js)
```javascript
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust_DEV',
        allowedFormats: ['png','jpg','jpeg']
    }
});
```

### B. Authentication (middleware.js)
```javascript
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};
```

### C. Data Validation (schema.js)
```javascript
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required()
    }).required()
});
```

## 5. Database Schema

### A. Listing Model
```javascript
const listingSchema = new Schema({
    title: String,
    description: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    }
});
```

### B. Review Model
```javascript
const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});
```

## 6. Security Implementation

### A. Session Configuration
```javascript
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 1000*60*60*24*7,
        httpOnly: true
    }
};
```

### B. Error Handling
```javascript
app.use((err, req, res, next) => {
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("error.ejs", {message});
});
```

## 7. Environment Configuration

Required Environment Variables:
```
NODE_ENV=development
ATLASDB_URL=mongodb://127.0.0.1:27017/wanderlust
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
```

## 8. API Routes

### A. Listing Routes
- GET `/listings` - View all listings
- GET `/listings/new` - New listing form
- POST `/listings` - Create listing
- GET `/listings/:id` - View single listing
- PUT `/listings/:id` - Update listing
- DELETE `/listings/:id` - Delete listing

### B. Review Routes
- POST `/listings/:id/reviews` - Add review
- DELETE `/listings/:id/reviews/:reviewId` - Delete review

### C. User Routes
- GET `/signup` - Signup form
- POST `/signup` - Create user
- GET `/login` - Login form
- POST `/login` - Authenticate user
- GET `/logout` - Logout user

## 9. Frontend Features

### A. Responsive Design
- Bootstrap 5.3.3 framework
- Custom CSS for components
- Mobile-friendly layout

### B. Interactive Elements
- Flash messages for user feedback
- Form validation
- Rating system
- Image galleries

### C. Maps Integration
- Mapbox GL JS for location display
- Interactive markers
- Location preview

## 10. Error Handling

### A. Custom Error Classes
```javascript
class ExpressError extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }
}
```

### B. Async Error Wrapper
```javascript
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}
```

This documentation provides a comprehensive overview of the Wanderlust application architecture and implementation details. Use it as a reference for understanding the system structure and maintaining the codebase.