
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api, API_ENDPOINTS, handleApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from './RichTextEditor';
import { X } from 'lucide-react';

const AskQuestionPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please login to ask a question',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !description.trim() || tags.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields and add at least one tag',
        variant: 'destructive',
      });
      return;
    }

    if (title.trim().length < 10) {
      toast({
        title: 'Error',
        description: 'Title must be at least 10 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (title.trim().length > 200) {
      toast({
        title: 'Error',
        description: 'Title must be less than 200 characters',
        variant: 'destructive',
      });
      return;
    }

    if (description.trim().length < 20) {
      toast({
        title: 'Error',
        description: 'Description must be at least 20 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (tags.length > 10) {
      toast({
        title: 'Error',
        description: 'You can only add up to 10 tags',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await api.post(API_ENDPOINTS.QUESTIONS, {
        title: title.trim(),
        description: description.trim(),
        tags: tags
      });

      toast({
        title: 'Success',
        description: 'Question posted successfully!',
      });

      // Navigate to the new question
      navigate(`/question/${response.data.question._id}`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
        <p className="text-[#888888] mb-6">You need to be logged in to ask a question.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-[#888888]">
          Be specific and imagine you're asking a question to another person
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Be specific and imagine you're asking a question to another person"
            className="w-full px-4 py-3 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
            Description
          </label>
          <RichTextEditor 
            value={description}
            onChange={setDescription}
            placeholder="Include all the information someone would need to answer your question"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-900 mb-2">
            Tags
          </label>
          <div className="space-y-2">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add up to 5 tags to describe what your question is about (press Enter or comma to add)"
              className="w-full px-4 py-3 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#865A7B] text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-[#888888] text-[#888888] rounded-lg hover:border-[#865A7B] hover:text-[#865A7B] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Your Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestionPage;
