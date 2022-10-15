require("dotenv").config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import authLink from "./routes/link";

const morgan = require("morgan");

const app = express();

//db connection
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// middlewares
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// route middlewares
app.use("/api", authRoutes);
app.use("/api", authLink);

app.listen(5000, () => console.log("Server running on port 5000"));
