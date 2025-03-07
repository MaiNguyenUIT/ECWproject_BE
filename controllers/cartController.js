const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");

const addToCart = asyncHandler(async (req, res) => {
  const { cartItem, quantity } = req.body;
  const { _id } = req.user;
  try {
    const cart = await Cart.findOne({ userId: _id });

    if (cart) {
      const existingProduct = cart.products.find(
        (product) => product.cartItem === cartItem
      );

      if (existingProduct) {
        existingProduct.quantity += Number(quantity);
      } else {
        cart.products.push({ cartItem, quantity });
      }
      await cart.save();
      res.status(200).json("Added to cart");
    } else {
      console.log("2");
      const newCart = new Cart({
        userId: _id,
        products: [{ cartItem, quantity }],
      });

      await newCart.save();
      res.status(200).json("Added to cart");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ userId })

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json(error);
  }
});

const deleteCartItem = asyncHandler(async (req, res) => {
  const cartItemId = req.params.cartItemId;
  const userId = req.user._id;
  try {
  const updatedCart = await Cart.updateOne({ userId }, { $pull: { products: { cartItemId } } });

    if (!updatedCart) {
      return res.status(404).json("Cart item not found");
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

const decrementCartItem = asyncHandler(async (req, res) => {
  const { cartItem } = req.body;
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json("Cart not found");
    }

    const existingProduct = cart.products.find(
      (product) => product.cartItem === cartItem
    );

    if (!existingProduct) {
      return res.status(404).json("Product not found");
    }

    if (existingProduct.quantity === 1) {
      cart.products = cart.products.filter(
        (product) => product.cartItem !== cartItem
      );
    } else {
      existingProduct.quantity -= 1;
    }

    await cart.save();

    if (existingProduct.quantity === 0) {
      await Cart.updateOne({ userId }, { $pull: { products: { cartItem } } });
    }

    res.status(200).json("Cart item updated");
  } catch (error) {
    res.status(500).json(error);
  }
});

const increaseCartItem = asyncHandler(async (req, res) => {
  const { cartItem } = req.body;
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json("Cart not found");
    }

    const existingProduct = cart.products.find(
      (product) => product.cartItem.toString() === cartItem
    );

    if (!existingProduct) {
      return res.status(404).json("Product not found");
    }

    existingProduct.quantity += 1;
    await cart.save();
    res.status(200).json("Cart item updated");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = { addToCart, getCart, deleteCartItem, decrementCartItem, increaseCartItem };
