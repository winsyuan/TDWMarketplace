const router = require("express").Router();
let Product = require("../models/product.model");

const middleware = require("../middleware.js");

//Adds product to database
router
  .route("/")
  .post(middleware.verifyFirebaseTokenMiddleware, async (req, res) => {
    try {
      if (
        !req.body.name ||
        !req.body.uid ||
        !req.body.startingBid ||
        !req.body.description ||
        !req.body.biddingDate ||
        req.body.roomStatus === null ||
        !req.body.productImage
      ) {
        return res
          .status(422)
          .json({ error: "Missing or Invalid Body Param." });
      }
      const {
        name,
        uid,
        startingBid,
        description,
        biddingDate,
        roomStatus,
        productImage,
      } = req.body;
      const newProduct = new Product({
        name,
        uid,
        startingBid,
        description,
        biddingDate,
        roomStatus,
        productImage,
      });
      const savedProduct = await newProduct.save();
      res.json(savedProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.route("/").get(async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.route("/:id/").get(async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (product === null) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router
  .route("/")
  .patch(middleware.verifyFirebaseTokenMiddleware, async (req, res) => {
    if (
      !req.body.name ||
      !req.body.uid ||
      !req.body.startingBid ||
      !req.body.description ||
      !req.body.biddingDate ||
      req.body.roomStatus === null ||
      !req.body.productImage
    ) {
      return res.status(422).json({ error: "Missing or Invalid Body Param." });
    }
    const {
      id,
      name,
      uid,
      startingBid,
      description,
      biddingDate,
      roomStatus,
      productImage,
    } = req.body;
    try {
      const product = await Product.findOne({ _id: id });
      if (product === null) {
        return res.status(404).json({ error: "Product not found" });
      }
      if (product.uid !== req.user.uid) {
        return res
          .status(403)
          .json({ error: "Requested user is not the product owner." });
      }
      const updatedProduct = await Product.updateOne(
        { _id: id },
        {
          $set: {
            roomStatus,
            name,
            uid,
            startingBid,
            description,
            biddingDate,
            productImage,
          },
        }
      );
      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router
  .route("/:id/")
  .delete(middleware.verifyFirebaseTokenMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
      const product = await Product.findOne({ _id: id });
      if (product === null) {
        return res.status(404).json({ error: "Product not found" });
      }
      if (product.uid !== req.user.uid) {
        return res
          .status(403)
          .json({ error: "Requested user is not the product owner." });
      }
      const deletedProduct = await Product.deleteOne({ _id: id });
      res.json(deletedProduct);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
