//import express
const express = require("express")

const router = express.Router();

const{
    signUp,
    logIn,
    verify,
forgotPassword, 
    resetPasswordPage, 
    resetPassword, 
    signOut,
    isAdmin,
    getAUser,
    getAllUSers
    
} = require("../controller/userController");
const { admin, authenticate } = require("../middleware/authetication");




// endpoint to sign up
router.post("/signUp", signUp )

//endpoint to verify a registered user
router.get('/verify/:id/:token', verify);

//endpoint to login a user
router.post('/login', logIn);


//endpoint for forget Password
router.post('/forgot', forgotPassword);

//endpoint for reset Password Page
router.get('/reset/:userId', resetPasswordPage);

//endpoint to reset user Password
router.post('/resetUser/:userId', resetPassword);

//endpoint to sign out a user
router.post("/signout/:userId", signOut)


//endpoint for admin to log in
router.put("/isadmin/:adminId",authenticate, isAdmin)

//get all user
router.get("/getall",getAllUSers)

//get a user
router.get("/getone/:userId", getAUser)

module.exports = router         
