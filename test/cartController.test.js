const { addToCart, getCart, deleteCartItem, decrementCartItem, increaseCartItem } = require("../controllers/cartController");
const Cart = require("../models/cartModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");


let mongoServer;

jest.mock("../models/cartModel");  // Mock Cart model

describe("addToCart", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  afterEach(async () => {
    await Cart.deleteMany(); // Clean up test data
  });

  it("should add product to existing product cart", async () => {
    const mockCart = {
      userId: 1234567,
      products: [{ cartItem: new mongoose.Types.ObjectId(), quantity: 2 }],
      save: jest.fn(),
    };

    req.body = { cartItem: mockCart.products[0].cartItem, quantity: 3 };  // Sản phẩm mới và số lượng
    req.user = { _id: mockCart.userId };
    Cart.findOne.mockResolvedValue(mockCart);  // Giả lập việc tìm thấy giỏ hàng

    await addToCart(req, res);

    // Kiểm tra số lượng sản phẩm trong giỏ hàng sau khi thêm
    expect(mockCart.products.length).toBe(1);  // Giỏ hàng vẫn còn 1 sản phẩm
    expect(mockCart.products[0].quantity).toBe(5);  // Sản phẩm đầu tiên có số lượng là 5 (2 + 3)
    expect(mockCart.save).toHaveBeenCalled();  // Kiểm tra xem phương thức save có được gọi không
    expect(res.statusCode).toBe(200);  // Kiểm tra mã trạng thái HTTP
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Added to cart");  // Kiểm tra thông điệp phản hồi    // Kiểm tra thông điệp phản hồi
  });

  it("should add new product to cart", async () => {
    const mockCart = {
      userId: 1234567,
      products: [{ cartItem: new mongoose.Types.ObjectId(), quantity: 2 }],
      save: jest.fn(),
    };
    const cartItem_id = new mongoose.Types.ObjectId();
    req.body = { cartItem: cartItem_id, quantity: 2 };
    req.user = { _id: 1234567 };

    await addToCart(req, res);

    const newCart = await Cart.findOne({ userId: req.user._id });

    expect(newCart).not.toBeNull();
    expect(newCart.products.length).toBe(2);
    expect(newCart.products[1].cartItem).toBe(cartItem_id);
    expect(res.statusCode).toBe(200);
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Added to cart");
  });
});

describe("getCart", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it("should return the user's cart if it exists", async () => {
    // Mock data for the test
    const cartItem_id1 = new mongoose.Types.ObjectId();
    const cartItem_id2 = new mongoose.Types.ObjectId();
    const mockCart = {
      userId: 1234567,
      products: [
        { cartItem: cartItem_id1, quantity: 2 },
        { cartItem: cartItem_id2, quantity: 1 }
      ]
    };

    // Mock the Cart.findOne() to resolve with mockCart
    Cart.findOne.mockResolvedValue(mockCart);

    // Set up the request object with user ID
    req.user = { _id: mockCart.userId };

    // Call the controller function
    await getCart(req, res);

    // Assert that the response status code is 200
    expect(res.statusCode).toBe(200);

    // Assert that the response body contains the correct cart data
    const responseData = res._getJSONData();

    // Assert that the response body contains the correct cart data
    // Compare the structure and values of mockCart and responseData
    expect(responseData.userId).toBe(mockCart.userId);  // Check user ID
    expect(responseData.products.length).toBe(mockCart.products.length);  // Check number of products
    expect(responseData.products[0].cartItem.toString()).toBe(cartItem_id1.toString());  // Check first product ID
    expect(responseData.products[1].cartItem.toString()).toBe(cartItem_id2.toString());  // Check second product ID
    expect(responseData.products[0].quantity).toBe(mockCart.products[0].quantity);  // Check quantity of first product
    expect(responseData.products[1].quantity).toBe(mockCart.products[1].quantity);  // Check quantity of second product
  });
});


