
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/userSchema');

function isValidString(value) {
   return typeof value === 'string' && value.trim().length > 0;
}

function createToken(user) {
   return jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
   );
}

module.exports.userRegister = async (req, res) => {
   try {
      const { name, email, password } = req.body;

      if (!isValidString(name) || !isValidString(email) || !isValidString(password)) {
         return res.status(400).json({
            message: 'name, email, and password are required',
         });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
         return res.status(409).json({ message: 'Email is already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
         name: name.trim(),
         email: normalizedEmail,
         password: passwordHash,
      });

      const token = createToken(user);

      return res.status(201).json({
         message: 'User registered successfully',
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
         },
      });
   } catch (error) {
      if (error.code === 11000) {
         return res.status(409).json({ message: 'Email is already registered' });
      }

      return res.status(500).json({
         message: 'Failed to register user',
         error: error.message,
      });
   }
};

module.exports.userLogin = async (req, res) => {
   try {
      const { email, password } = req.body;

      if (!isValidString(email) || !isValidString(password)) {
         return res.status(400).json({
            message: 'email and password are required',
         });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
         return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
         return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = createToken(user);

      return res.status(200).json({
         message: 'Login successful',
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
         },
      });
   } catch (error) {
      return res.status(500).json({
         message: 'Failed to login user',
         error: error.message,
      });
   }
};
