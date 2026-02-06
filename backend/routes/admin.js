const express = require("express");
const router = express.Router();

router.get("/items", (req, res) => {
  res.json({ message: "Admin items endpoint" });
});

module.exports = router;