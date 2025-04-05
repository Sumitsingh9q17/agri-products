const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const authMiddleware = require("../middleware/authmiddleware");
const sendEmail = require("../utils/sendEmail"); // Assuming you have a utility function to send emails

const router = express.Router();

// Register Route
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const token = crypto.randomBytes(32).toString("hex");
        const expiry = Date.now() + 3600000; // 1 hour

        user.resetToken = token;
        user.resetTokenExpiry = expiry;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        await sendEmail(
            email,
            "Reset your Agri-Products password",
            `<p>Hello ${user.name},</p>
             <p>You requested a password reset. Click the link below to reset it:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`
        );

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Reset Password Route
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout Route
router.post("/logout", authMiddleware, async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(400).json({ message: "No token provided" });

        await TokenBlacklist.create({ token });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/google-login', async (req, res) => {
    const { email, name } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({ name, email, password: null }); // no password needed
        await user.save();
      }

      const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: '1h' });
      res.status(200).json({ token, message: "Google login successful" });
    } catch (error) {
      res.status(500).json({ message: "Google login error", error });
    }
  });


module.exports = router;
