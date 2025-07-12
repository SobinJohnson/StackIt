import { api, API_ENDPOINTS, handleApiError, PaginatedResponse } from '@/lib/api';

// Question interface
export interface Question {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  answerCount: number;
  acceptedAnswerId?: string;
  viewCount: number;
  upvotes?: number;
  downvotes?: number;
  createdAt: string;
  updatedAt: string;
}

// Create question interface
export interface CreateQuestionData {
  title: string;
  description: string;
  tags: string[];
}

// Update question interface
export interface UpdateQuestionData {
  title?: string;
  description?: string;
  tags?: string[];
}

// Questions filter interface
export interface QuestionsFilter {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  sort?: 'newest' | 'oldest' | 'most_answers' | 'most_views';
}

// Questions service
export const questionsService = {
  // Get all questions with filters
  async getQuestions(filter: QuestionsFilter = {}): Promise<PaginatedResponse<Question>> {
    try {
      const params = new URLSearchParams();
      
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.search) params.append('search', filter.search);
      if (filter.tags) params.append('tags', filter.tags);
      if (filter.sort) params.append('sort', filter.sort);

      const response = await api.get(`${API_ENDPOINTS.QUESTIONS}?${params.toString()}`);
      
      // Transform the backend response to match the expected PaginatedResponse structure
      return {
        success: response.data.success,
        data: response.data.questions,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single question by ID
  async getQuestion(id: string): Promise<Question> {
    try {
      const response = await api.get(API_ENDPOINTS.QUESTION(id));
      return response.data.question;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new question
  async createQuestion(data: CreateQuestionData): Promise<Question> {
    try {
      const response = await api.post(API_ENDPOINTS.QUESTIONS, data);
      return response.data.question;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update question
  async updateQuestion(id: string, data: UpdateQuestionData): Promise<Question> {
    try {
      const response = await api.put(API_ENDPOINTS.QUESTION(id), data);
      return response.data.question;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete question
  async deleteQuestion(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.QUESTION(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Vote on question
  async voteQuestion(id: string, type: 'up' | 'down'): Promise<Question> {
    try {
      const response = await api.post(`${API_ENDPOINTS.QUESTION(id)}/vote`, { type });
      return response.data.question;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get current user's questions
  async getUserQuestions(filter: QuestionsFilter = {}): Promise<PaginatedResponse<Question>> {
    try {
      const params = new URLSearchParams();
      
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.search) params.append('search', filter.search);
      if (filter.sort) params.append('sort', filter.sort);

      const response = await api.get(`${API_ENDPOINTS.USER_QUESTIONS}?${params.toString()}`);
      
      return {
        success: response.data.success,
        data: response.data.questions,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get questions by specific user
  async getQuestionsByUser(userId: string, filter: QuestionsFilter = {}): Promise<PaginatedResponse<Question> & { user: any }> {
    try {
      const params = new URLSearchParams();
      
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.search) params.append('search', filter.search);
      if (filter.sort) params.append('sort', filter.sort);

      const response = await api.get(`${API_ENDPOINTS.USER_QUESTIONS_BY_ID(userId)}?${params.toString()}`);
      
      return {
        success: response.data.success,
        data: response.data.questions,
        user: response.data.user,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
}; 