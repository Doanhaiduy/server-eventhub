const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routers/authRouter');
const connectDB = require('./src/configs/connectDb');
const errorMiddleHandler = require('./src/middlewares/errorMiddleware');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

connectDB(app);

app.use('/auth', authRouter);
app.use('/', (req, res) => {
    res.json({ message: 'Welcome to the server!' });
});

app.use(errorMiddleHandler);

app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is running on port ${PORT}, at http://localhost:${PORT}`);
});
