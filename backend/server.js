import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Routes
import usersRoute from "./routes/users.route.js";
import dealsRoute from "./routes/deals.route.js";
import distributionsRoute from "./routes/distributions.route.js";
import countriesRoute from "./routes/countries.route.js";
import investorsRoute from "./routes/investors.route.js";
import sectorsRoute from "./routes/sectors.route.js";
import subsectorsRoute from "./routes/subSectors.route.js";
import transactionsRoute from "./routes/transactions.route.js";
import financialHistoriesRoute from "./routes/financialHistory.route.js";
import companyRoute from "./routes/companies.route.js";
import ownershipRoute from "./routes/ownership.route.js";
import auditLogsRoute from "./routes/audit_Logs.route.js";
import notificationRoute from "./routes/notification.route.js";
import adminRoute from "./routes/admin.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
app.use("/users", usersRoute);
app.use("/deals", dealsRoute);
app.use("/distributions", distributionsRoute);
app.use("/countries", countriesRoute);
app.use("/investors", investorsRoute);
app.use("/sectors", sectorsRoute);
app.use("/subSectors", subsectorsRoute);
app.use("/transactions", transactionsRoute);
app.use("/financial-histories", financialHistoriesRoute);
app.use("/company", companyRoute);
app.use("/ownership", ownershipRoute);
app.use("/audit-logs", auditLogsRoute);
app.use("/notifications", notificationRoute);
app.use("/admin", adminRoute);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    server: `http://localhost:${PORT}`,
    endpoints: {
      users: "/users",
      deals: "/deals",
      countries: "/countries",
      investors: "/investors",
      company: "/company",
      admin: "/admin",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    console.log("📊 Database:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log("📍 Test endpoints:");
      console.log(`   GET http://localhost:${PORT}/`);
      console.log(`   GET http://localhost:${PORT}/users`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:");
    console.error("Error:", err.message);
  });