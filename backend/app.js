// Import modules
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Init app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (import setelah app dibuat)
const pekerjaanRoutes = require("./routes/pekerjaanRoutes");
const ttfRoutes = require("./routes/ttfRoutes");
import invoiceRoutes from "./routes/invoiceRoutes.js";

// Register routes
app.use("/api/pekerjaan", pekerjaanRoutes);
app.use("/api/ttf", ttfRoutes);
app.use("/api/invoice", invoiceRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
