import express from "express";
import bodyParser from "body-parser";
import { Sequelize, DataTypes } from "sequelize";

const app = express();
app.use(bodyParser.json());

// ---------------- DATABASE SETUP ----------------
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite"
});

const Brand = sequelize.define("Brand", {
  name: { type: DataTypes.STRING, allowNull: false },
  year_founded: { type: DataTypes.INTEGER, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false }
});

const Product = sequelize.define("Product", {
  product_name: { type: DataTypes.STRING, allowNull: false },
  category_name: { type: DataTypes.STRING, allowNull: false },
  description_text: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false },
  processor: { type: DataTypes.STRING },
  memory: { type: DataTypes.STRING },
  release_date: { type: DataTypes.DATEONLY },
  average_rating: { type: DataTypes.FLOAT },
  rating_count: { type: DataTypes.INTEGER }
});

// Relationships
Brand.hasMany(Product, { foreignKey: "brandId" });
Product.belongsTo(Brand, { foreignKey: "brandId" });

// ---------------- HELPER FUNCTIONS ----------------
function formatResponse(product) {
  return {
    product_id: product.id,
    product_name: product.product_name,
    brand: {
      name: product.Brand?.name,
      year_founded: product.Brand?.year_founded,
      company_age: new Date().getFullYear() - product.Brand?.year_founded,
      address: product.Brand?.address
    },
    category_name: product.category_name,
    description_text: product.description_text,
    price: product.price,
    currency: product.currency,
    processor: product.processor,
    memory: product.memory,
    release_date: product.release_date,
    average_rating: product.average_rating,
    rating_count: product.rating_count
  };
}

// ---------------- STEP 6: DATABASE API ----------------
app.get("/step6", async (req, res) => {
  try {
    const { page = 1, limit = 5, brand, category } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category_name = category;

    const brandWhere = brand ? { name: brand } : {};

    const products = await Product.findAll({
      where,
      include: [{ model: Brand, where: brandWhere }],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(products.map(formatResponse));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ---------------- STEP 7: CRUD ----------------
// CREATE
app.post("/step7/create", async (req, res) => {
  try {
    const { product_name, brand, category_name, description_text, price, currency,
      processor, memory, release_date, average_rating, rating_count } = req.body;

    if (!product_name || !brand?.name || !price || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let brandRecord = await Brand.findOne({ where: { name: brand.name } });
    if (!brandRecord) {
      brandRecord = await Brand.create({
        name: brand.name,
        year_founded: brand.year_founded,
        address: brand.address
      });
    }

    const product = await Product.create({
      product_name,
      category_name,
      description_text,
      price,
      currency,
      processor,
      memory,
      release_date,
      average_rating,
      rating_count,
      brandId: brandRecord.id
    });

    res.status(201).json(formatResponse(await Product.findByPk(product.id, { include: Brand })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// UPDATE
app.put("/step7/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { include: Brand });
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.update(req.body);
    res.json(formatResponse(await Product.findByPk(id, { include: Brand })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE
app.delete("/step7/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
sequelize.sync({ force: true }).then(async () => {
  // Seed data
  const samsung = await Brand.create({
    name: "Samsung",
    year_founded: 1938,
    address: "123 Innovation Drive, Seoul, South Korea"
  });
  await Product.create({
    product_name: "Galaxy S24",
    category_name: "Smartphone",
    description_text: "Latest Samsung flagship phone",
    price: 999.99,
    currency: "USD",
    processor: "Snapdragon 8 Gen 3",
    memory: "12GB",
    release_date: "2024-01-15",
    average_rating: 4.7,
    rating_count: 1200,
    brandId: samsung.id
  });

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
