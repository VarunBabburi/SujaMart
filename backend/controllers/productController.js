const db = require("../config/db");

exports.addProduct = (req, res) => {
  const {
    category_id,
    name,
    description,
    price,
    stock_quantity,
    unit,
    image_url
  } = req.body;

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
        message: err.message
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

  const {
    category_id,
    name,
    description,
    price,
    stock_quantity,
    unit,
    image_url
  } = req.body;

  const sql = `
    UPDATE products
    SET category_id=?,
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
      category_id,
      name,
      description,
      price,
      stock_quantity,
      unit,
      image_url,
      id
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: err.message
        });
      }

      res.json({
        message: "Product Updated Successfully"
      });
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