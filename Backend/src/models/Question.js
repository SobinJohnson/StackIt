const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerCount: {
    type: Number,
    default: 0
  },
  acceptedAnswerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  viewCount: {
    type: Number,
    default: 0
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  searchText: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ tags: 1 });
questionSchema.index({ authorId: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ searchText: 'text' });

// Pre-save middleware to create search text
questionSchema.pre('save', function(next) {
  this.searchText = `${this.title} ${this.description} ${this.tags.join(' ')}`;
  next();
});

// Method to increment view count
questionSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment answer count
questionSchema.methods.incrementAnswerCount = function() {
  this.answerCount += 1;
  return this.save();
};

// Method to decrement answer count
questionSchema.methods.decrementAnswerCount = function() {
  this.answerCount = Math.max(0, this.answerCount - 1);
  return this.save();
};

// Method to set accepted answer
questionSchema.methods.setAcceptedAnswer = function(answerId) {
  this.acceptedAnswerId = answerId;
  return this.save();
};

// Method to upvote question
questionSchema.methods.upvote = function() {
  this.upvotes += 1;
  return this.save();
};

// Method to downvote question
questionSchema.methods.downvote = function() {
  this.downvotes += 1;
  return this.save();
};

// Method to handle vote with proper logic
questionSchema.methods.handleVote = async function(userId, voteType) {
  const Vote = require('./Vote');
  
  // Check if user already voted
  const existingVote = await Vote.findOne({
    userId,
    questionId: this._id,
    answerId: null
  });

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      // User is voting the same way again - remove the vote
      await Vote.findByIdAndDelete(existingVote._id);
      if (voteType === 'up') {
        this.upvotes = Math.max(0, this.upvotes - 1);
      } else {
        this.downvotes = Math.max(0, this.downvotes - 1);
      }
    } else {
      // User is changing their vote
      existingVote.voteType = voteType;
      await existingVote.save();
      
      if (voteType === 'up') {
        this.upvotes += 1;
        this.downvotes = Math.max(0, this.downvotes - 1);
      } else {
        this.downvotes += 1;
        this.upvotes = Math.max(0, this.upvotes - 1);
      }
    }
  } else {
    // New vote
    const newVote = new Vote({
      userId,
      questionId: this._id,
      voteType
    });
    await newVote.save();
    
    if (voteType === 'up') {
      this.upvotes += 1;
    } else {
      this.downvotes += 1;
    }
  }
  
  return this.save();
};

// Method to get public JSON
questionSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    tags: this.tags,
    authorId: this.authorId,
    answerCount: this.answerCount,
    acceptedAnswerId: this.acceptedAnswerId,
    viewCount: this.viewCount,
    upvotes: this.upvotes,
    downvotes: this.downvotes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Question', questionSchema); 