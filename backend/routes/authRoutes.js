const express = require("express");
const protect = require("../middlewares/authMiddleware");
const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
