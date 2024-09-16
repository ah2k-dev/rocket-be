const express = require("express");
const admin = require("../controllers/adminController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

//put
router.route("/updateProfile").put(isAuthenticated,admin.updateProfile);
router.route("/updateUser/:id").put(isAuthenticated,admin.updateUser);
router.route("/activateDeactivateUser/:id").put(isAuthenticated,admin.activateDeactivateUser);
//post
router.route("/createUser").post(isAuthenticated,admin.createUser);
//get
router.route("/getUsers").get(isAuthenticated,admin.getUsers);
router.route("/getUser/:id").get(isAuthenticated,admin.getUser);
router.route("/dashboardStats").get(isAuthenticated,admin.dashboardStats);
router.route("/dashboardCharts").get(isAuthenticated,admin.dashboardCharts);
router.route("/dashboardActivities").get(isAuthenticated,admin.dashboardActivities);
//delete
router.route("/deleteUser/:id").delete(isAuthenticated,admin.deleteUser);

module.exports = router;
