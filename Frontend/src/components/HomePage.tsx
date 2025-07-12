
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, ArrowDown, Clock, Eye, User, Tag, Filter, Menu } from 'lucide-react';

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
  },
  {
    id: '4',
    title: 'How to implement authentication in React with JWT?',
    description: 'I need to implement user authentication in my React app using JWT tokens. What are the best practices?',
    tags: ['react', 'authentication', 'jwt'],
    author: 'auth_dev',
    votes: 15,
    answers: 5,
    views: 320,
    createdAt: '3 days ago',
    isAnswered: true
  },
  {
    id: '5',
    title: 'TypeScript interface vs type - when to use which?',
    description: 'I\'m confused about when to use interfaces vs types in TypeScript. Can someone explain the differences?',
    tags: ['typescript', 'interfaces', 'types'],
    author: 'ts_expert',
    votes: 22,
    answers: 8,
    views: 450,
    createdAt: '5 days ago',
    isAnswered: true
  },
  {
    id: '6',
    title: 'Database optimization techniques for large datasets',
    description: 'My application is getting slow with large datasets. What are some effective database optimization strategies?',
    tags: ['database', 'optimization', 'performance'],
    author: 'db_admin',
    votes: 18,
    answers: 4,
    views: 280,
    createdAt: '1 week ago',
    isAnswered: false
  },
  {
    id: '7',
    title: 'Docker containerization best practices',
    description: 'What are the essential best practices for containerizing applications with Docker?',
    tags: ['docker', 'containerization', 'devops'],
    author: 'devops_engineer',
    votes: 25,
    answers: 6,
    views: 380,
    createdAt: '1 week ago',
    isAnswered: true
  },
  {
    id: '8',
    title: 'CSS Grid vs Flexbox - which to use when?',
    description: 'I\'m learning CSS layout techniques. When should I use Grid vs Flexbox for different scenarios?',
    tags: ['css', 'grid', 'flexbox'],
    author: 'frontend_dev',
    votes: 12,
    answers: 3,
    views: 190,
    createdAt: '2 weeks ago',
    isAnswered: false
  },
  {
    id: '9',
    title: 'Git workflow strategies for team development',
    description: 'What are the most effective Git workflows for team development? GitFlow vs GitHub Flow?',
    tags: ['git', 'workflow', 'version-control'],
    author: 'git_master',
    votes: 30,
    answers: 7,
    views: 520,
    createdAt: '2 weeks ago',
    isAnswered: true
  },
  {
    id: '10',
    title: 'Microservices architecture patterns',
    description: 'I\'m designing a microservices architecture. What are the key patterns and anti-patterns to consider?',
    tags: ['microservices', 'architecture', 'patterns'],
    author: 'architect',
    votes: 35,
    answers: 9,
    views: 650,
    createdAt: '3 weeks ago',
    isAnswered: true
  },
  {
    id: '11',
    title: 'React performance optimization techniques',
    description: 'My React app is getting slow. What are the most effective performance optimization techniques?',
    tags: ['react', 'performance', 'optimization'],
    author: 'perf_dev',
    votes: 28,
    answers: 6,
    views: 420,
    createdAt: '3 weeks ago',
    isAnswered: true
  },
  {
    id: '12',
    title: 'API rate limiting implementation',
    description: 'How do I implement effective rate limiting for my REST API? What are the best practices?',
    tags: ['api', 'rate-limiting', 'security'],
    author: 'api_dev',
    votes: 20,
    answers: 4,
    views: 310,
    createdAt: '4 weeks ago',
    isAnswered: false
  }
];

const HomePage = () => {
  const [filter, setFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [search, setSearch] = useState('');
  // Track votes per question: { [id]: 'up' | 'down' | null }
  const [votes, setVotes] = useState(() => {
    const obj = {};
    mockQuestions.forEach(q => { obj[q.id] = null; });
    return obj;
  });
  const questionsPerPage = 5; // Reduced for better testing

  const filters = [
    { key: 'newest', label: 'Newest' },
    { key: 'active', label: 'Active' },
    { key: 'unanswered', label: 'Unanswered' },
    { key: 'votes', label: 'Votes' }
  ];

  // Search filter
  const filteredQuestions = mockQuestions.filter(q => {
    const s = search.toLowerCase();
    return (
      q.title.toLowerCase().includes(s) ||
      q.description.toLowerCase().includes(s) ||
      q.tags.some(tag => tag.toLowerCase().includes(s))
    );
  });

  // Calculate pagination values
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / questionsPerPage));
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Handle page navigation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, currentPage - 3);
      const end = Math.min(totalPages, currentPage + 3);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Voting logic
  const handleVote = (id: string, type: 'up' | 'down') => {
    setVotes(prev => {
      if (prev[id] === type) return prev; // already voted
      const newVotes = { ...prev };
      newVotes[id] = type;
      return newVotes;
    });
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Search Bar */}
      <div className="w-full max-w-2xl mx-auto pt-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Search questions..."
          className="w-full px-4 py-2 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent text-base"
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">All Questions</h1>
        <Link 
          to="/ask" 
          className="w-full sm:w-auto px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors font-medium text-center"
        >
          Ask Question
        </Link>
      </div>

      {/* Filters for mobile */}
      <div className="sm:hidden flex justify-end">
        <button
          className="flex items-center gap-2 px-4 py-2 border border-[#888888] rounded-lg text-[#888888] hover:border-[#865A7B] hover:text-[#865A7B] transition-colors"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-label="Open filters menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      {showMobileFilters && (
        <div className="sm:hidden bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4 z-20">
          <div className="flex flex-col gap-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => { setFilter(filterOption.key); setShowMobileFilters(false); }}
                className={`w-full px-4 py-2 rounded-lg border transition-colors text-left ${
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
      )}

      {/* Stats and Filters for desktop */}
      <div className="hidden sm:flex flex-row justify-between items-center">
        <div className="text-[#888888]">
          {totalQuestions} questions
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
        {currentQuestions.map((question) => {
          // Calculate display votes
          let displayVotes = question.votes;
          if (votes[question.id] === 'up') displayVotes += 1;
          if (votes[question.id] === 'down') displayVotes -= 1;
          return (
            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:space-x-4 gap-4 sm:gap-0">
                {/* Stats Column */}
                <div className="flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2 text-center min-w-[80px]">
                  <button
                    onClick={() => handleVote(question.id, 'up')}
                    disabled={votes[question.id] === 'up'}
                    className={`p-1 rounded-full transition-colors ${votes[question.id] === 'up' ? 'bg-[#865A7B] text-white' : 'hover:bg-[#865A7B] hover:text-white text-[#888888]'}`}
                    aria-label="Upvote"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="font-medium">{displayVotes}</span>
                  <button
                    onClick={() => handleVote(question.id, 'down')}
                    disabled={votes[question.id] === 'down'}
                    className={`p-1 rounded-full transition-colors ${votes[question.id] === 'down' ? 'bg-[#865A7B] text-white' : 'hover:bg-[#865A7B] hover:text-white text-[#888888]'}`}
                    aria-label="Downvote"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                {/* Content Column */}
                <div className="flex-1 space-y-3">
                  <Link 
                    to={`/question/${question.id}`}
                    className="block text-lg sm:text-xl font-semibold text-[#865A7B] hover:text-[#764a6b] transition-colors"
                  >
                    {question.title}
                  </Link>
                  <p className="text-gray-600 line-clamp-2 text-sm sm:text-base">
                    {question.description}
                  </p>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-[#865A7B] border border-gray-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Meta info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-[#888888] gap-1 sm:gap-0">
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
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center space-x-2 pt-8">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-3 py-2 border rounded-lg transition-colors mb-2 sm:mb-0 ${
              currentPage === 1
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-[#888888] hover:border-[#865A7B] hover:text-[#865A7B]'
            }`}
          >
            &lt;
          </button>
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg transition-colors mb-2 sm:mb-0 ${
                currentPage === page
                  ? 'bg-[#865A7B] text-white'
                  : 'border border-[#888888] hover:border-[#865A7B] hover:text-[#865A7B]'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 border rounded-lg transition-colors mb-2 sm:mb-0 ${
              currentPage === totalPages
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-[#888888] hover:border-[#865A7B] hover:text-[#865A7B]'
            }`}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
