
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, ArrowDown, Clock, Eye, User, Tag, Filter, Menu, Search, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { questionsService, Question, QuestionsFilter } from '@/lib/services/questions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const VOTE_STORAGE_KEY = 'questionVotes';

type VoteType = 'up' | 'down';

type UserVotes = {
  [questionId: string]: VoteType;
};

const HomePage = () => {
  const [filter, setFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // User votes state, initialized from localStorage
  const [userVotes, setUserVotes] = useState<UserVotes>(() => {
    try {
      const stored = localStorage.getItem(VOTE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const filters = [
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'most_answers', label: 'Most Answers' },
    { key: 'most_views', label: 'Most Views' }
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // API query for questions
  const { data: questionsData, isLoading, error } = useQuery({
    queryKey: ['questions', { filter, currentPage, debouncedSearch }],
    queryFn: () => questionsService.getQuestions({
      page: currentPage,
      limit: 10,
      search: debouncedSearch || undefined,
      sort: filter as QuestionsFilter['sort']
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const questions = questionsData?.data || [];
  const pagination = questionsData?.pagination;

  // Handle error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const currentQuestions = questions;
  const totalPages = pagination?.totalPages || 1;

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
  const handleVote = async (id: string, type: VoteType) => {
    try {
      await questionsService.voteQuestion(id, type);
      
      // Update localStorage and state
      let updatedVotes = { ...userVotes };
      
      if (userVotes[id] === type) {
        // User clicked the same vote button - remove the vote
        delete updatedVotes[id];
      } else {
        // User changed their vote or voted for the first time
        updatedVotes[id] = type;
      }
      
      setUserVotes(updatedVotes);
      localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(updatedVotes));
      
      // Refetch questions to get updated vote counts
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Search Bar */}
      <div className="w-full max-w-2xl mx-auto pt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by title, description, or tags..."
            className="w-full pl-10 pr-10 py-3 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent text-base"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {debouncedSearch && (
          <div className="mt-2 text-sm text-[#888888]">
            Showing results for "{debouncedSearch}"
            <button
              onClick={() => setSearch('')}
              className="ml-2 text-[#865A7B] hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">All Questions</h1>
          {user && (
            <p className="text-[#888888] text-sm mt-1">
              Welcome back, {user.username}! 👋
            </p>
          )}
        </div>
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
          {pagination?.total || 0} questions
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
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#865A7B] mx-auto"></div>
            <p className="mt-2 text-[#888888]">Loading questions...</p>
          </div>
        ) : currentQuestions.length === 0 ? (
          <div className="text-center py-8">
            {debouncedSearch ? (
              <div>
                <p className="text-[#888888] mb-2">No questions found for "{debouncedSearch}".</p>
                <p className="text-sm text-[#888888] mb-4">Try different keywords or check your spelling.</p>
                <button
                  onClick={() => setSearch('')}
                  className="px-4 py-2 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <p className="text-[#888888]">No questions found.</p>
            )}
          </div>
        ) : (
          currentQuestions.map((question) => {
            const userVote = userVotes[question._id];
            return (
              <div key={question._id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {/* Voting Column */}
                  <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                    <button
                      onClick={() => handleVote(question._id, 'up')}
                      className={`p-2 rounded-full transition-colors group ${
                        userVote === 'up' 
                          ? 'bg-[#865A7B] bg-opacity-10 hover:bg-opacity-20' 
                          : 'hover:bg-gray-50'
                      }`}
                      aria-label="Upvote"
                    >
                      <ArrowUp className={`w-5 h-5 ${userVote === 'up' ? 'text-[#865A7B]' : 'text-gray-400 group-hover:text-[#865A7B]'} transition-colors`} />
                    </button>
                    <span className="font-semibold text-lg text-gray-700">
                      {(question.upvotes || 0) - (question.downvotes || 0)}
                    </span>
                    <button
                      onClick={() => handleVote(question._id, 'down')}
                      className={`p-2 rounded-full transition-colors group ${
                        userVote === 'down' 
                          ? 'bg-[#865A7B] bg-opacity-10 hover:bg-opacity-20' 
                          : 'hover:bg-gray-50'
                      }`}
                      aria-label="Downvote"
                    >
                      <ArrowDown className={`w-5 h-5 ${userVote === 'down' ? 'text-[#865A7B]' : 'text-gray-400 group-hover:text-[#865A7B]'} transition-colors`} />
                    </button>
                  </div>
                  
                  {/* Content Column */}
                  <div className="flex-1 space-y-3">
                    <Link 
                      to={`/question/${question._id}`}
                      className="block text-lg sm:text-xl font-semibold text-[#865A7B] hover:text-[#764a6b] transition-colors"
                    >
                      {question.title}
                    </Link>
                    <div 
                      className="text-gray-600 line-clamp-2 text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ __html: question.description }}
                    />
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
                        <span>{question.authorId.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Column */}
                  <div className="hidden sm:flex flex-col items-center space-y-2 text-center min-w-[80px]">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="font-medium">{question.answerCount}</span>
                      <span className="text-xs text-[#888888]">answers</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <span className="font-medium">{question.viewCount}</span>
                      <span className="text-xs text-[#888888]">views</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default HomePage;
