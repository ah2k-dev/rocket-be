const express = require("express");
const router = express.Router();
const requests = require("../controllers/requestsController");
const { isUser, isAdmin } = require("../middleware/auth");

router.route("/createSnsRequest").post(isUser, requests.createSnsRequest);
router.route("/createCkmbgRequest").post(isUser, requests.createCkmbgRequest);

router.route("/getCompletedRequests").get(requests.getCompletedRequests);
router.route("/getSnsRequests").get(requests.getSnsRequests);
router.route("/getCkmbgRequests").get(requests.getCkmbgRequests);
router.route("/getRequests").get(requests.getSingleRequest);

router.route("/status/:id").put(isAdmin, requests.updateStatus);

module.exports = router;
