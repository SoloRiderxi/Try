import express from "express";

const router = express.Router();

// controllers
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  imageUpload,
  updatePassword,
  userProfile,
} = require("../controllers/auth");

const { signedIn } = require("../helpers/auth");

router.get("/", (req, res) => {
  return res.json({
    data: "hello world from API",
  });
});
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/image-upload", signedIn, imageUpload);
router.post("/update-password", signedIn, updatePassword);
router.get("/user-profile/:userId", userProfile);

export default router;
