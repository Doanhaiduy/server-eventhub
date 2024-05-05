const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const getJsonWebToken = async (email, id) => {
    const payload = {
        email,
        id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    return token;
};

const register = asyncHandler(async (req, res, next) => {
    const { fullName, email, password } = req.body;
    const exitingUser = await UserModel.findOne({
        email,
    });
    if (exitingUser) {
        res.status(401).json({
            message: 'User already exists!',
        });
        throw new Error('User already exists!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new UserModel({
        fullName: fullName ?? '',
        email,
        password: hashedPassword,
    });
    await newUser.save();

    res.status(200).json({
        message: 'User created successfully!',
        data: {
            fullName: newUser.fullName,
            email: newUser.email,
            id: newUser.id,
            accessToken: await getJsonWebToken(email, newUser.id),
        },
    });
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const exitingUser = await UserModel.findOne({
        email,
    });

    if (!exitingUser) {
        res.status(403).json({
            message: 'User not found!',
        });
        throw new Error('User not found!');
    }

    const isMatchPassword = await bcrypt.compare(password, exitingUser.password);
    if (!isMatchPassword) {
        res.status(401).json({
            message: 'Email or password is incorrect!',
        });
        throw new Error('Email or password is incorrect!');
    }

    res.status(200).json({
        message: 'Login successfully!',
        data: {
            id: exitingUser.id,
            email: exitingUser.email,
            fullName: exitingUser.fullName,
            accessToken: await getJsonWebToken(email, exitingUser.id),
        },
    });
});
module.exports = {
    register,
    login,
};
