import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
  }],
  type: {
    type: String,
    enum: ['coding', 'docs', 'other'],
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  access: {
    type: {
      type: String,
      enum: ['private', 'team', 'organization'],
      default: 'private',
    },
    allowedUsers: [{
      type: String,
    }],
    allowedTeams: [{
      type: String,
    }],
    organizationId: {
      type: String,
      default: null,
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', knowledgeBaseSchema); 