const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mailer = require('../utils/mailer');
const { generateOTP, verifyJwtToken } = require('../utils/common');

// In-memory otp storage, can also use redis-cache storage
const otpList = []

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        // Expire OTP after 15 minutes
        const otpExpires = Date.now() * 15 * 60 * 1000;

        // Create new user
        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            email,
            password: hashedPassword,
            role,
            is_verified: false
        });

        // Send OTP email
        const mailOptions = {
            from: 'mailGenerator@gmail.com',
            to: email,
            subject: 'Your OTP for registration',
            text: `Your OTP is ${otp}. It is valid for the next 15 minutes.`
        };
        await mailer.sendMail(mailOptions);
        otpList.push({ email, otp, otpExpires });
        
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(201).json({ message: 'User registered successfully', user, token });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Check user role
        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'You are not allowed to login from here' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const verifyOtp = async (req, res) => {
    const { email, otp, token } = req.body;

    try {
        const isTokenValid = verifyJwtToken(token, process.env.JWT_SECRET)
        if(!isTokenValid){
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const otpData = otpList.find(item => item.email === email);
        if (otpData) {
            // OTP verification
            if (otpData.otpExpires < Date.now()) {
                return res.status(400).json({ message: 'OTP has expired' });
            }
            if (otpData.otp !== otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }

            // Verify user
            user.is_verified = true;
            await user.save();
        } else {
            return res.status(400).json({ message: 'Bad request' });
        }

        return res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { registerUser, loginUser, verifyOtp }