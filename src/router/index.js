const auth = require("./auth");
const admin = require("./admin");
const requests = require("./requests");
const faqs = require("./faqs");
const { isAuthenticated, isAdminOrModerator } = require("../middleware/auth");
const router = require("express").Router();

router.use("/auth", auth);
router.use("/requests", isAuthenticated, requests);
router.use("/admin", isAuthenticated, isAdminOrModerator, admin);
router.use("/faqs", faqs);

module.exports = router;
