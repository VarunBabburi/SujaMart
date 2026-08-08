const db = require("../config/db");
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sujamart.onrender.com"
    : "http://localhost:5000";

exports.addProduct = (req, res) => {

  console.log("BODY:", req.body);
  console.log("PRICE:", req.body.price);
  console.log("TYPE:", typeof req.body.price);
  console.log("FILE:", req.file);

const {
  category_id,
  name,
  description,
  price,
  stock_quantity,
  unit
} = req.body;

const image_url = req.file ? req.file.path : null;

  const sql = `
    INSERT INTO products
    (category_id,name,description,price,stock_quantity,unit,image_url)
    VALUES(?,?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [
      category_id,
      name,
      description,
      price,
      stock_quantity,
      unit,
      image_url
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: err.message
        });
      }

      res.status(201).json({
        message: "Product Added Successfully"
      });
    }
  );
};


exports.getProducts = (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(results);
  });
};


exports.getActiveProducts = (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    WHERE p.is_active = TRUE
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(results);
  });
};


exports.getProductById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT *
    FROM products
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    res.json(results[0]);
  });
};

exports.updateProduct = (req, res) => {
  const { id } = req.params;

  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const name = req.body?.name;
const description =
  req.body?.description;

const category_id =
  req.body?.category_id;

const unit =
  req.body?.unit;

const price = req.body?.price;

const stock_quantity =
  req.body?.stock_quantity;

  db.query(
    "SELECT * FROM products WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message:
            "Product Not Found",
        });
      }

      const oldProduct =
        results[0];

      const image_url = req.file
  ? req.file.path
  : oldProduct.image_url;

      const sql = `
UPDATE products
SET
  category_id=?,
  name=?,
  description=?,
  price=?,
  stock_quantity=?,
  unit=?,
  image_url=?
WHERE id=?
`;

      db.query(
  sql,
  [
    category_id ||
      oldProduct.category_id,

    name ||
      oldProduct.name,

    description ||
      oldProduct.description,

    price ||
      oldProduct.price,

    stock_quantity ||
      oldProduct.stock_quantity,

    unit ||
      oldProduct.unit,

    image_url,

    id,
  ],
  (err) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json({
      message:
        "Product Updated Successfully",
    });
  }
);
    }
  );
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM products
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    res.json({
      message: "Product Deleted Successfully"
    });
  });
};
exports.toggleProductStatus = (
  req,
  res
) => {
  const { id } = req.params;

  const sql = `
    UPDATE products
    SET is_active =
      NOT is_active
    WHERE id = ?
  `;

  db.query(
    sql,
    [id],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message:
          "Product Status Updated",
      });
    }
  );
};

exports.getCustomerProducts = (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    WHERE p.is_active = TRUE
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(results);
  });
};