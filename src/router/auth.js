const express = require("express");
const auth = require("../controllers/authController");
const {isAuthenticated} = require("../middleware/auth");
const router = express.Router();

//get
router.route("/me").get(isAuthenticated, auth.me);
//post
router.route("/login").post(auth.login);;
router.route("/forgotPassword").post(auth.forgotPassword);
//put
router.route("/resetPassword").put(auth.resetPassword);
router.route("/updatePassword").put(isAuthenticated, auth.updatePassword);

module.exports = router;
