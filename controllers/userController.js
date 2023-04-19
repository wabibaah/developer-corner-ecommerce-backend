import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// import uniqid from "uniqid";

import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import Cart from "../models/CartModel.js";
import Coupon from "../models/CouponModel.js";
import Order from "../models/OrderModel.js";
import { generateToken } from "../config/jwtToken.js";
import { validateMongoDBId } from "../utils/validateMongodbId.js";
import { generateRefreshToken } from "../config/refreshToken.js";
import { sendEmail } from "./emailController.js";

export const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    // create a new User
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } else {
    throw new Error("User already exists");
  }
});

// it will try to use the email to check first if the user already exist, this will happen even before the registration process that will even check the unique side of mongoose and that too will prevent it

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    throw new Error("User does not exist, create one instead");
  }

  if (await findUser.isPasswordMatch(password)) {
    const refreshToken = await generateRefreshToken(findUser?.id);
    const updatedUser = await User.findByIdAndUpdate(
      findUser?._id,
      { refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 3 });
    res.status(200).json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
      // so in this token all we have is our user id and nothing else not even the isAdmin property
    });
  } else {
    throw new Error("Passwords do not match");
  }
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const findAdmin = await User.findOne({ email });

    if (!findAdmin || findAdmin?.role !== "admin") {
      if (!findAdmin) throw new Error("User does not exist, created one instead");
      throw new Error(`Not authorized as Admin, you are a ${findAdmin?.role}`);
    }

    if (await findAdmin?.isPasswordMatch(password)) {
      const refreshToken = await generateRefreshToken(findAdmin?.id);
      const updatedAdmin = await User.findByIdAndUpdate(
        findAdmin?._id,
        { refreshToken },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 3,
      });
      res.status(200).json({
        _id: updatedAdmin?._id,
        firstname: updatedAdmin?.firstname,
        lastname: updatedAdmin?.lastname,
        email: updatedAdmin?.email,
        mobile: updatedAdmin?.mobile,
        token: generateToken(updatedAdmin?._id),
        role: updatedAdmin?.role,
        // so in this token all we have is our user id and nothing else not even the isAdmin property
      });
    } else {
      throw new Error("Check your password Admin");
    }
  } catch (err) {
    // if we don't write try and catch some of the error will not be caught to be handled
    throw new Error(err);
  }
});

// handle refresh token
export const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  // console.log(cookie);
  if (!cookie?.refreshToken) throw new Error("No refresh token");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No user matches this refresh token");
  jwt.verify(refreshToken, process.env.JWT, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("refresh token does not match the user");
    }
    const accessToken = generateToken(user._id);

    res.json({ accessToken });
  });
  res.json(user);
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find();
    if (allUsers) {
      res.status(200).json(allUsers);
    } else {
      throw new Error("There are no users");
    }
  } catch (err) {
    throw new Error(err);
  }
});

export const getSingleUser = asyncHandler(async (req, res) => {
  // this one worked too
  // const singleUser = await User.findOne({ _id: req.params.id });
  const { id } = req.params;
  validateMongoDBId(id);

  const singleUser = await User.findById(id);
  if (singleUser) {
    res.status(200).json(singleUser);
  } else {
    throw new Error("User not found");
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  const deletedUser = await User.findByIdAndDelete(id);
  res.json(deletedUser);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    throw new Error(err);
  }
});

// export const blockUser = asyncHandler(async (req, res) => {
//   try {
//     const blockedUser = await User.findById(req.params.id);
//     if (blockedUser.isBlocked) {
//       throw new Error("User already blocked");
//     } else {
//       blockedUser.isBlocked = true;
//       await blockUser.save();
//     }
//     res.status(200).send("user is blocked");
//   } catch (err) {
//     throw new Error("User not found");
//   }
// });
export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const blockedUser = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    res.status(200).json({
      message: "User blocked",
    });
  } catch (err) {
    throw new Error(err);
  }
});
export const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const unblockedUser = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    res.status(200).json({ message: "User unblocked" });
  } catch (err) {
    throw new Error(err);
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204);
  }
  await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDBId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    await user.save();
    res.send("Password updated successfully");
  } else {
    res.send("Password updating failed");
  }
});

export const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error(`User with email ${email} does not exist`);
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, please follow this link to reset your password. This link is valid till 10 minutes from now. <a href="http://localhost:8000/api/user/reset-password/${token}">Click here</a>`;
    const data = {
      to: email,
      text: `User ${user.firstname}`,
      subject: "Forgot password link on Wabi Ecommerce",
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (err) {
    throw new Error(err);
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

export const getWishlist = asyncHandler(async (req, res) => {
  const { id } = req.user; // also works
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist", "title description");
    res.json(findUser);
  } catch (err) {
    throw new Error(err);
  }
});

export const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    throw new Error(err);
  }
});

export const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDBId(_id);

  try {
    let products = [];
    const user = await User.findById(_id); // i will remove this one soon
    const userCart = Cart.findOne({ orderby: user._id });
    if (userCart) {
      userCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;

      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    // console.log(products);
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    // console.log(cartTotal);
    let newCart = await Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.status(201).json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});

export const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id);
  try {
    // const user = await User.findById(_id)
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product",
      "_id title price totalAfterDiscount"
    );
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

export const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id);
  try {
    const user = await User.findById(_id);
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDBId(_id);
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
      throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    // we are choosing let because we will update / change them later, and we are destructuring it nyonglo
    let { products, cartTotal } = await Cart.findOne({ orderby: _id });
    console.log({ products }, { cartTotal });
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
    await Cart.findOneAndUpdate({ orderby: user._id }, { totalAfterDiscount }, { new: true });
    res.json(totalAfterDiscount);
  } catch (err) {
    throw new Error(err);
  }
});

export const createCashOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDBId(_id);

  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById({ _id });
    let userCart = await Cart.findOne({ orderby: user?._id });
    let finalAmount = 0;
    // you can do userCart.totalAfterDiscount > 0 to be more safe (but wait oo zero too is safe oo because zero is false autom)
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }
    let newOrder = await Order({
      products: userCart.products,
      paymentIntent: {
        // id: uniqid(),
        id: 1,
        method: "COD",
        amount: finalAmount,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "GH$",
      },
      orderby: user?._id,
      orderStatus: "Cash on Delivery",
    }).save();

    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.status(201).json({ message: "Success" });
  } catch (err) {
    throw new Error(err);
  }
});

export const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id);
  try {
    const userOrder = await Order.find({ orderby: _id }).populate("products.product").exec();
    res.status(200).json(userOrder);
  } catch (err) {
    throw new Error(err);
  }
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status, paymentIntent: { status } },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    throw new Error(err);
  }
});
