const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  voteType: {
    type: String,
    enum: ['up', 'down'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per question/answer
voteSchema.index({ userId: 1, questionId: 1, answerId: 1 }, { unique: true });

// Method to get public JSON
voteSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    userId: this.userId,
    questionId: this.questionId,
    answerId: this.answerId,
    voteType: this.voteType,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Vote', voteSchema); 