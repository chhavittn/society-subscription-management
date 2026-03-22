const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: "backend/.env" });

// CORS configuration (for Next.js frontend)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
const user = require("./routes/userRoute");
const flats = require("./routes/flatsRoute");
const subscription_plan = require("./routes/subscription_plansRoute");
const monlthly_subscription_record = require("./routes/monthly_subscriptionsRoute");
const payment = require("./routes/paymentRoute");

app.use("/api/v1", user);
app.use("/api/v1", flats);
app.use("/api/v1", subscription_plan);
app.use("/api/v1", monlthly_subscription_record);
app.use("/api/v1", payment);

module.exports = app;