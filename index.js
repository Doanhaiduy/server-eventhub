const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/auth/hello', (req, res) => {
    res.json('<h1>Hello from the server!</h1>');
});

app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is running on port ${PORT}, at http://localhost:${PORT}`);
});
