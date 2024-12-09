const { createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getCategories, } = require("../controllers/categoryController");
const Category = require("../models/categoryModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");



let mongoServer;

jest.mock("../models/categoryModel");  // Mock Cart model

describe('add category', () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });
  
    it('should create a category and return the category object', async () => {
      const mockCategoryData = {
        title: 'Electronics',
      };
  
      const mockCategory = {
        _id: new mongoose.Types.ObjectId(),
        title: mockCategoryData.title,
      };
  
      // Mock the Category.create method to return the mock category
      Category.create.mockResolvedValue(mockCategory);
  
      req.body = mockCategoryData; // Mock the request body
  
      await createCategory(req, res); // Call the controller
  
      // Check if the response has a 201 status code
      expect(res.statusCode).toBe(201);
  
      // Check if the response body is correct
      const responseData = JSON.parse(res._getData());
      expect(responseData).toHaveProperty('_id');
      expect(responseData).toHaveProperty('title', mockCategoryData.title);
    });
  
    it('should return a 400 error if title is missing', async () => {
      req.body = {}; // Empty body to simulate missing title
  
      await createCategory(req, res);
  
      // Check if the status code is 400
      expect(res.statusCode).toBe(400);
  
      // Check if the error message is correct
    });
  });

  describe('get category', () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });
  
    it('should return a category if it is found', async () => {
      const mockCategoryId = new mongoose.Types.ObjectId();
      const mockCategory = {
        _id: mockCategoryId,
        title: 'Electronics',
      };
  
      // Mock Category.findById to return a mock category
      Category.findById.mockResolvedValue(mockCategory);
  
      req.params.id = mockCategoryId; // Set the category ID in the request
  
      await getCategory(req, res);
  
      // Check if the status code is 200
      expect(res.statusCode).toBe(200);
  
      // Parse the response data
      const responseData = JSON.parse(res._getData());
  
      // Check if the response body contains the category's data
      expect(responseData).toHaveProperty('_id');
      expect(responseData.title).toBe(mockCategory.title);
    });
  
    it('should return a 404 error if category is not found', async () => {
      const mockCategoryId = new mongoose.Types.ObjectId();
  
      // Mock Category.findById to return null (not found)
      Category.findById.mockResolvedValue(null);
  
      req.params.id = mockCategoryId; // Set the category ID in the request
  
      await getCategory(req, res);
  
      // Check if the status code is 404
      expect(res.statusCode).toBe(404);
  
      // Parse the response data
    });
  });

  describe('get categories', () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });
  
    it('should return all categories sorted by creation date', async () => {
      const mockCategories = [
        { _id: new mongoose.Types.ObjectId(), title: 'Electronics'},
        { _id: new mongoose.Types.ObjectId(), title: 'Books'},
      ];
  
      // Mock Category.find to return mockCategories
      Category.find.mockResolvedValue(mockCategories);
  
      // Call the getCategories function
      await getCategories(req, res);
  
      // Check if the response status is 200
      expect(res.statusCode).toBe(200);
  
      // Parse the response data
      const responseData = JSON.parse(res._getData());
  
      // Check if the response body contains the categories
      expect(responseData.length).toBe(2); // Ensure two categories are returned
      expect(responseData[0].title).toBe('Electronics'); // Check that the first category is Electronics
      expect(responseData[1].title).toBe('Books'); // Check that the second category is Books
    });
});

describe('update category', () => {
    let req, res;
  
    beforeEach(() => {
      req = httpMocks.createRequest();
      res = httpMocks.createResponse();
    });
  
    it('should update category title if category is found', async () => {
      const mockCategoryId = new mongoose.Types.ObjectId();
      const mockCategory = {
        _id: mockCategoryId,
        title: 'Electronics',
        save: jest.fn().mockResolvedValue(true),
      };
  
      // Mock Category.findById to return the mock category
      Category.findById.mockResolvedValue(mockCategory);
  
      // Set up request body and params
      req.body = { title: 'Updated Electronics' };
      req.params.id = mockCategoryId;
  
      // Call the updateCategory function
      await updateCategory(req, res);
  
      // Check if the status code is 200
      expect(res.statusCode).toBe(200);
  
      // Parse the response data
      const responseData = JSON.parse(res._getData());
  
      // Check if the category title has been updated
      expect(responseData.title).toBe('Updated Electronics');
  
      // Check if save was called
      expect(mockCategory.save).toHaveBeenCalled();
    });
  
    it('should return a 404 error if category is not found', async () => {
      const mockCategoryId = new mongoose.Types.ObjectId();
  
      // Mock Category.findById to return null (category not found)
      Category.findById.mockResolvedValue(null);
  
      // Set up request body and params
      req.body = { title: 'Updated Electronics' };
      req.params.id = mockCategoryId;
  
      // Call the updateCategory function
      await updateCategory(req, res);
  
      // Check if the status code is 404
      expect(res.statusCode).toBe(404);
    });
  });

describe('delete category', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('should delete category if it exists', async () => {
    const mockCategoryId = new mongoose.Types.ObjectId();
    const mockCategory = {
      _id: mockCategoryId,
      title: 'Electronics',
    };

    // Mock Category.findById to return the mock category
    Category.findById.mockResolvedValue(mockCategory);

    // Mock Category.findByIdAndDelete to simulate successful deletion
    Category.findByIdAndDelete.mockResolvedValue(mockCategory);

    // Set up request parameters
    req.params.id = mockCategoryId;

    // Call the deleteCategory function
    await deleteCategory(req, res);

    // Check if the status code is 200
    expect(res.statusCode).toBe(200);

    // Parse the response data
    const responseData = JSON.parse(res._getData());

    // Check if the response contains the correct success message
    expect(responseData.message).toBe('Category removed');

    // Ensure findByIdAndDelete was called
    expect(Category.findByIdAndDelete).toHaveBeenCalledWith(mockCategoryId);
  });

  it('should return a 404 error if category is not found', async () => {
    const mockCategoryId = new mongoose.Types.ObjectId();

    // Mock Category.findById to return null (category not found)
    Category.findById.mockResolvedValue(null);

    // Set up request parameters
    req.params.id = mockCategoryId;

    // Call the deleteCategory function
    await deleteCategory(req, res);

    // Check if the status code is 404
    expect(res.statusCode).toBe(404);

    // Parse the response data
  });
});