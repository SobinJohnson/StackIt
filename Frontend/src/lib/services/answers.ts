import { api, API_ENDPOINTS, handleApiError } from '@/lib/api';

// Answer interface
export interface Answer {
  _id: string;
  questionId: string;
  authorId: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  voteScore: number;
  createdAt: string;
  updatedAt: string;
}

// Create answer interface
export interface CreateAnswerData {
  content: string;
}

// Update answer interface
export interface UpdateAnswerData {
  content: string;
}

// Vote type
export type VoteType = 'upvote' | 'downvote';

// Answers filter interface
export interface AnswersFilter {
  sort?: 'votes' | 'newest' | 'oldest';
}

// Answers service
export const answersService = {
  // Get answers for a question
  async getAnswers(questionId: string, filter: AnswersFilter = {}): Promise<{ answers: Answer[] }> {
    try {
      const params = new URLSearchParams();
      if (filter.sort) params.append('sort', filter.sort);

      const response = await api.get(`/answers/questions/${questionId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new answer
  async createAnswer(questionId: string, content: string): Promise<Answer> {
    try {
      const response = await api.post(`/answers/questions/${questionId}`, { content });
      return response.data.answer;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update answer
  async updateAnswer(id: string, data: UpdateAnswerData): Promise<Answer> {
    try {
      const response = await api.put(`/answers/${id}`, data);
      return response.data.answer;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete answer
  async deleteAnswer(id: string): Promise<void> {
    try {
      await api.delete(`/answers/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Vote on answer
  async voteAnswer(id: string, type: 'up' | 'down'): Promise<Answer> {
    try {
      const voteType = type === 'up' ? 'upvote' : 'downvote';
      const response = await api.post(`/answers/${id}/vote`, { voteType });
      return response.data.answer;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Accept answer
  async acceptAnswer(id: string): Promise<Answer> {
    try {
      const response = await api.post(`/answers/${id}/accept`);
      return response.data.answer;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
}; 