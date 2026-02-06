const express = require("express");
const router = express.Router();

router.get("/history", (req, res) => {
  res.json({ message: "Bid history" });
});

module.exports = router;