const express = require('express');
require('dotenv').config();
const { default: mongoose } = require('mongoose');

const PORT = 3000;
const app = express();

//Database Connection
dbConnection()
.then(console.log("db connected successfully"))
.catch((e)=>{console.log("error connecting DB, ", e)});
async function dbConnection(){
    await mongoose.connect(process.env.MONGODB_URL);
};

app.listen(PORT, (req, res)=>{
    console.log("APP is Running on Port: ", PORT);
})