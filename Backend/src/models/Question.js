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
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Question', questionSchema); 