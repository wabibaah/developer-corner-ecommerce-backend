import asyncHandler from "express-async-handler";
import slugify from "slugify";
import fs from "fs";

import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";
import { cloudinaryUploadImg } from "../utils/cloudinary.js";
import { validateMongoDBId } from "../utils/validateMongodbId.js";

export const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      // so this actually means that we can add things to the req.body
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    throw new Error(err);
  }
});

export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    // foreach does not return anything so query object 2 is undefined but the original array was changed
    excludeFields.forEach((field) => delete queryObject[field]);
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createAt"); // or in some cases it can be updatedAt if that is what the app demands
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      console.log(fields);
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("This page does not exist");
      }
    }

    const allProducts = await query;
    res.json(allProducts);
  } catch (err) {
    throw new Error(err);
  }
});

export const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const singleProduct = await Product.findById(id);
    if (!singleProduct) throw new Error("User not found");
    res.status(200).json(singleProduct);
  } catch (err) {
    throw new Error(err);
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.status(201).json(updatedProduct);
  } catch (err) {
    throw new Error(err);
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.json(deletedProduct);
  } catch (err) {
    throw new Error(err);
  }
});

export const addToWishList = asyncHandler(async (req, res) => {
  // if the id is coming from the req.user it is _id, but if it is coming from req.body or req.params it is id because we are giving it that name
  const { _id } = req.user;
  validateMongoDBId(_id);
  const { prodId } = req.body;

  try {
    const user = await User.findById(_id);
    const alreadyAddedToWishlist = user?.wishlist?.find(
      (prod_id) => prod_id.toString() === prodId.toString()
    );
    if (alreadyAddedToWishlist) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        { new: true }
      );
      res.status(201).json(user.wishlist);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        { new: true }
      );
      res.status(201).json(user.wishlist);
    }
  } catch (err) {
    throw new Error(err);
  }
});

export const productRating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id);
  const { star, prodId, comment } = req.body;
  const product = await Product.findById(prodId);
  let alreadyRated = product.ratings.find(
    (user_id) => user_id.postedby.toString() === _id.toString()
  );

  try {
    if (alreadyRated) {
      const ratedProduct = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        { new: true }
      );
      // res.status(201).json(ratedProduct);
    } else {
      const ratedProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        { new: true }
      );
      // res.status(201).json(ratedProduct);
    }
    const getAllRatings = await Product.findById(prodId);
    let totalRating = getAllRatings.ratings.length;
    let ratingSum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    const totalRatedProduct = await Product.findByIdAndUpdate(
      prodId,
      { totalRating: actualRating },
      { new: true }
    );
    res.status(200).json(totalRatedProduct);
  } catch (err) {
    throw new Error(err);
  }
});

export const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json(findProduct);
  } catch (err) {
    throw new Error(err);
  }
});

// { christ: 'saviour' }
// { christ: 'saviour', jesus: '' }
// { christ: 'saviour', jesus: 'son_of_god' }
// { christ: 'saviour', jesus: 'son_of_god' }
// { christ: 'saviour', jesus: 'son_of_god forever' , tetteh: 'second_born'}

// find({brand: req.query.brand}) this means that even if you pass a lot of queries in the url, it is only picking the brand
// so find is just like we are finding but we are not finding one or finding by i. like findBy by id and update or findOneAndUpdate
// so now it means that the categories that i said i was going to search on peoples website i can't because we are now choosing what we are going to find by. I wonder if that same technique can be used to get products but the same user or just something (i don't know)

// { brand: 'Samsung', color: 'Red', category: 'Laptop' }
// { brand: 'Samsung', color: 'Red', category: 'Laptop', sort: 'price' }
// we will first of all perform the filtering, then the sorting , then the limiting , then pagination

// forEach does not return anything but mutates the original array that it works with
// const queryObject2 = excludeFields.forEach((field) => delete queryObject[field]);
// {
//   queryObject: { brand: 'Samsung', color: 'Red', category: 'Laptop', sort: 'price' }
// }
// { queryObject2: undefined }
// { queryObject: { brand: 'Samsung', color: 'Red', category: 'Laptop' } }

// localhost:8000/api/product?price[gte]=50&category=Laptop&price[lte]=200

// const allProducts = await Product.find(req.query);  // this will work but the one below is the advanced one
// const allProducts = await Product.find({
//   brand: req.query.brand,
//   category: req.query.category,
// });
// const allProducts = await Product.where("category").equals(req.query.category);

// localhost:8000/api/product?sort=category,brand,price
// localhost:8000/api/product?sort=-category,-brand,price

// localhost:8000/api/product?sort=-price&fields=title,price
// localhost:8000/api/product?sort=-price&fields=-title,-price,-category
// this means we are not getting title, price and category

// doing more user?.wishlist?.find(prod_id => prod_id.toString() === prodId.toString()) give me more error messages

// create(req.body)
// save()
