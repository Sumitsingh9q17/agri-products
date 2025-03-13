const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/TokenBlacklist");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Access Denied! No token provided." });
        }

        // Check if token is blacklisted
        const blacklisted = await TokenBlacklist.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ message: "Token is invalid, please log in again." });
        }

        // Verify token
        const verified = jwt.verify(token, "your_jwt_secret");
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
