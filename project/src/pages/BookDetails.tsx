import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, BookOpen, Star, Calendar, Bookmark, 
  Hash, Package, Users, Trash, Clock
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Author {
  id: number;
  authorName: string;
}

interface Book {
  id: number;
  title: string;
  isbn: string;
  publishDate: string | null;
  addmissionDate: string;
  quantity: number;
  rating: number;
  authorIds: number[];
}

interface Transmission {
  bookId: number;
  userId: number;
  issuanceDate: string;
  dueDate: string;
  statusId: number;
  bookTitle: string;
  userLogin: string;
  statusName: string;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    isbn: '',
    publishDate: null,
    quantity: 1,
    rating: 0,
    authorIds: []
  });

  useEffect(() => {
    const fetchBookDetails = async () => {
      setIsLoading(true);
      try {
        const [bookResponse, authorsResponse, transmissionsResponse] = await Promise.all([
          api.get(`/api/Books/${id}`),
          api.get('/api/Authors'),
          api.get(`/api/Transmission/book/${id}`)
        ]);
        
        setBook(bookResponse.data);
        setFormData(bookResponse.data);
        setAuthors(authorsResponse.data);
        setTransmissions(transmissionsResponse.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast.error('Failed to load book details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
    setFormData({
      ...formData,
      authorIds: selectedOptions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, we would update via API
      // await api.put(`/api/Books/${id}`, formData);
      
      // For demo purposes, just update local state
      if (book) {
        const updatedBook = { ...book, ...formData };
        setBook(updatedBook);
        toast.success('Book updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await api.delete(`/api/Books/${id}`);
      toast.success('Book deleted successfully');
      navigate('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const getAuthorNames = () => {
    if (!book || !authors.length) return 'Unknown';
    
    return book.authorIds
      .map(authorId => authors.find(a => a.id === authorId)?.authorName || 'Unknown')
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="card h-64 p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Book not found</h3>
        <p className="text-gray-500 mt-2">The book you're looking for doesn't exist or has been removed.</p>
        <Link to="/books" className="btn btn-primary btn-md mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <Link to="/books" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Books
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="font-bold text-gray-900">{isEditing ? 'Edit Book' : book.title}</h1>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost btn-md border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-md"
              >
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-md"
              >
                Edit Book
              </button>
              <button 
                onClick={handleDelete}
                className="btn btn-ghost btn-md text-red-600 border border-gray-200"
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  id="isbn"
                  name="isbn"
                  type="text"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Publish Date
                </label>
                <input
                  id="publishDate"
                  name="publishDate"
                  type="date"
                  value={formData.publishDate ? new Date(formData.publishDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="authorIds" className="block text-sm font-medium text-gray-700 mb-1">
                  Authors
                </label>
                <select
                  id="authorIds"
                  name="authorIds"
                  multiple
                  value={formData.authorIds?.map(id => id.toString())}
                  onChange={handleAuthorChange}
                  className="input h-32"
                  required
                >
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.authorName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple authors</p>
              </div>
            </div>
            
            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="btn btn-primary btn-md"
              >
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="card p-6">
                <h2 className="text-xl font-medium mb-4">Book Information</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Title</p>
                      <p className="font-medium">{book.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Bookmark className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Author</p>
                      <p className="font-medium">{getAuthorNames()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Hash className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ISBN</p>
                      <p className="font-mono">{book.isbn}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Star className="h-5 w-5 text-amber-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-medium">{book.rating.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Publish Date</p>
                      <p className="font-medium">
                        {book.publishDate 
                          ? new Date(book.publishDate).toLocaleDateString() 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Added to Library</p>
                      <p className="font-medium">{new Date(book.addmissionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Package className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{book.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="card p-6">
                <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="btn btn-primary btn-md w-full justify-start">
                    <Users className="mr-2 h-5 w-5" />
                    Issue Book
                  </button>
                  
                  <Link to="/transmissions" className="btn btn-secondary btn-md w-full justify-start">
                    <Clock className="mr-2 h-5 w-5" />
                    View Loan History
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-medium mb-4">Loan History</h2>
            
            {transmissions.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-gray-500">No loan history for this book.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Issued Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transmissions.map((transmission, idx) => (
                      <tr key={idx}>
                        <td>{transmission.userLogin}</td>
                        <td>{new Date(transmission.issuanceDate).toLocaleDateString()}</td>
                        <td>{new Date(transmission.dueDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transmission.statusName === 'Returned' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transmission.statusName}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BookDetails;