const express = require("express");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
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
app.use(express.static(path.join(__dirname,"../public")));

//Using Routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

app.get("*name",(req,res)=>{
    res.sendFile(psth.join(__dirname,"../public/index.html"))
})
module.exports = app;

