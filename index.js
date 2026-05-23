const express = require('express');
const user = require('./Routes/user');
const habits = require('./Routes/habits');
require('dotenv').config();


const dbConnection = require("./Config/db");

const PORT =  process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Conenct to DB
dbConnection();

// Routes the Request to the User Routes
app.use("/",user);

// Routes the Request to the habits routes
app.use("/habits",habits);

// App initialisation
app.listen(PORT, (req, res)=>{
    console.log("APP is Running on Port: ", PORT);
})