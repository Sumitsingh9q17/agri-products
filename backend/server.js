const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose"); // <-- Import mongoose

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

app.get("/", (req, res) => {
    res.send("API is running...");
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
