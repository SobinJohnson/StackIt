
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '../components/Layout';
import HomePage from '../components/HomePage';
import AskQuestionPage from '../components/AskQuestionPage';
import QuestionDetailPage from '../components/QuestionDetailPage';
import { AuthProvider } from '../contexts/AuthContext';

const queryClient = new QueryClient();

const Index = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ask" element={<AskQuestionPage />} />
              <Route path="/question/:id" element={<QuestionDetailPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Index;
