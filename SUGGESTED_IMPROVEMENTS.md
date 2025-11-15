# Wanderlust Application Improvement Suggestions

## 1. Security Enhancements

### A. Authentication & Authorization
1. **Implement Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 login attempts per windowMs
});
app.use('/login', loginLimiter);
```

2. **Add Password Complexity Requirements**
```javascript
const passwordValidator = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return password.length >= minLength && 
           hasUpperCase && hasLowerCase && 
           hasNumbers && hasSpecialChar;
};
```

3. **Implement JWT for API Authentication**
- Add JWT token-based authentication for API routes
- Implement refresh token mechanism
- Add token blacklisting for logout

### B. Input Validation
1. **Enhanced Data Sanitization**
```javascript
const sanitizeInput = (input) => {
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .trim()               // Remove whitespace
        .escape();           // Escape special characters
};
```

2. **File Upload Validation**
```javascript
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
};
```

## 2. Performance Optimization

### A. Database Optimization
1. **Add Indexes**
```javascript
listingSchema.index({ location: 1, price: 1 });
listingSchema.index({ "geometry.coordinates": "2dsphere" });
```

2. **Implement Caching**
```javascript
const cache = require('memory-cache');

const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        const key = '__express__' + req.originalUrl;
        const cachedBody = cache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                cache.put(key, body, duration * 1000);
                res.sendResponse(body);
            };
            next();
        }
    };
};
```

3. **Implement Pagination**
```javascript
const paginatedResults = async (model) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        
        const results = {};
        results.total = await model.countDocuments().exec();
        results.data = await model
            .find()
            .limit(limit)
            .skip(startIndex)
            .exec();
            
        res.paginatedResults = results;
        next();
    };
};
```

### B. Frontend Optimization
1. **Implement Image Lazy Loading**
```html
<img loading="lazy" 
     src="<%=listing.image.url%>" 
     alt="<%=listing.title%>"
     width="300" 
     height="200">
```

2. **Add Client-side Caching**
```javascript
// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
```

## 3. Feature Enhancements

### A. Search and Filtering
1. **Advanced Search Implementation**
```javascript
router.get('/search', async (req, res) => {
    const { 
        minPrice, 
        maxPrice, 
        location, 
        propertyType,
        amenities 
    } = req.query;
    
    const query = {};
    if (minPrice) query.price = { $gte: minPrice };
    if (maxPrice) query.price = { ...query.price, $lte: maxPrice };
    if (location) query.location = new RegExp(location, 'i');
    if (propertyType) query.propertyType = propertyType;
    if (amenities) query.amenities = { $all: amenities.split(',') };
    
    const listings = await Listing.find(query);
    res.json(listings);
});
```

2. **Filter Component**
```jsx
const FilterSidebar = () => {
    return (
        <div className="filter-sidebar">
            <div className="price-range">
                <input type="range" min="0" max="1000" />
            </div>
            <div className="location-filter">
                <select>
                    <option>All Locations</option>
                    <!-- Add locations dynamically -->
                </select>
            </div>
            <div className="amenities-filter">
                <!-- Add checkboxes for amenities -->
            </div>
        </div>
    );
};
```

### B. Booking System
1. **Booking Model**
```javascript
const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
});
```

2. **Availability Calendar**
```javascript
const checkAvailability = async (listingId, startDate, endDate) => {
    const bookings = await Booking.find({
        listing: listingId,
        $or: [
            {
                startDate: { $lte: startDate },
                endDate: { $gte: startDate }
            },
            {
                startDate: { $lte: endDate },
                endDate: { $gte: endDate }
            }
        ]
    });
    return bookings.length === 0;
};
```

### C. User Profile Enhancement
1. **Extended User Model**
```javascript
const userSchema = new Schema({
    // Existing fields
    profile: {
        firstName: String,
        lastName: String,
        phoneNumber: String,
        avatar: {
            url: String,
            filename: String
        },
        bio: String,
        preferences: {
            currency: {
                type: String,
                default: 'USD'
            },
            language: {
                type: String,
                default: 'en'
            },
            notifications: {
                email: Boolean,
                push: Boolean
            }
        }
    },
    bookings: [{
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Listing'
    }]
});
```

## 4. Code Quality Improvements

### A. Testing Implementation
1. **Unit Tests**
```javascript
const chai = require('chai');
const expect = chai.expect;

describe('Listing Model', () => {
    it('should create a new listing', async () => {
        const listing = new Listing({
            title: 'Test Listing',
            price: 100,
            description: 'Test Description'
        });
        const saved = await listing.save();
        expect(saved.title).to.equal('Test Listing');
    });
});
```

2. **Integration Tests**
```javascript
describe('Authentication', () => {
    it('should login with correct credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'testpass'
            });
        expect(res.status).to.equal(200);
    });
});
```

### B. Error Handling Enhancement
1. **Custom Error Classes**
```javascript
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.status = 400;
    }
}

class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
        this.status = 401;
    }
}
```

2. **Error Logging Service**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### C. Code Organization
1. **Service Layer Implementation**
```javascript
// services/listing.service.js
class ListingService {
    async createListing(listingData) {
        const listing = new Listing(listingData);
        return await listing.save();
    }
    
    async updateListing(id, updateData) {
        return await Listing.findByIdAndUpdate(id, updateData, { new: true });
    }
    
    async deleteListing(id) {
        return await Listing.findByIdAndDelete(id);
    }
}
```

2. **API Response Standardization**
```javascript
const apiResponse = {
    success: (res, data, message = 'Success') => {
        return res.status(200).json({
            success: true,
            message,
            data
        });
    },
    error: (res, error, status = 400) => {
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};
```

These improvements would significantly enhance the application's security, performance, and functionality while maintaining clean and maintainable code.