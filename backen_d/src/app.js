const express = require("express");
const cookieparser = require("cookie-parser");
const cors = require("cors");
// routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

//MiddleWares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json());
app.use(cookieparser());

//Using Routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
module.exports = app;
