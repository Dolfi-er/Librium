import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Filter, Star, ChevronLeft, ChevronRight, 
  BookOpen, Trash, PenSquare 
} from 'lucide-react';
import api from '../services/api';

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

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openBookForm, setOpenBookForm] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from the API
        // const response = await api.get('/api/Books');
        // setBooks(response.data);
        
        // For demo purposes, we're using mock data
        setTimeout(() => {
          const mockBooks = [
            { id: 1, title: 'The Great Gatsby', isbn: '9780743273565', publishDate: '1925-04-10', addmissionDate: '2024-01-15', quantity: 5, rating: 4.5, authorIds: [1] },
            { id: 2, title: 'To Kill a Mockingbird', isbn: '9780061120084', publishDate: '1960-07-11', addmissionDate: '2024-01-15', quantity: 3, rating: 4.8, authorIds: [2] },
            { id: 3, title: '1984', isbn: '9780451524935', publishDate: '1949-06-08', addmissionDate: '2024-01-16', quantity: 7, rating: 4.6, authorIds: [3] },
            { id: 4, title: 'Pride and Prejudice', isbn: '9780141439518', publishDate: '1813-01-28', addmissionDate: '2024-01-16', quantity: 4, rating: 4.7, authorIds: [4] },
            { id: 5, title: 'The Hobbit', isbn: '9780618260300', publishDate: '1937-09-21', addmissionDate: '2024-01-17', quantity: 6, rating: 4.9, authorIds: [5] },
            { id: 6, title: 'Animal Farm', isbn: '9780451526342', publishDate: '1945-08-17', addmissionDate: '2024-01-18', quantity: 5, rating: 4.3, authorIds: [3] },
            { id: 7, title: 'The Catcher in the Rye', isbn: '9780316769488', publishDate: '1951-07-16', addmissionDate: '2024-01-19', quantity: 3, rating: 4.1, authorIds: [6] },
            { id: 8, title: 'Lord of the Flies', isbn: '9780399501487', publishDate: '1954-09-17', addmissionDate: '2024-01-20', quantity: 4, rating: 4.0, authorIds: [7] },
            { id: 9, title: 'The Grapes of Wrath', isbn: '9780143039433', publishDate: '1939-04-14', addmissionDate: '2024-01-21', quantity: 2, rating: 4.4, authorIds: [8] },
            { id: 10, title: 'Brave New World', isbn: '9780060850524', publishDate: '1932-01-01', addmissionDate: '2024-01-22', quantity: 5, rating: 4.2, authorIds: [9] },
            { id: 11, title: 'The Odyssey', isbn: '9780140268867', publishDate: '1800-01-01', addmissionDate: '2024-01-23', quantity: 3, rating: 4.7, authorIds: [10] },
            { id: 12, title: 'Frankenstein', isbn: '9780486282114', publishDate: '1818-01-01', addmissionDate: '2024-01-24', quantity: 4, rating: 4.3, authorIds: [11] },
          ];
          
          setBooks(mockBooks);
          setFilteredBooks(mockBooks);
          setIsLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Error fetching books:', error);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

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
          onClick={() => setOpenBookForm(true)}
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
          <button className="btn btn-ghost btn-md border border-gray-200">
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
                          <button className="btn btn-ghost btn-sm p-1">
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
    </div>
  );
};

export default Books;