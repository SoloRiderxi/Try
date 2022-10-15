require("dotenv").config();
import User from "../models/user";
import Link from "../models/link";
import { hashPassword, comparePassword } from "../helpers/auth";
import jwt from "jsonwebtoken";
import nanoid from "nanoid";
import cloudinary from "cloudinary";

// sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const signup = async (req, res) => {
  console.log("HIT SIGNUP");
  try {
    // validation
    const { name, email, password } = req.body;
    if (!name) {
      return res.json({
        error: "Name is required",
      });
    }
    if (!email) {
      return res.json({
        error: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);

    try {
      const user = await new User({
        name,
        email,
        password: hashedPassword,
      }).save();

      // create signed token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      //   console.log(user);
      const { password, ...rest } = user._doc;
      return res.json({
        token,
        user: rest,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

export const signin = async (req, res) => {
  // console.log(req.body);
  try {
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "Wrong email! Try again or sign up",
      });
    }
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: "Wrong password",
      });
    }
    // create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;
    user.secret = undefined;
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "User not found" });
  }
  // generate code
  const resetCode = nanoid(5).toUpperCase();
  // save to db
  user.resetCode = resetCode;
  user.save();
  // prepare email
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password reset code",
    html: `<h3>Your password  reset code is: </h3>
          <h1 style="color:red;">${resetCode}</h1>
    `,
  };
  // send email
  try {
    const data = await sgMail.send(emailData);
    console.log(data);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
};

export const resetPassword = async (req, res) => {
  try {
    //console.log(req.body);
    const { email, password, code } = req.body;
    // find user based on email and resetCode
    const user = await User.findOne({ email, code });
    // if user not found
    if (!user) {
      return res.json({ error: "Email or reset code is invalid" });
    }
    // if password is short
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.code = "";
    user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.imageUpload = async (req, res) => {
  //console.log("Body => ", req.body);
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: nanoid(),
      resource_type: "jpg",
    });
    //console.log("Result => ", result);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      },
      { new: true }
    );
    return res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const updatePassword = async (req, res) => {
  //console.log(req.body);
  try {
    const { password } = req.body;
    if (password && password.length < 6) {
      return res.json({
        error: "password is required and must be more than 6 letters",
      });
    } else {
      const hashedPassword = await hashPassword(password);
      const user = await User.findByIdAndUpdate(req.user._id, {
        password: hashedPassword,
      });
      user.password = undefined;
      user.secret = undefined;
      return res.json(user);
    }
  } catch (err) {
    console.log(err);
    return res.json({ error: err.message });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId).select(
      "-password -secert"
    );
    const links = await Link.find({ postedBy: req.params.userId })
      .populate("postedBy", "_id")
      .select("urlPreview views likes");
    return res.json({ profile, links });
  } catch (err) {
    console.log(err);
  }
};
