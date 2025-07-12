const express = require('express');
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/questions/:id/answers - Get answers for a question
router.get('/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { sort = 'votes' } = req.query;

    // Verify question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Sorting options
    let sortOption = {};
    switch (sort) {
      case 'votes':
        sortOption = { upvotes: -1, downvotes: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { upvotes: -1, downvotes: 1 };
    }

    const answers = await Answer.find({ questionId })
      .sort(sortOption)
      .populate('authorId', 'username avatarUrl');

    res.json({
      success: true,
      answers: answers.map(a => a.toPublicJSON())
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching answers'
    });
  }
});

// POST /api/questions/:id/answers - Create answer
router.post('/questions/:questionId', auth, [
  body('content')
    .isLength({ min: 10 })
    .withMessage('Answer must be at least 10 characters')
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

    const { questionId } = req.params;
    const { content } = req.body;

    // Verify question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Create answer
    const answer = new Answer({
      questionId,
      authorId: req.user._id,
      content
    });

    await answer.save();

    // Increment answer count on question
    await question.incrementAnswerCount();

    // Populate author info
    await answer.populate('authorId', 'username avatarUrl');

    // Create notification for question author
    if (question.authorId.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipientId: question.authorId,
        type: 'answer',
        questionId,
        answerId: answer._id,
        content: `${req.user.username} answered your question`,
        senderId: req.user._id
      });
      await notification.save();

      // Send real-time notification
      if (global.io) {
        global.io.to(`user_${question.authorId}`).emit('new_notification', {
          type: 'answer',
          message: `${req.user.username} answered your question`,
          questionId,
          answerId: answer._id
        });
      }
    }

    // Send real-time update to question room
    if (global.io) {
      global.io.to(`question_${questionId}`).emit('new_answer', {
        answer: answer.toPublicJSON()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully',
      answer: answer.toPublicJSON()
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating answer'
    });
  }
});

// PUT /api/answers/:id - Update answer
router.put('/:id', auth, [
  body('content')
    .isLength({ min: 10 })
    .withMessage('Answer must be at least 10 characters')
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

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user is the author
    if (answer.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own answers'
      });
    }

    answer.content = req.body.content;
    await answer.save();
    await answer.populate('authorId', 'username avatarUrl');

    res.json({
      success: true,
      message: 'Answer updated successfully',
      answer: answer.toPublicJSON()
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating answer'
    });
  }
});

// DELETE /api/answers/:id - Delete answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user is the author or admin
    if (answer.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own answers'
      });
    }

    // Decrement answer count on question
    const question = await Question.findById(answer.questionId);
    if (question) {
      await question.decrementAnswerCount();
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting answer'
    });
  }
});

// POST /api/answers/:id/vote - Vote on answer
router.post('/:id/vote', auth, [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be upvote or downvote')
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

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    const { voteType } = req.body;

    // Apply vote with proper logic
    const type = voteType === 'upvote' ? 'up' : 'down';
    await answer.handleVote(req.user._id, type);

    // Create notification for answer author (if not voting on own answer)
    if (answer.authorId.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipientId: answer.authorId,
        type: 'vote',
        questionId: answer.questionId,
        answerId: answer._id,
        content: `${req.user.username} ${type === 'up' ? 'upvoted' : 'downvoted'} your answer`,
        senderId: req.user._id
      });
      await notification.save();

      // Send real-time notification
      if (global.io) {
        global.io.to(`user_${answer.authorId}`).emit('new_notification', {
          type: 'vote',
          message: `${req.user.username} ${type === 'up' ? 'upvoted' : 'downvoted'} your answer`,
          questionId: answer.questionId,
          answerId: answer._id
        });
      }
    }

    // Send real-time vote update
    if (global.io) {
      global.io.to(`question_${answer.questionId}`).emit('vote_updated', {
        answerId: answer._id,
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        voteScore: answer.getVoteScore()
      });
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      answer: answer.toPublicJSON()
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording vote'
    });
  }
});

// POST /api/answers/:id/accept - Accept answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    const question = await Question.findById(answer.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the question author
    if (question.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept answers'
      });
    }

    // Unaccept previously accepted answer if any
    if (question.acceptedAnswerId) {
      const previousAccepted = await Answer.findById(question.acceptedAnswerId);
      if (previousAccepted) {
        await previousAccepted.unaccept();
      }
    }

    // Accept new answer
    await answer.accept();
    await question.setAcceptedAnswer(answer._id);

    // Create notification for answer author
    const notification = new Notification({
      recipientId: answer.authorId,
      type: 'accept',
      questionId: question._id,
      answerId: answer._id,
      content: `${req.user.username} accepted your answer`,
      senderId: req.user._id
    });
    await notification.save();

    // Send real-time notifications
    if (global.io) {
      // Notify answer author
      global.io.to(`user_${answer.authorId}`).emit('new_notification', {
        type: 'accept',
        message: `${req.user.username} accepted your answer`,
        questionId: question._id,
        answerId: answer._id
      });

      // Notify question room
      global.io.to(`question_${question._id}`).emit('answer_accepted', {
        answerId: answer._id,
        questionId: question._id
      });
    }

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      answer: answer.toPublicJSON()
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting answer'
    });
  }
});

module.exports = router; 