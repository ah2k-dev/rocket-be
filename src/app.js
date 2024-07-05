const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const ApiError = require("./utils/ApiError");
const app = express();
const router = require("./router");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger_output.json"); // Generated Swagger file
const sendMail = require("./utils/sendMail");
const fileUpload = require("express-fileupload");
const path = require("path");

// Middlewares
app.use(express.json({
  limit: "50mb",
}));
app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(loggerMiddleware);
app.use(fileUpload());

// router index
app.use("/", router);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// api doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/", async(req, res) => {
  // await sendMail("zubarif234@gmail.com", "Test", "Test message")
  console.log("Mail sent")
  res.send("BE-boilerplate v1.1");
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

module.exports = app;
