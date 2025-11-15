const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Sample coordinates for different countries
const getDefaultCoordinates = (country) => {
    const coordinates = {
        "United States": [-95.7129, 37.0902],
        "Italy": [12.4964, 41.9028],
        "Mexico": [-102.5528, 23.6345],
        "Switzerland": [8.2275, 46.8182],
        "Tanzania": [34.8888, -6.3690],
        "Netherlands": [4.8970, 52.3779],
        "Fiji": [178.0650, -17.7134],
        "United Kingdom": [-3.4359, 55.3781],
        "Indonesia": [113.9213, -0.7893],
        "Canada": [-106.3468, 56.1304],
        "Thailand": [100.9925, 15.8700],
        "United Arab Emirates": [53.8478, 23.4241],
        "Greece": [21.8243, 39.0742],
        "Costa Rica": [-83.7534, 9.7489],
        "Japan": [138.2529, 36.2048],
        "Maldives": [73.2207, 3.2028]
    };
    return coordinates[country] || [0, 0];
};

// Process listings to add geometry
const processListings = (listings) => {
    return listings.map(listing => ({
        ...listing,
        geometry: {
            type: "Point",
            coordinates: getDefaultCoordinates(listing.country)
        }
    }));
};

// Initialize database
async function initDB() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB!");

        // Process listings to add geometry data
        const processedListings = processListings(initData.data);

        // Clear existing data
        await Listing.deleteMany({});
        console.log("Cleared existing listings");

        // Insert new data
        await Listing.insertMany(processedListings);
        console.log("Sample data initialized successfully!");

        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");

    } catch (err) {
        console.error("Error during initialization:", err);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run initialization
initDB();