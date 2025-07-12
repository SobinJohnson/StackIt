const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    minlength: 10
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
answerSchema.index({ questionId: 1, createdAt: -1 });
answerSchema.index({ authorId: 1 });
answerSchema.index({ isAccepted: 1 });

// Method to upvote
answerSchema.methods.upvote = function() {
  this.upvotes += 1;
  return this.save();
};

// Method to downvote
answerSchema.methods.downvote = function() {
  this.downvotes += 1;
  return this.save();
};

// Method to accept answer
answerSchema.methods.accept = function() {
  this.isAccepted = true;
  return this.save();
};

// Method to unaccept answer
answerSchema.methods.unaccept = function() {
  this.isAccepted = false;
  return this.save();
};

// Method to get vote score
answerSchema.methods.getVoteScore = function() {
  return this.upvotes - this.downvotes;
};

// Method to get public JSON
answerSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    questionId: this.questionId,
    authorId: this.authorId,
    content: this.content,
    upvotes: this.upvotes,
    downvotes: this.downvotes,
    isAccepted: this.isAccepted,
    voteScore: this.getVoteScore(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Answer', answerSchema); 