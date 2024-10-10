const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();  // Load environment variables

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "All fields are required" });

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(200).json({ msg: 'User registered successfully' });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    console.log('JWT Secret:', process.env.JWT_SECRET);  // Debugging: Ensure the JWT_SECRET is loaded correctly

    // Use the JWT_SECRET from the environment
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);

    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});
// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email is required' });

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Email does not exist' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpiry = Date.now() + 3600000; // 1-hour expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;
    console.log(`Reset Password Link: ${resetUrl}`);

    res.status(200).json({ msg: 'Password reset link sent to email.' });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, email, newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) return res.status(400).json({ msg: 'All fields are required' });

  if (newPassword !== confirmPassword) return res.status(400).json({ msg: 'Passwords do not match' });

  try {
    const user = await User.findOne({ email });
    if (!user || user.resetPasswordToken !== token || user.resetPasswordExpiry < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password updated successfully' });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
