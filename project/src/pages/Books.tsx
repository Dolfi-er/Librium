import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Filter, Star, ChevronLeft, ChevronRight, 
  BookOpen, Trash, PenSquare, X 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

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

interface Author {
  id: number;
  authorName: string;
}

interface BookFormData {
  title: string;
  isbn: string;
  publishDate: string | null;
  quantity: number;
  rating: number;
  authorIds: number[];
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    isbn: '',
    publishDate: null,
    quantity: 1,
    rating: 0,
    authorIds: []
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    Promise.all([
      fetchBooks(),
      fetchAuthors()
    ]);
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/Books');
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await api.get('/api/Authors');
      setAuthors(response.data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await api.delete(`/api/Books/${id}`);
      toast.success('Book deleted successfully');
      fetchBooks(); // Refresh the list
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
    setFormData(prev => ({
      ...prev,
      authorIds: selectedOptions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure dates are in UTC
      const now = new Date();
      const utcNow = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      ));

      const publishDate = formData.publishDate 
        ? new Date(formData.publishDate)
        : null;

      const utcPublishDate = publishDate 
        ? new Date(Date.UTC(
            publishDate.getUTCFullYear(),
            publishDate.getUTCMonth(),
            publishDate.getUTCDate()
          ))
        : null;

      const response = await api.post('/api/Books', {
        ...formData,
        publishDate: utcPublishDate?.toISOString() || null,
        addmissionDate: utcNow.toISOString()
      });
      
      setBooks(prev => [...prev, response.data]);
      setShowBookForm(false);
      setFormData({
        title: '',
        isbn: '',
        publishDate: null,
        quantity: 1,
        rating: 0,
        authorIds: []
      });
      toast.success('Book added successfully');
      fetchBooks(); // Refresh the list to ensure we have the latest data
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Failed to add book');
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      );
      setFilteredBooks(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, books]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Books</h1>
          <p className="text-gray-600 mt-1">Manage your library books</p>
        </div>
        <button
          onClick={() => setShowBookForm(true)}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Book
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-accent' : 'btn-ghost'} btn-md border border-gray-200`}
          >
            <Filter className="mr-2 h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="table-container animate-pulse">
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            {filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No books found</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' 
                    ? `No books match the search "${searchTerm}"`
                    : "Your library is empty. Add books to get started."}
                </p>
                {searchTerm.trim() !== '' && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn btn-ghost btn-sm mt-4 text-blue-600"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>ISBN</th>
                    <th className="hidden sm:table-cell">Added On</th>
                    <th className="hidden md:table-cell">Quantity</th>
                    <th className="hidden md:table-cell">Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((book) => (
                    <tr key={book.id}>
                      <td className="font-medium">
                        <Link to={`/books/${book.id}`} className="hover:text-blue-600">
                          {book.title}
                        </Link>
                      </td>
                      <td className="font-mono text-sm">{book.isbn}</td>
                      <td className="hidden sm:table-cell">{new Date(book.addmissionDate).toLocaleDateString()}</td>
                      <td className="hidden md:table-cell">{book.quantity}</td>
                      <td className="hidden md:table-cell">{renderStarRating(book.rating)}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Link
                            to={`/books/${book.id}`}
                            className="btn btn-ghost btn-sm p-1"
                          >
                            <PenSquare className="h-4 w-4 text-blue-600" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteBook(book.id)}
                            className="btn btn-ghost btn-sm p-1"
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredBooks.length > 0 && (
            <div className="flex items-center justify-between my-6">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBooks.length)} of {filteredBooks.length} books
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-ghost btn-sm p-1 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-ghost btn-sm p-1 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Book Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Add New Book</h2>
              <button
                onClick={() => setShowBookForm(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.publishDate || ''}
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
                    min="1"
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
                    value={formData.authorIds.map(id => id.toString())}
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
              
              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookForm(false)}
                  className="btn btn-ghost btn-md border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;