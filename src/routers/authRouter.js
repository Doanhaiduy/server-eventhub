const express = require('express');
const { register } = require('../controllers/authController');
const authRouter = express.Router();

authRouter.get('/hello', (req, res) => {
    res.send('Hello from the server!');
});

authRouter.post('/register', register);

module.exports = authRouter;
