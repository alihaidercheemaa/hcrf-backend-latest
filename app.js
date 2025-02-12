require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const upload = require("./config/multerConfig");
const http = require("http");

// Importing routes
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const formRoutes = require("./routes/formRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const badgeApplicationRoutes = require("./routes/badgeApplicationRoutes");
const donationRoutes = require("./routes/donationRoutes");
const preOrderRoutes = require("./routes/preOrderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const eBookRoutes = require("./routes/e_publication"); 
const advocacyRoutes = require("./routes/AdvocacyRoutes");
const campaignRoutes = require("./routes/CampaignRoutes");
const legislativeLobbyRoutes = require("./routes/legislativeLobbyRoutes");



// Import Sequelize instance
const sequelize = require("./config/sequelize");

const app = express();

// Configure CORS to allow requests from the frontend
const corsOptions = {
  origin: ['http://localhost:4550', 'null', 'http://127.0.0.1:4550', 'https://khcrf.org'],
  methods: 'GET,POST,DELETE,UPDATE,PUT',
  allowedHeaders: 'Content-Type, Authorization',
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route to welcome
app.get("/", (req, res) => {
  res.status(200).send("Welcome to updated Backend");
});

// Define API routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/form", formRoutes);
app.use("/api/badge-application", badgeApplicationRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/pre-order", preOrderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ebook", eBookRoutes); 
app.use("/api/advocacy", advocacyRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/legislative-lobby", legislativeLobbyRoutes);




// /api route to check if API is working
app.get("/api", (req, res) => {
  res.status(200).send("<h1>API is working!</h1>");
});

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    res.send("File uploaded successfully");
  } catch (err) {
    res.status(400).send("Error uploading file");
  }
});

// Middleware for handling 404 errors
app.use(notFound);

// General error handling middleware
app.use(errorHandler);

// Sync Sequelize models with database
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// Create an HTTP server instance
const server = http.createServer(app);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
