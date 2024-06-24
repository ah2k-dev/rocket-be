const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const ErrorHandler = require("../utils/ErrorHandler");
const Faq = require("../models/faqs");
const SuccessHandler = require("../utils/SuccessHandler");

const router = express.Router();

router.route("/createFaq").post(isAuthenticated, isAdmin, async (req, res) => {
  // #swagger.tags = ['faqs']
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return ErrorHandler("Please provide question and answer", 400, req, res);
    }
    // #swagger.description = 'This endpoint creates a new FAQ'
    // #swagger.parameters['obj'] = {
    //   in: 'body',
    //   description: 'FAQ information',
    //   required: true,
    //   schema: { $ref: "#/definitions/CreateFaq" }
    // }
    // #swagger.responses[201] = { description: 'FAQ created successfully' }
    // #swagger.responses[400] = { description: 'Invalid request' }
    // #swagger.responses[500] = { description: 'Server error' }

    const faq = new Faq({
      question,
      answer,
    });

    await faq.save();

    return SuccessHandler("FAQ created successfully", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
});
router.route("/getFaqs").get(async (req, res) => {
  try {
    // #swagger.tags = ['faqs']
    const faqs = await Faq.find({
      isActive: true,
    });
    // #swagger.description = 'This endpoint gets all FAQs'
    // #swagger.responses[200] = { description: 'FAQs retrieved successfully' }
    // #swagger.responses[500] = { description: 'Server error' }
    return SuccessHandler(faqs, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
});
router
  .route("/updateFaq/:id")
  .put(isAuthenticated, isAdmin, async (req, res) => {
    try {
      // #swagger.tags = ['faqs']
      const { question, answer, isPublished } = req.body;
      if (!question || !answer) {
        return ErrorHandler(
          "Please provide question and answer",
          400,
          req,
          res
        );
      }
      const faq = await Faq.findById(req.params.id);
      if (!faq) {
        return ErrorHandler("FAQ not found", 404, req, res);
      }
      faq.question = question;
      faq.answer = answer;
      faq.isPublished = isPublished;
      await faq.save();
      // #swagger.description = 'This endpoint updates a FAQ'
      // #swagger.parameters['obj'] = {
      //   in: 'body',
      //   description: 'FAQ information',
      //   required: true,
      //   schema: { $ref: "#/definitions/CreateFaq" }
      // }
      // #swagger.responses[200] = { description: 'FAQ updated successfully' }
      // #swagger.responses[400] = { description: 'Invalid request' }
      // #swagger.responses[404] = { description: 'FAQ not found' }
      // #swagger.responses[500] = { description: 'Server error' }
      return SuccessHandler("FAQ updated successfully", 200, res);
    } catch (error) {
      return ErrorHandler(error.message, 500, req, res);
    }
  });
router
  .route("/deleteFaq/:id")
  .delete(isAuthenticated, isAdmin, async (req, res) => {
    // #swagger.tags = ['faqs']
    try {
      const faq = await Faq.findById(req.params.id);
      if (!faq) {
        return ErrorHandler("FAQ not found", 404, req, res);
      }
      // #swagger.description = 'This endpoint deletes a FAQ'
      // #swagger.responses[200] = { description: 'FAQ deleted successfully' }
      // #swagger.responses[404] = { description: 'FAQ not found' }
      // #swagger.responses[500] = { description: 'Server error' }

      faq.isActive = false;
      await faq.save();
      return SuccessHandler("FAQ deleted successfully", 200, res);
    } catch (error) {
      return ErrorHandler(error.message, 500, req, res);
    }
  });

module.exports = router;
