const { createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    createPaymentUrl, } = require("../controllers/orderController");
const Order = require("../models/orderModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");



let mongoServer;

jest.mock("../models/orderModel");  // Mock Cart model

//Add to cart
describe("createOrder", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  afterEach(async () => {
    await Order.deleteMany(); // Clean up test data
  });

  it("create order success", async () => {
    const mockUser = { _id: "643d1f7e8b6f5a73e47232f1" }; // Dữ liệu người dùng mẫu
    const mockOrder = {
      user: mockUser._id,
      orderDate: "2024-12-09",
      orderTime: "10:30 AM",
      orderAmount: 100,
      orderStatus: "Pending",
      paymentMethod: "COD",
      cartItems: [{ productId: "123", quantity: 2 }],
      shippingAddress: { city: "Hanoi", address: "123 Street" },
      coupon: "DISCOUNT10",
    };

    Order.create.mockResolvedValueOnce(mockOrder);  // Giả lập việc tìm thấy giỏ hàng
    req.body = mockOrder;
    req.user = mockOrder.user;

    await createOrder(req, res);

    // Kiểm tra số lượng sản phẩm trong giỏ hàng sau khi thêm
    expect(res.statusCode).toBe(201);
  });
});
