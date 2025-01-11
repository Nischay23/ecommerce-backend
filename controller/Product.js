import { Product } from "../model/Product.js";

export async function createProduct(req, res) {
  const product = new Product(req.body);
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
}

export async function fetchAllProducts(req, res) {
  // Base query with filtering to exclude deleted products
  let query = Product.find({ deleted: { $ne: true } });
  let totalProductsQuery = Product.find({ deleted: { $ne: true } });

  // Apply category filter if provided
  if (req.query.category) {
    const categories = req.query.category.split(","); // Handling multiple categories (comma-separated)
    query = query.find({ category: { $in: categories } });
    totalProductsQuery = totalProductsQuery.find({
      category: { $in: categories },
    });
  }

  // Apply brand filter if provided
  if (req.query.brand) {
    const brands = req.query.brand.split(","); // Handling multiple brands (comma-separated)
    query = query.find({ brand: { $in: brands } });
    totalProductsQuery = totalProductsQuery.find({ brand: { $in: brands } });
  }

  // Apply sorting if provided
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  // Count the total documents for pagination
  const totalDocs = await totalProductsQuery.countDocuments().exec();
  console.log(totalDocs);

  // Apply pagination if provided
  if (req.query._page && req.query._per_page) {
    const pageSize = parseInt(req.query._per_page, 10); // Convert to number
    const page = parseInt(req.query._page, 10); // Convert to number
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    // Fetch the documents based on query with filters, sorting, and pagination
    const docs = await query.exec();

    // Send response with total count of documents in the X-Total-Count header
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    // Handle errors by sending status 400 and the error message
    res.status(400).json(err);
  }
}

export const fetchProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};
