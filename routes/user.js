const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleWare = require("../middleware/authMiddleware");

// Sign-Up Route
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    if (username.length < 5) {
      return res.status(400).json({ msg: "Username should be at least 5 characters" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password should be at least 6 characters" });
    }
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail || existingUsername) {
      return res.status(400).json({ msg: "Username or Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPass });
    await newUser.save();
    return res.status(200).json({ message: "Account Created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign-In Route
router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      return res.status(400).json({ msg: "Email does not exist" });
    }
    const isMatch = await bcrypt.compare(password, existingEmail.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: existingEmail._id, email: existingEmail.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.cookie("podcasterUserToken", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 DAYS
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });
    return res.status(200).json({
      id: existingEmail._id,
      username: existingEmail.username,
      email,
      message: "Sign-In success",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("podcasterUserToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure this matches your environment
      sameSite: "None", // Adjust according to your CORS setup
    });

    res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    console.error("Error clearing cookie:", error);
    res.status(500).json({ message: "Failed to log out" });
  }
});

// Check-Cookie Route
router.get("/check-cookie", (req, res) => {
  const token = req.cookies.podcasterUserToken;
  return res.status(200).json({ isLoggedIn: !!token });
});

// Fetch User Details Route
router.get("/user-details", authMiddleWare, async (req, res) => {
  try {
    const { email } = req.user;
    const existingUser = await User.findOne({ email }).select("-password");
    return res.status(200).json({ user: existingUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
