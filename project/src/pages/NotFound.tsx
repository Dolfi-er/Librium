import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-blue-500">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary btn-lg">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          
          <Link to="/books" className="btn btn-secondary btn-lg">
            <Search className="mr-2 h-5 w-5" />
            Search Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;