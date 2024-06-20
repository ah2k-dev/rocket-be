const auth = require("./auth");
const admin = require("./admin");
const requests = require("./requests");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const router = require("express").Router();



router.use("/auth", auth);
router.use("/requests", isAuthenticated, requests);
router.use("/admin", isAuthenticated, isAdmin, admin);


module.exports = router;
