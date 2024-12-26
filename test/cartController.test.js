const { addToCart, getCart, deleteCartItem, decrementCartItem, increaseCartItem } = require("../controllers/cartController");
const Cart = require("../models/cartModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");



let mongoServer;

jest.mock("../models/cartModel");  // Mock Cart model

//Add to cart
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

//Get Cart
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

//Delete Cart
// describe("deleteCartItem", () => {
//   let req, res;

//   beforeEach(() => {
//     req = httpMocks.createRequest();
//     res = httpMocks.createResponse();
//   });

//   it("should delete a product from the cart and return updated cart", async () => {
//     // Mock Cart data
//     const mockCartItemId = new mongoose.Types.ObjectId()
//     const mockCart = {
//       userId: 1234567,
//       products: [
//         { cartItem: mockCartItemId, quantity: 2 },
//         { cartItem: new mongoose.Types.ObjectId(), quantity: 1 },
//       ],
//       save: jest.fn(),
//     };

//     // Mô phỏng Cart.findOneAndUpdate để trả về giỏ hàng đã được cập nhật
//     Cart.updateOne.mockResolvedValue({
//       acknowledged: true,
//       matchedCount: 1,
//       modifiedCount: 1,
//     });

//     // Cấu hình request
//     req.params.cartItemId = mockCartItemId;
//     req.user = { _id : mockCart.userId };

//     Cart.findOne.mockResolvedValue(mockCart); // Giả lập Cart.findOne cho ví dụ này

//     // Gọi controller deleteCartItem
//     await deleteCartItem(req, res);
    
//     // Kiểm tra xem API đã trả về mã trạng thái 200
//     expect(res.statusCode).toBe(200);

//     // Kiểm tra xem sản phẩm đã được xóa chưa
    
//     const responseData = res._getData();
//     expect(responseData.products.length).toBe(1);  // Giỏ hàng còn lại 1 sản phẩm
//     expect(responseData.products[0]._id).not.toBe(mockCartItemId);  // Sản phẩm cũ bị xóa
//   });

//   it("should return 404 if cart item is not found", async () => {
//     const mockCartItemId = new mongoose.Types.ObjectId();

//     // Mô phỏng Cart.findOneAndUpdate không tìm thấy sản phẩm
//     Cart.findOneAndUpdate.mockResolvedValue(null);

//     // Cấu hình request
//     req.params.cartItemId = mockCartItemId;
//     req.user = 1234567;

//     // Gọi controller deleteCartItem
//     await deleteCartItem(req, res);

//     // Kiểm tra mã trạng thái trả về
//     expect(res.statusCode).toBe(404);

//     // Kiểm tra phản hồi lỗi
//     const responseData = res._getData();  // Lấy phản hồi
//     expect(responseData.replace(/"/g, '')).toBe("Cart item not found");
//   });
// });

describe("increaseCartItem", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it("should increase the quantity of an existing cart item", async () => {
    const userId = 1234567;
    const cartItemId = new mongoose.Types.ObjectId();
    
    // Mock data
    const mockCart = {
      userId,
      products: [{ cartItem: cartItemId, quantity: 1 }],
      save: jest.fn().mockResolvedValue(true),
    };

    req.user = { _id: userId };
    req.body = { cartItem: cartItemId.toString() };

    Cart.findOne.mockResolvedValue(mockCart);

    await increaseCartItem(req, res);

    // Assertions
    expect(mockCart.products[0].quantity).toBe(2); // Quantity increased
    expect(mockCart.save).toHaveBeenCalled(); // Save called
    expect(res.statusCode).toBe(200); // HTTP status is 200
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Cart item updated"); // Correct response message
  });

  it("should return 404 if the cart is not found", async () => {
    req.user = { _id: 1234567 };
    req.body = { cartItem: new mongoose.Types.ObjectId().toString() };

    Cart.findOne.mockResolvedValue(null); // Simulate no cart found

    await increaseCartItem(req, res);

    // Assertions
    expect(res.statusCode).toBe(404); // HTTP status is 404
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Cart not found"); // Correct response message
  });

  it("should return 404 if the product is not found in the cart", async () => {
    const userId = 1234567;
    const cartItemId = new mongoose.Types.ObjectId();

    const mockCart = {
      userId,
      products: [{ cartItem: new mongoose.Types.ObjectId(), quantity: 1 }], // Different cartItem
      save: jest.fn(),
    };

    req.user = { _id: 1234567 };
    req.body = { cartItem: cartItemId.toString() };

    Cart.findOne.mockResolvedValue(mockCart);

    await increaseCartItem(req, res);

    // Assertions
    expect(res.statusCode).toBe(404); // HTTP status is 404
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Product not found");; // Correct response message
  });
});
//
describe("decrementCartItem", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if cart is not found", async () => {
    req.user = { _id: 1234567 };
    req.body = { cartItem: new mongoose.Types.ObjectId() };

    Cart.findOne.mockResolvedValue(null);

    await decrementCartItem(req, res);

    expect(res.statusCode).toBe(404);
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Cart not found");
  });

  it("should return 404 if product is not found in the cart", async () => {
    const mockCart = {
      userId: 1234567,
      products: [],
      save: jest.fn(),
    };

    req.user = { _id: 1234567 };
    req.body = { cartItem: new mongoose.Types.ObjectId() };

    Cart.findOne.mockResolvedValue(mockCart);

    await decrementCartItem(req, res);

    expect(res.statusCode).toBe(404);
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Product not found");; // Correct response message
  });

  it("should decrement quantity if product exists and quantity > 1", async () => {
    const userId = 1234567;
    const cartItemId = new mongoose.Types.ObjectId();
    const mockCart = {
      userId: 1234567,
      products: [{ cartItem: cartItemId, quantity: 2 }],
      save: jest.fn(),
    };

    req.user = { _id: userId };
    req.body = { cartItem: cartItemId };

    Cart.findOne.mockResolvedValue(mockCart);

    await decrementCartItem(req, res);

    expect(mockCart.products[0].quantity).toBe(1); // Quantity giảm đi 1
    expect(mockCart.save).toHaveBeenCalled(); // Phương thức save được gọi
    expect(res.statusCode).toBe(200);
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Cart item updated");
  });

  it("should remove product from cart if quantity becomes 0", async () => {
    const cartItemId = new mongoose.Types.ObjectId();
    const userId = 1234567;
    const mockCart = {
      userId: 1234567,
      products: [{ cartItem: cartItemId, quantity: 1 }],
      save: jest.fn(),
    };

    req.user = { _id: userId };
    req.body = { cartItem: cartItemId };

    Cart.findOne.mockResolvedValue(mockCart);
    Cart.updateOne.mockResolvedValue({});

    await decrementCartItem(req, res);

    expect(mockCart.products.length).toBe(0); // Sản phẩm bị xóa khỏi giỏ hàng
    expect(mockCart.save).toHaveBeenCalled(); // Phương thức save được gọi
    expect(res.statusCode).toBe(200);
    const responseData = res._getData();  // Lấy phản hồi
    expect(responseData.replace(/"/g, '')).toBe("Cart item updated");
  });
});
