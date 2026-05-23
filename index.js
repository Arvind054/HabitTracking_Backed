const express = require('express');
const user = require('./Routes/user');
const habits = require('./Routes/habits');
require('dotenv').config();


const dbConnection = require("./Config/db");
const notFound = require('./Middleware/notFound');
const errorHandler = require('./Middleware/errorHandler');

const PORT =  process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    return next(err);
});

// Conenct to DB
dbConnection();

// Routes the Request to the User Routes
app.use("/",user);

// Routes the Request to the habits routes
app.use("/habits",habits);

// Catch unmatched routes and unhandled errors
app.use(notFound);
app.use(errorHandler);

// App initialisation
app.listen(PORT, (req, res)=>{
    console.log("APP is Running on Port: ", PORT);
})