// Load environment variables
require('dotenv').config();

// Uncaught exception handler
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});


const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/reviews.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SECRET || 'mysecretkey123',
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 1000*60*60*24*7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main().then(()=>{
    console.log("Connected to DB");
}).catch(err => {
    console.log(err);
});

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

//root
// app.get("/",(req,res)=>{
//     res.send("Hi! I am root.");
// });

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req,res)=>{
//     let fakeuser = new User({
//         email: "student2@gmail.com",
//         username: "iamshivani2",
//     });
//     let registeredUser = await User.register(fakeuser,"helloworld");
//     res.send(registeredUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



//page not found
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});
//error handling
app.use((err,req,res,next)=>{
    let {status=500,message="Something went wrong"} = err;
    res.status(status).render("error.ejs",{message});
    //res.status(status).send(message);
});

const PORT = process.env.PORT || 6789;

// Check if port is in use
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});