// const { MongoClient } = require("mongodb");
import { MongoClient } from "mongodb";
import { server } from "./app.js";
// Load environment variables from .env file
const port = process.env.PORT || 4000;

// MongoDB connection string
const localConnectionString =
  process.env.MONGODB_URI || "mongodb://localhost:27017";

// Create a new instance of MongoClient
const client = new MongoClient(localConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let isClientConnected = false;

// Function to connect to MongoDB
const connectToMongoDB = async () => {
  if (!isClientConnected) {
    try {
      await client.connect();
      console.log("Successfully connected to MongoDB");
      isClientConnected = true; // Set flag to true after a successful connection
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error; // Rethrow error to be handled by the caller
    }
  }
};

const startServer = async () => {
  await connectToMongoDB(); // Ensure MongoDB is connected before starting the server

  // const server = require("./app"); // Import the app after MongoDB connection
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer(); // Start the server

export default client; // Export the MongoClient instance for use in other parts of your app
