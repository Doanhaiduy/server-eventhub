const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { hashedPassword } = require('../helpers');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    // secure: true,
    // service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
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

const handleSendMail = async (val) => {
    try {
        await transporter.sendMail(val);
        return 'OK';
    } catch (error) {
        return error;
    }
};

const verification = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const verificationCode = Math.round(Math.random() * 9000)
        .toString()
        .padStart(4, '0');

    try {
        const data = {
            from: `Support EventHub Application <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verification code for EventHub Application',
            text: 'Your verification code is: ' + verificationCode + ' Please use this code to verify your account.',
            html:
                '<h1>Your verification code is: ' +
                verificationCode +
                ' Please use this code to verify your account.</h1>',
        };
        const res = await handleSendMail(data);

        res.status(200).json({
            message: 'Verification code has been sent to your email!',
            data: {
                email,
                code: verificationCode,
            },
        });
    } catch (error) {
        res.status(401);
        throw new Error('Error while sending email');
    }
});

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

    const newHashedPassword = await hashedPassword(password);
    const newUser = new UserModel({
        fullName: fullName ?? '',
        email,
        password: newHashedPassword,
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

const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const verificationCode = Math.round(Math.random() * 999000)
        .toString()
        .padStart(6, '0');

    const data = {
        from: `Support EventHub Application <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Password for EventHub Application',
        text: 'Your verification code is: ' + verificationCode + '. Please use this code to verify your account.',
        html:
            '<h1>Your verification code is: ' +
            verificationCode +
            '. Please use this code to verify your account.</h1>',
    };

    const userExiting = await UserModel.findOne({
        email,
    });

    if (!userExiting) {
        res.status(401).json({
            message: 'User not found!',
        });
        throw new Error('User not found!');
    } else {
        const newHashedPassword = await hashedPassword(verificationCode);
        await UserModel.findByIdAndUpdate(userExiting._id, {
            password: newHashedPassword,
            isChangePassword: true,
        }).catch((error) => {
            console.log(error.message);
            res.status(401);
            throw new Error('Error while updating password');
        });

        await handleSendMail(data)
            .then(() => {
                res.status(200).json({
                    message: 'Verification code has been sent to your email!',
                    // data: {
                    //     email,
                    //     code: verificationCode,
                    // },
                    data: [],
                });
            })
            .catch((error) => {
                res.status(401);
                throw new Error('Error while sending email');
            });
    }
});
module.exports = {
    register,
    login,
    verification,
    forgotPassword,
};
