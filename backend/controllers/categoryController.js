const db = require("../config/db");

exports.getCategories = (req, res) => {
  db.query("SELECT * FROM categories ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

exports.addCategory = (req, res) => {
  const { name } = req.body;
  const image = req.file ? req.file.path : null;

  if (!name) return res.status(400).json({ message: "Category Name Required" });

  db.query(
    "INSERT INTO categories (name, image) VALUES (?, ?)",
    [name, image],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Category Added Successfully" });
    }
  );
};

// UPDATE CATEGORY
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const newImage = req.file ? req.file.path : null;

  if (newImage) {
    db.query(
      "UPDATE categories SET name = ?, image = ? WHERE id = ?",
      [name, newImage, id],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: "Category Updated Successfully" });
      }
    );
  } else {
    db.query(
      "UPDATE categories SET name = ? WHERE id = ?",
      [name, id],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: "Category Updated Successfully" });
      }
    );
  }
};

// DELETE CATEGORY
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Category Deleted Successfully" });
  });
};