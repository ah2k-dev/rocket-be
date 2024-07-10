const express = require("express");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const path = require("path");

const router = express.Router();

router.post("/", async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const { file } = req.files;
    if (!file) {
      return ErrorHandler("Please provide a file", 400, req, res);
    }
    const filePath = "/uploads/" +  Date.now() + file.name;
    await file.mv(
      path.join(__dirname, "../../uploads", `${Date.now()}${file.name}`),
      (err) => {
        if (err) {
          console.error(err);
          return ErrorHandler("Error uploading file", 500, req, res);
        }
      }
    );
    return SuccessHandler({ filePath }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
});

module.exports = router;
