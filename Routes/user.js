// Handles all the Routes related to the user
const express = require('express');
const router = express.Router();
const {userLogin, userRegister} = require("../Controllers/userCntrollers");

//Handles user Login
router.get("/login",userLogin);

//Handles user register/signup
router.post("/register", userRegister);

module.exports = router;
