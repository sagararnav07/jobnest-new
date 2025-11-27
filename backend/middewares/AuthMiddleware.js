const jwt = require("jsonwebtoken");
const JwtController = require('../Controllers/JwtController');

module.exports = function (req, res, next) {
  try {
    // Get token from httpOnly cookie or Authorization header
    const token = JwtController.getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ msg: "Authorization header or cookie missing" });
    }

    // Verify token using shared secret and options
    const decoded = JwtController.verifyToken(token);

    if (!decoded) {
      return res.status(403).json({ msg: "Invalid or expired token" });
    }

    console.log('AuthMiddleware decoded token:', decoded);
    req.userId = decoded._id; // attach decoded user to request
    req.userType = decoded.userType;

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(403).json({ msg: "Invalid token" });
  }
};