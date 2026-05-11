require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const wasteRoutes = require("./routes/wasteRoutes");
const chatRoutes = require("./routes/chatRoutes");
const smartBinRoutes = require("./routes/smartBinRoutes");
const startIoTSimulator = require("./scripts/iotSimulator");

const app = express();


connectDB().then(() => {
   
    startIoTSimulator();
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));


app.use("/api", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api", wasteRoutes);
app.use("/api/chat", chatRoutes); 
app.use("/api/smart-bins", smartBinRoutes);

app.get("/", (req, res) => {
    res.send("API running successfully on MERN stack!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (MongoDB Mongoose)`);
});