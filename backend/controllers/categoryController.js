const db = require("../config/db");

exports.getCategories = (req, res) => {
  db.query(
    "SELECT * FROM categories",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json(results);
    }
  );
};

exports.addCategory = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Category Name Required",
    });
  }

  db.query(
    "INSERT INTO categories(name) VALUES(?)",
    [name],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message: "Category Added Successfully",
      });
    }
  );
};