
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, Check, MessageSquare, User, Clock, Tag, ChevronRight, Eye } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { questionsService, Question } from '@/lib/services/questions';
import { answersService, Answer } from '@/lib/services/answers';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from './RichTextEditor';

const VOTE_STORAGE_KEY = 'questionVotes';
const ANSWER_VOTE_STORAGE_KEY = 'answerVotes';

type VoteType = 'up' | 'down';
type UserVotes = { [id: string]: VoteType };

const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAnswer, setNewAnswer] = useState('');

  // User votes state, initialized from localStorage
  const [userVotes, setUserVotes] = useState<UserVotes>(() => {
    try {
      const stored = localStorage.getItem(VOTE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [userAnswerVotes, setUserAnswerVotes] = useState<UserVotes>(() => {
    try {
      const stored = localStorage.getItem(ANSWER_VOTE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Fetch question
  const { data: questionData, isLoading: questionLoading, error: questionError } = useQuery({
    queryKey: ['question', id],
    queryFn: () => questionsService.getQuestion(id!),
    enabled: !!id,
  });

  // Fetch answers
  const { data: answersData, isLoading: answersLoading, error: answersError } = useQuery({
    queryKey: ['answers', id],
    queryFn: () => answersService.getAnswers(id!),
    enabled: !!id,
  });

  const question = questionData;
  const answers = answersData?.answers || [];

  // Vote mutation for questions
  const voteQuestionMutation = useMutation({
    mutationFn: ({ questionId, type }: { questionId: string; type: VoteType }) =>
      questionsService.voteQuestion(questionId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to record vote. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Vote mutation for answers
  const voteAnswerMutation = useMutation({
    mutationFn: ({ answerId, type }: { answerId: string; type: VoteType }) =>
      answersService.voteAnswer(answerId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to record vote. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Post answer mutation
  const postAnswerMutation = useMutation({
    mutationFn: (content: string) => answersService.createAnswer(id!, content),
    onSuccess: () => {
      setNewAnswer('');
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
      toast({
        title: 'Success',
        description: 'Answer posted successfully!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to post answer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Accept answer mutation
  const acceptAnswerMutation = useMutation({
    mutationFn: (answerId: string) => answersService.acceptAnswer(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      toast({
        title: 'Success',
        description: 'Answer accepted successfully!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to accept answer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle question voting
  const handleQuestionVote = async (type: VoteType) => {
    if (!id) return;
    
    try {
      await voteQuestionMutation.mutateAsync({ questionId: id, type });
      
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
    } catch (error) {
      // Error is handled by mutation
    }
  };

  // Handle answer voting
  const handleAnswerVote = async (answerId: string, type: VoteType) => {
    try {
      await voteAnswerMutation.mutateAsync({ answerId, type });
      
      // Update localStorage and state
      let updatedVotes = { ...userAnswerVotes };
      
      if (userAnswerVotes[answerId] === type) {
        // User clicked the same vote button - remove the vote
        delete updatedVotes[answerId];
      } else {
        // User changed their vote or voted for the first time
        updatedVotes[answerId] = type;
      }
      
      setUserAnswerVotes(updatedVotes);
      localStorage.setItem(ANSWER_VOTE_STORAGE_KEY, JSON.stringify(updatedVotes));
    } catch (error) {
      // Error is handled by mutation
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !newAnswer.trim() || !id) return;

    await postAnswerMutation.mutateAsync(newAnswer.trim());
  };

  // Handle answer acceptance
  const handleAcceptAnswer = async (answerId: string) => {
    await acceptAnswerMutation.mutateAsync(answerId);
  };

  // Loading state
  if (questionLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#865A7B] mx-auto"></div>
        <p className="mt-2 text-[#888888]">Loading question...</p>
      </div>
    );
  }

  // Error state
  if (questionError) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h2>
        <p className="text-[#888888] mb-6">The question you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h2>
        <p className="text-[#888888] mb-6">The question you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const userQuestionVote = userVotes[question._id];

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-[#888888]">
        <Link to="/" className="hover:text-[#865A7B] transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span>Question</span>
      </nav>

      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        
        <div className="flex space-x-6">
          {/* Voting Column */}
          <div className="flex flex-col items-center space-y-2">
            <button 
              onClick={() => handleQuestionVote('up')}
              className={`p-2 rounded transition-colors group ${
                userQuestionVote === 'up' 
                  ? 'bg-[#865A7B] bg-opacity-10 hover:bg-opacity-20' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <ArrowUp className={`w-6 h-6 ${userQuestionVote === 'up' ? 'text-[#865A7B]' : 'text-gray-400 group-hover:text-[#865A7B]'} transition-colors`} />
            </button>
            <span className="text-xl font-bold text-gray-700">
              {(question.upvotes || 0) - (question.downvotes || 0)}
            </span>
            <button 
              onClick={() => handleQuestionVote('down')}
              className={`p-2 rounded transition-colors group ${
                userQuestionVote === 'down' 
                  ? 'bg-[#865A7B] bg-opacity-10 hover:bg-opacity-20' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <ArrowDown className={`w-6 h-6 ${userQuestionVote === 'down' ? 'text-[#865A7B]' : 'text-gray-400 group-hover:text-[#865A7B]'} transition-colors`} />
            </button>
          </div>

          {/* Content Column */}
          <div className="flex-1 space-y-4">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

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
            <div className="flex items-center justify-between text-sm text-[#888888] pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {question.viewCount} views
                </span>
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {question.answerCount} answers
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{question.authorId.username}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>{new Date(question.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#865A7B] mx-auto"></div>
            <p className="mt-2 text-[#888888]">Loading answers...</p>
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#888888]">No answers yet. Be the first to answer!</p>
          </div>
        ) : (
                    answers.map((answer, index) => {
            const userAnswerVote = userAnswerVotes[answer._id];
            return (
              <div key={answer._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Answer Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-[#865A7B] text-white rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Answer #{index + 1}
                      </h3>
                      <p className="text-sm text-[#888888]">
                        {answer.isAccepted ? 'Accepted Solution' : 'Community Answer'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Answer Status Badge */}
                  <div className="flex items-center space-x-2">
                    {answer.isAccepted && (
                      <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4 mr-1" />
                        Accepted
                      </div>
                    )}
                    <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {answer.voteScore || 0} votes
                    </div>
                  </div>
                </div>

            <div className="flex space-x-6">
              {/* Voting Column */}
              <div className="flex flex-col items-center space-y-2">
                <button 
                      onClick={() => handleAnswerVote(answer._id, 'up')}
                      className={`p-2 rounded transition-colors group ${
                        userAnswerVote === 'up' 
                          ? 'bg-[#865A7B] bg-opacity-10 hover:bg-opacity-20' 
                          : 'hover:bg-gray-50'
                      }`}
                      title="Upvote this answer"
                    >
                      <ArrowUp className={`w-6 h-6 ${userAnswerVote === 'up' ? 'text-[#865A7B]' : 'text-gray-400 group-hover:text-[#865A7B]'} transition-colors`} />
                </button>
                    <span className="text-xl font-bold text-gray-700">
                      {(answer.upvotes || 0) - (answer.downvotes || 0)}
                    </span>
                <button 
                      onClick={() => handleAnswerVote(answer._id, 'down')}
                      className={`p-2 rounded transition-colors group ${
                        userAnswerVote === 'down' 
                          ? 'bg-[#865A7B] bg-opacity-10 hover:bg-opacity-20' 
                          : 'hover:bg-gray-50'
                      }`}
                      title="Downvote this answer"
                    >
                      <ArrowDown className={`w-6 h-6 ${userAnswerVote === 'down' ? 'text-[#865A7B]' : 'text-gray-400 group-hover:text-[#865A7B]'} transition-colors`} />
                </button>
                
                {/* Accept Answer (only for question owner) */}
                    {isAuthenticated && user?.username === question.authorId.username && (
                  <button
                        onClick={() => handleAcceptAnswer(answer._id)}
                        disabled={acceptAnswerMutation.isPending}
                    className={`p-2 rounded transition-colors ${
                      answer.isAccepted 
                        ? 'bg-green-500 text-white' 
                        : 'hover:bg-green-500 hover:text-white'
                    }`}
                    title={answer.isAccepted ? 'Accepted Answer' : 'Accept Answer'}
                  >
                    <Check className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 space-y-4">
                    {/* Answer Content */}
                    <div className="bg-gray-50 rounded-lg p-4">
                <div 
                        className="prose max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />
                    </div>

                    {/* Answer Footer */}
                    <div className="flex items-center justify-between text-sm text-[#888888] pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium text-gray-700">{answer.authorId.username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Answer Actions */}
                      <div className="flex items-center space-x-2">
                {answer.isAccepted && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4 mr-1" />
                            Best Answer
                  </div>
                )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Answer Form */}
      {isAuthenticated ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <RichTextEditor 
              value={newAnswer}
              onChange={setNewAnswer}
              placeholder="Write your answer here..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={postAnswerMutation.isPending || !newAnswer.trim()}
                className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {postAnswerMutation.isPending ? 'Posting...' : 'Post Your Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-[#888888] mb-4">You must be logged in to post an answer.</p>
          <button className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors">
            Login to Answer
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
