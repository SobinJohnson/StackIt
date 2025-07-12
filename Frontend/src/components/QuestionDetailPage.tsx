
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Check, MessageSquare, User, Clock, Tag, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from './RichTextEditor';

interface Answer {
  id: string;
  content: string;
  author: string;
  votes: number;
  createdAt: string;
  isAccepted: boolean;
  userVote?: 'up' | 'down' | null;
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [newAnswer, setNewAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([
    {
      id: '1',
      content: 'You can use the CONCAT function in SQL Server to join two columns. Here\'s the syntax: <br><br><code>SELECT CONCAT(UserName, \' - \', UserId) AS CombinedColumn FROM YourTable</code><br><br>This will create a new column with both values separated by a dash.',
      author: 'sql_expert',
      votes: 8,
      createdAt: '1 hour ago',
      isAccepted: true,
      userVote: null
    },
    {
      id: '2',
      content: 'Another approach is to use the + operator:<br><br><code>SELECT UserName + \' \' + CAST(UserId AS VARCHAR) AS CombinedColumn FROM YourTable</code><br><br>Make sure to cast the UserId to VARCHAR if it\'s a numeric type.',
      author: 'developer123',
      votes: 3,
      createdAt: '30 minutes ago',
      isAccepted: false,
      userVote: null
    }
  ]);

  // Mock question data
  const question = {
    id: '1',
    title: 'How to join 2 columns in a data set to make a separate column in SQL?',
    content: 'I am using SQL Server and I have two columns UserName and UserId. I want to create a third column containing both values.<br><br>Can someone show me the best way to achieve this? I tried concatenation but I\'m not getting the expected results.',
    tags: ['SQL', 'database', 'joins'],
    author: 'john_doe',
    votes: 5,
    views: 245,
    createdAt: '2 hours ago',
    userVote: null as 'up' | 'down' | null
  };

  const handleVote = (type: 'up' | 'down', answerId?: string) => {
    console.log(`Voting ${type} on ${answerId ? `answer ${answerId}` : 'question'}`);
  };

  const handleAcceptAnswer = (answerId: string) => {
    setAnswers(answers.map(answer => ({
      ...answer,
      isAccepted: answer.id === answerId ? !answer.isAccepted : false
    })));
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !newAnswer.trim()) return;

    const answer: Answer = {
      id: Date.now().toString(),
      content: newAnswer,
      author: user!.username,
      votes: 0,
      createdAt: 'just now',
      isAccepted: false,
      userVote: null
    };

    setAnswers([...answers, answer]);
    setNewAnswer('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              onClick={() => handleVote('up')}
              className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <span className="text-xl font-bold">{question.votes}</span>
            <button 
              onClick={() => handleVote('down')}
              className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>

          {/* Content Column */}
          <div className="flex-1 space-y-4">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: question.content }}
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
                <span>{question.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{question.author}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>{question.createdAt}</span>
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

        {answers.map((answer) => (
          <div key={answer.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex space-x-6">
              {/* Voting Column */}
              <div className="flex flex-col items-center space-y-2">
                <button 
                  onClick={() => handleVote('up', answer.id)}
                  className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="text-xl font-bold">{answer.votes}</span>
                <button 
                  onClick={() => handleVote('down', answer.id)}
                  className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                
                {/* Accept Answer (only for question owner) */}
                {isAuthenticated && user?.username === question.author && (
                  <button
                    onClick={() => handleAcceptAnswer(answer.id)}
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
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />

                {answer.isAccepted && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4 mr-1" />
                    Accepted Answer
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center justify-end text-sm text-[#888888] pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{answer.author}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{answer.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
                className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors font-medium"
              >
                Post Your Answer
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
