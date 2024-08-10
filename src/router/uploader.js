const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("../config/cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");
const dotenv = require("dotenv");

dotenv.config({
  path: "./src/config/config.env",
});
const app = express();
const router = express.Router();

// Middleware to handle file uploads
app.use(fileUpload());

router.post("/", async (req, res) => {
  try {
    const { file } = req.files;
    if (!file) {
      return ErrorHandler("Please provide a file", 400, req, res);
    }

   const result = await cloudinary.uploader
      .upload_stream((error, result) => {
        if (error) {
          return ErrorHandler(error.message, 500, req, res);
        }
        return SuccessHandler(
          { filePath: result.secure_url },
          200,
          res
        );
      })
      .end(file.data);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
});

app.use("/api/upload", router);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

module.exports = router;
