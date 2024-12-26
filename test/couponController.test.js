const { createCoupon,
    updateCoupon,
    deleteCoupon,
    getCoupon,
    getCoupons, } = require("../controllers/couponController");
const Coupon = require("../models/couponModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");



let mongoServer;

jest.mock("../models/CouponModel");  // Mock Cart model

describe('add Coupon', () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });
  
    it('should create a Coupon and return the Coupon object', async () => {
      const mockCouponData = {
        discount: '15',
        name: 'Ma giam gia 1',
        expiry: '1/1/2024'
      };
  
      const mockCoupon = {
        _id: new mongoose.Types.ObjectId(),
        discount: '15',
        name: 'Ma giam gia 1',
        expiry: '1/1/2024'
      };
  
      // Mock the Coupon.create method to return the mock Coupon
      Coupon.create.mockResolvedValue(mockCoupon);
  
      req.body = mockCouponData; // Mock the request body
  
      await createCoupon(req, res); // Call the controller
  
      // Check if the response has a 201 status code
      expect(res.statusCode).toBe(201);
  
      // Check if the response body is correct
      const responseData = JSON.parse(res._getData());
      expect(responseData).toHaveProperty('_id');
      expect(responseData).toHaveProperty('discount', mockCouponData.discount);
      expect(responseData).toHaveProperty('name', mockCouponData.name);
      expect(responseData).toHaveProperty('expiry', mockCouponData.expiry);
    });
  });

  describe('get Coupon', () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });
  
    it('should return a Coupon if it is found', async () => {
      const mockCouponId = new mongoose.Types.ObjectId();
      const mockCoupon = {
        _id: mockCouponId,
        discount: 15,
        name: 'Ma giam gia 1',
        expiry: '1/1/2024'
      };
  
      // Mock Coupon.find to return a mock Coupon
      Coupon.findOne.mockResolvedValue(mockCoupon);
  
      req.params.name = mockCoupon.name; // Set the Coupon ID in the request
  
      await getCoupon(req, res);
  
      // Check if the status code is 200
      expect(res.statusCode).toBe(200);
  
      // Parse the response data
      const responseData = JSON.parse(res._getData());
  
      // Check if the response body contains the Coupon's data
      expect(responseData).toHaveProperty('_id');
      expect(responseData.name).toBe(mockCoupon.name);
      expect(responseData.discount).toBe(mockCoupon.discount);
      expect(responseData.expiry).toBe(mockCoupon.expiry);
    });
  
    it('should return a 404 error if Coupon is not found', async () => {
      const mockCouponId = new mongoose.Types.ObjectId();
  
      // Mock Coupon.findById to return null (not found)
      Coupon.findOne.mockResolvedValue(null);
  
      req.params.id = mockCouponId; // Set the Coupon ID in the request
  
      await getCoupon(req, res);
  
      // Check if the status code is 404
      expect(res.statusCode).toBe(404);
  
      // Parse the response data
    });
  });

  describe('get coupons', () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });
  
    it('should return all coupons', async () => {
      const mockCategories = [
        { _id: new mongoose.Types.ObjectId(), discount: 15,
            name: 'Ma giam gia 1',
            expiry: '1/1/2024'},
        { _id: new mongoose.Types.ObjectId(), discount: 16,
            name: 'Ma giam gia 2',
            expiry: '1/1/2024'},
      ];
  
      // Mock Coupon.find to return mockCategories
      Coupon.find.mockResolvedValue(mockCategories);
  
      // Call the getCoupons function
      await getCoupons(req, res);
  
      // Check if the response status is 200
      expect(res.statusCode).toBe(200);
  
      // Parse the response data
      const responseData = JSON.parse(res._getData());
  
      // Check if the response body contains the categories
      expect(responseData[0].name).toBe('Ma giam gia 1');
      expect(responseData[0].discount).toBe(15);
      expect(responseData[0].expiry).toBe('1/1/2024');

      expect(responseData[1].name).toBe('Ma giam gia 2');
      expect(responseData[1].discount).toBe(16);
      expect(responseData[1].expiry).toBe('1/1/2024');
    });
});

describe('updateCoupon', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('should return updated coupon when found and updated successfully', async () => {
    const mockCouponId = new mongoose.Types.ObjectId();
    const mockCoupon = {
      _id: mockCouponId,
      discount: 20,
      name: 'Ma giam gia 2',
      expiry: '31/12/2024'
    };

    // Mô phỏng phương thức findById
    Coupon.findById.mockResolvedValue(mockCoupon);
    // Mô phỏng phương thức findByIdAndUpdate
    Coupon.findByIdAndUpdate.mockResolvedValue({ ...mockCoupon, discount: 25 });

    req.params.id = mockCouponId;
    req.body = { discount: 25 };

    // Gọi hàm updateCoupon
    await updateCoupon(req, res);

    // Kiểm tra mã trạng thái HTTP
    expect(res.statusCode).toBe(200);

    // Kiểm tra xem response trả về có chứa dữ liệu đã cập nhật hay không
    const responseData = JSON.parse(res._getData());
    expect(responseData.discount).toBe(25);
    expect(responseData.name).toBe(mockCoupon.name);
    expect(responseData.expiry).toBe(mockCoupon.expiry);
  });

  it('should return 404 error if coupon is not found', async () => {
    const mockCouponId = new mongoose.Types.ObjectId();
    
    // Mô phỏng phương thức findById không tìm thấy coupon
    Coupon.findByIdAndUpdate.mockResolvedValue(null);

    req.params.id = mockCouponId;
    req.body = { discount: 30 };

    // Gọi hàm updateCoupon
    await updateCoupon(req, res);

    // Kiểm tra mã trạng thái HTTP (sẽ không vào catch vì lỗi được ném ra trong controller)
    expect(res.statusCode).toBe(404);

    // Kiểm tra xem thông báo lỗi có chính xác không
    const responseData = JSON.parse(res._getData());
    expect(responseData.message).toBe('ko tim thay');
  });
});

describe('delete Coupon', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('should delete Coupon if it exists', async () => {
    const mockCouponId = new mongoose.Types.ObjectId();
    const mockCoupon = {
      _id: mockCouponId,
      discount: 16,
        name: 'Ma giam gia 1',
        expiry: '2/1/2024' 
    };

    // Mock Coupon.findById to return the mock Coupon
    Coupon.findById.mockResolvedValue(mockCoupon);

    // Mock Coupon.findByIdAndDelete to simulate successful deletion
    Coupon.findByIdAndDelete.mockResolvedValue(mockCoupon);

    // Set up request parameters
    req.params.id = mockCouponId;

    // Call the deleteCoupon function
    await deleteCoupon(req, res);

    // Check if the status code is 200
    expect(res.statusCode).toBe(200);

    // Parse the response data
    const responseData = JSON.parse(res._getData());

    // Check if the response contains the correct success message

    // Ensure findByIdAndDelete was called
    expect(Coupon.findByIdAndDelete).toHaveBeenCalledWith(mockCouponId);
  });

  it('should return 404 error if coupon is not found', async () => {
    const mockCouponId = new mongoose.Types.ObjectId();
    
    // Mô phỏng phương thức findByIdAndDelete trả về null (coupon không tồn tại)
    Coupon.findByIdAndDelete.mockResolvedValue(null);

    req.params.id = mockCouponId.toString();  // Gán ID vào tham số của yêu cầu

    // Gọi hàm deleteCoupon
    await deleteCoupon(req, res);

    // Kiểm tra mã trạng thái HTTP (sẽ trả về 404 vì coupon không tồn tại)
    expect(res.statusCode).toBe(404);

    // Kiểm tra xem thông báo lỗi có đúng không
  });
});