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
        res.status(401);
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
            ...newUser,
            accessToken: await getJsonWebToken(email, newUser.id),
        },
    });
});

module.exports = {
    register,
};
