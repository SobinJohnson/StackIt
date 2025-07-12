const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/questions - Get all questions with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      tags = '',
      sort = 'newest'
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      // Use regex for partial matching on title, description, and tags
      const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Tag filtering
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'most_answers':
        sortOption = { answerCount: -1 };
        break;
      case 'most_views':
        sortOption = { viewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const questions = await Question.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('authorId', 'username avatarUrl');

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      questions: questions.map(q => q.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions'
    });
  }
});

// GET /api/questions/:id - Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('authorId', 'username avatarUrl bio');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment view count
    await question.incrementViews();

    res.json({
      success: true,
      question: question.toPublicJSON()
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question'
    });
  }
});

// POST /api/questions - Create new question
router.post('/', auth, [
  body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('tags')
    .isArray({ min: 1, max: 10 })
    .withMessage('Must provide 1-10 tags')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, tags } = req.body;

    // Clean and validate tags
    const cleanTags = tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length <= 20);

    if (cleanTags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid tag is required'
      });
    }

    const question = new Question({
      title,
      description,
      tags: cleanTags,
      authorId: req.user._id
    });

    await question.save();

    // Populate author info
    await question.populate('authorId', 'username avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: question.toPublicJSON()
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating question'
    });
  }
});

// PUT /api/questions/:id - Update question
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('tags')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Must provide 1-10 tags')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the author
    if (question.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own questions'
      });
    }

    const { title, description, tags } = req.body;

    // Update fields
    if (title) question.title = title;
    if (description) question.description = description;
    if (tags) {
      const cleanTags = tags
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= 20);
      
      if (cleanTags.length > 0) {
        question.tags = cleanTags;
      }
    }

    await question.save();
    await question.populate('authorId', 'username avatarUrl');

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: question.toPublicJSON()
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question'
    });
  }
});

// DELETE /api/questions/:id - Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the author or admin
    if (question.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own questions'
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting question'
    });
  }
});

// POST /api/questions/:id/vote - Vote on question
router.post('/:id/vote', auth, [
  body('type')
    .isIn(['up', 'down'])
    .withMessage('Vote type must be either "up" or "down"')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const { type } = req.body;

    // Apply vote with proper logic
    await question.handleVote(req.user._id, type);

    // Create notification for question author (if not voting on own question)
    if (question.authorId.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipientId: question.authorId,
        type: 'vote',
        questionId: question._id,
        content: `${req.user.username} ${type === 'up' ? 'upvoted' : 'downvoted'} your question`,
        senderId: req.user._id
      });
      await notification.save();

      // Send real-time notification
      if (global.io) {
        global.io.to(`user_${question.authorId}`).emit('new_notification', {
          type: 'vote',
          message: `${req.user.username} ${type === 'up' ? 'upvoted' : 'downvoted'} your question`,
          questionId: question._id
        });
      }
    }

    // Populate author info
    await question.populate('authorId', 'username avatarUrl');

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      question: question.toPublicJSON()
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording vote'
    });
  }
});

// GET /api/questions/user/me - Get current user's questions
router.get('/user/me', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = 'newest'
    } = req.query;

    const query = { authorId: req.user._id };

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'most_answers':
        sortOption = { answerCount: -1 };
        break;
      case 'most_views':
        sortOption = { viewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const questions = await Question.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('authorId', 'username avatarUrl');

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      questions: questions.map(q => q.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user questions'
    });
  }
});

// GET /api/questions/user/:userId - Get questions by specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = 'newest'
    } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = { authorId: userId };

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'most_answers':
        sortOption = { answerCount: -1 };
        break;
      case 'most_views':
        sortOption = { viewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const questions = await Question.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('authorId', 'username avatarUrl');

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      questions: questions.map(q => q.toPublicJSON()),
      user: user.toPublicJSON(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user questions'
    });
  }
});

module.exports = router; 