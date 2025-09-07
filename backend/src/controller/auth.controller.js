const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register api

async function registerUser(req, res) {
  try {
    const {
      email,
      fullName: { firstName, lastName },
      password,
    } = req.body;

    const isUserExist = await userModel.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        message: "User already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName: {
        firstName,
        lastName,
      },
      email: email,
      password: hashPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// login api

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
      email,
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or PassWord" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        message: "Invalid email or PassWord",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function logoutUser(req, res) {
  try {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
