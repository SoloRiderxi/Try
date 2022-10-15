require("dotenv").config();
import bcrypt from "bcrypt";
import expressJWT from "express-jwt";

export const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

export const comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

export const signedIn = expressJWT({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});
