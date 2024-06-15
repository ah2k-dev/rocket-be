const auth = require("./auth");
const admin = require("./admin");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const router = require("express").Router();

router.use("/auth", auth);
router.use("/admin", isAuthenticated, isAdmin, admin);

module.exports = router;
