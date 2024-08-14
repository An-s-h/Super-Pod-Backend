const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Category = require('../models/category');
const Podcast = require('../models/podcast');
const User = require('../models/user');
require('dotenv').config();

// Route to add a new podcast
router.post('/add-podcast', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, frontImage, audioFile } = req.body;

    // Ensure all required fields are present
    if (!title || !description || !category || !frontImage || !audioFile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { user } = req;
    const cat = await Category.findOne({ categoryName: category });
    if (!cat) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const newPod = new Podcast({
      title,
      description,
      category: cat._id,
      frontImage,  // Using the URL received from frontend
      audioFile,   // Using the URL received from frontend
      user: user._id,
    });

    await newPod.save();

    await Category.findByIdAndUpdate(cat._id, {
      $push: { podcasts: newPod._id },
    });
    await User.findByIdAndUpdate(user._id, { $push: { podcasts: newPod._id } });

    res.status(201).json({ message: 'Podcast added successfully' });
  } catch (error) {
    console.error('Error adding podcast:', error);
    res.status(500).json({
      message: 'Failed to add podcast',
      error: error.message,
    });
  }
});

router.get('/get-podcast', async (req, res) => {
  try {
    const { page = 1, limit = 4 } = req.query;
    const podcasts = await Podcast.find()
      .populate('category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const totalPodcasts = await Podcast.countDocuments(); // Get the total number of podcasts

    return res.status(200).json({ data: podcasts, total: totalPodcasts });
  } catch (error) {
    console.error('Error fetching podcasts:', error.message);
    return res.status(500).json({ msg: 'Failed to get podcasts', error: error.message });
  }
});


router.get('/get-user-podcasts', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const userId = user._id;
    const { page = 1, limit = 10 } = req.query; // Get pagination parameters

    const data = await User.findById(userId)
      .populate({
        path: 'podcasts',
        populate: { path: 'category' },
      })
      .select('-password');
    
    if (data && data.podcasts) {
      data.podcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Paginate the podcasts
      const total = data.podcasts.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedPodcasts = data.podcasts.slice(startIndex, endIndex);

      return res.status(200).json({ data: paginatedPodcasts, total });
    }

    return res.status(200).json({ data: [], total: 0 });
  } catch (error) {
    console.error('Failed to get user podcasts:', error.message);
    return res.status(500).json({ msg: 'Failed to get user podcasts', error: error.message });
  }
});


// Get podcast by ID
router.get('/get-podcast/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await Podcast.findById(id).populate('category');
    if (!podcast) {
      return res.status(404).json({ msg: 'Podcast not found' });
    }
    return res.status(200).json({ data: podcast });
  } catch (error) {
    console.error('Error fetching podcast by ID:', error.message);
    return res.status(500).json({ msg: 'Failed to get podcast', error: error.message });
  }
});

// Get podcasts by category
router.get('/category/:cat', async (req, res) => {
  try {
    const { cat } = req.params;
    const categories = await Category.find({ categoryName: cat }).populate({
      path: 'podcasts',
      populate: { path: 'category' },
    });
    let podcasts = [];
    categories.forEach((category) => {
      podcasts = [...podcasts, ...category.podcasts];
    });
    return res.status(200).json({ data: podcasts });
  } catch (error) {
    console.error('Error fetching podcasts by category:', error.message);
    return res.status(500).json({ msg: 'Failed to get podcasts by category', error: error.message });
  }
});

module.exports = router;
