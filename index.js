import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { dbConnect } from "./config/dbConnect.js";
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import productCategoryRouter from "./routes/productCategoryRoutes.js";
import blogCategoryRouter from "./routes/blogCategoryRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import couponRouter from "./routes/couponRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();
dotenv.config();

dbConnect();

// he is using body parser too
// app.use(bodyParser.json()) and app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/product-category", productCategoryRouter);
app.use("/api/blog-category", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
