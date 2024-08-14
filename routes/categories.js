const router = require("express").Router();
const Cat = require("../models/category");

// Add-category route with duplicate check
router.post("/add-category", async (req, res) => {
  const { categoryName } = req.body;

  try {
    // Check if the category already exists
    const existingCategory = await Cat.findOne({ categoryName });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // If not, proceed to save the new category
    const cat = new Cat({ categoryName });
    await cat.save();
    return res.status(200).json({ message: "Category added" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
