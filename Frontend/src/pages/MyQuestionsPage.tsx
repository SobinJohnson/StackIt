import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { questionsService, QuestionsFilter } from '@/lib/services/questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar,
  Plus,
  BookOpen
} from 'lucide-react';

const MyQuestionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'most_answers' | 'most_views'>('newest');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Redirect to home if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch user questions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userQuestions', debouncedSearch, sort, page],
    queryFn: () => questionsService.getUserQuestions({
      search: debouncedSearch,
      sort,
      page,
      limit: 10
    }),
    enabled: !!user,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSort(value as typeof sort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleQuestionClick = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  const handleAskQuestion = () => {
    navigate('/ask');
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#865A7B] mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load your questions. Please try again.',
      variant: 'destructive',
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8" />
              My Questions
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and view all your questions
            </p>
          </div>
          <Button onClick={handleAskQuestion} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ask Question
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search your questions..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_answers">Most Answers</SelectItem>
                <SelectItem value="most_views">Most Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((question) => (
            <Card 
              key={question._id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleQuestionClick(question._id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 hover:text-[#865A7B] transition-colors">
                      {question.title}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: question.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                        }} 
                      />
                    </CardDescription>
                  </div>
                  {question.acceptedAnswerId && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Solved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {question.answerCount} answers
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {question.viewCount} views
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {question.upvotes || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4" />
                      {question.downvotes || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">
              {search ? 'No questions match your search.' : 'You haven\'t asked any questions yet.'}
            </p>
            <Button onClick={handleAskQuestion} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ask Your First Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Results Info */}
      {data?.pagination && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total} questions
        </div>
      )}
    </div>
  );
};

export default MyQuestionsPage; 