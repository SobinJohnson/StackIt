
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, ArrowDown, Clock, Eye, User, Tag } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  votes: number;
  answers: number;
  views: number;
  createdAt: string;
  isAnswered: boolean;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to join 2 columns in a data set to make a separate column in SQL?',
    description: 'I am using SQL Server and I have two columns UserName and UserId. I want to create a third column containing both values....',
    tags: ['SQL', 'database', 'joins'],
    author: 'john_doe',
    votes: 5,
    answers: 3,
    views: 245,
    createdAt: '2 hours ago',
    isAnswered: true
  },
  {
    id: '2',
    title: 'React component not re-rendering after state change',
    description: 'I have a React component that updates state but the UI is not reflecting the changes. What could be wrong?',
    tags: ['react', 'javascript', 'hooks'],
    author: 'sarah_dev',
    votes: 12,
    answers: 0,
    views: 89,
    createdAt: '4 hours ago',
    isAnswered: false
  },
  {
    id: '3',
    title: 'Best practices for API error handling in Node.js',
    description: 'What are the recommended approaches for handling errors in Node.js REST APIs?',
    tags: ['nodejs', 'api', 'error-handling'],
    author: 'mike_backend',
    votes: 8,
    answers: 2,
    views: 156,
    createdAt: '1 day ago',
    isAnswered: false
  }
];

const HomePage = () => {
  const [filter, setFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const filters = [
    { key: 'newest', label: 'Newest' },
    { key: 'active', label: 'Active' },
    { key: 'unanswered', label: 'Unanswered' },
    { key: 'votes', label: 'Votes' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
        <Link 
          to="/ask" 
          className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors font-medium"
        >
          Ask Question
        </Link>
      </div>

      {/* Stats and Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="text-[#888888]">
          {mockQuestions.length} questions
        </div>
        
        <div className="flex space-x-2">
          {filters.map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filter === filterOption.key
                  ? 'bg-[#865A7B] text-white border-[#865A7B]'
                  : 'bg-white text-[#888888] border-[#888888] hover:border-[#865A7B] hover:text-[#865A7B]'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {mockQuestions.map((question) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex space-x-4">
              {/* Stats Column */}
              <div className="flex flex-col items-center space-y-2 text-center min-w-[80px]">
                <div className="flex items-center space-x-1 text-[#888888]">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-medium">{question.votes}</span>
                </div>
                <div className={`flex items-center space-x-1 ${question.isAnswered ? 'text-green-600' : 'text-[#888888]'}`}>
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">{question.answers}</span>
                </div>
                <div className="flex items-center space-x-1 text-[#888888]">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{question.views}</span>
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 space-y-3">
                <Link 
                  to={`/question/${question.id}`}
                  className="block text-xl font-semibold text-[#865A7B] hover:text-[#764a6b] transition-colors"
                >
                  {question.title}
                </Link>
                
                <p className="text-gray-600 line-clamp-2">
                  {question.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-[#865A7B] border border-gray-200"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-sm text-[#888888]">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{question.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{question.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 pt-8">
        <button className="px-3 py-2 border border-[#888888] rounded-lg hover:border-[#865A7B] hover:text-[#865A7B] transition-colors">
          &lt;
        </button>
        {[1, 2, 3, 4, 5, 6, 7].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentPage === page
                ? 'bg-[#865A7B] text-white'
                : 'border border-[#888888] hover:border-[#865A7B] hover:text-[#865A7B]'
            }`}
          >
            {page}
          </button>
        ))}
        <button className="px-3 py-2 border border-[#888888] rounded-lg hover:border-[#865A7B] hover:text-[#865A7B] transition-colors">
          &gt;
        </button>
      </div>
    </div>
  );
};

export default HomePage;
