const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const mongoURI = "mongodb+srv://snehasnair1149:EbHrylGWLOYaNfyL@cluster0.xysjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Error connecting to MongoDB:", err));
