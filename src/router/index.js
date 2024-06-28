const auth = require("./auth");
const admin = require("./admin");
const requests = require("./requests");
const faqs = require("./faqs");
const uploader = require("./uploader");
const { isAuthenticated, isAdminOrModerator } = require("../middleware/auth");
const router = require("express").Router();

router.use("/auth", auth);
router.use("/requests", isAuthenticated, requests);
router.use("/admin", isAuthenticated, admin);
router.use("/uploader", uploader);
router.use("/faqs", faqs);

module.exports = router;
