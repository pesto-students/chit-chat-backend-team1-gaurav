const express = require("express");

const router = express.Router();

const authentication = require("../Services/Authentication");

router.post("/sendOTP", authentication.sendotp);
router.post("/signup", authentication.signup);
router.post("/login", authentication.login);
router.post("/forgotpassword", authentication.forgotPassword);
router.post("/getprofile", authentication.getProfile);
router.post("/changepassword", authentication.changePassword);
router.post("/editprofile", authentication.EditProfile);
router.post("/updateprofilepic", authentication.updateProfilePic);

module.exports = router;
