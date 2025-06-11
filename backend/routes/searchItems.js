const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/search", (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) return res.json([]);

  const filePath = path.join(__dirname, "../data/inventory.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Failed to read inventory file");

    try {
      const inventory = JSON.parse(data);
      const results = inventory.filter(item =>
        item.name.toLowerCase().includes(query)
      );
      res.json(results.slice(0, 5)); // limit 5
    } catch (e) {
      res.status(500).send("Invalid JSON format");
    }
  });
});

module.exports = router;
