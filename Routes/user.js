// Handles all the Routes related to the user
const express = require('express');
const router = express.Router();

//Handles user Login
router.get("/login",loginUser);

//Handles user register/signup
router.post("/register", registeruser);

module.exports = router;
