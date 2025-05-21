import { useState, useEffect } from 'react';
import { 
  Search, Plus, ChevronLeft, ChevronRight, 
  BookOpen, Trash, PenSquare, X 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Author {
  id: number;
  authorName: string;
}

const Authors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [newAuthorName, setNewAuthorName] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAuthors = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from the API
        // const response = await api.get('/api/Authors');
        // setAuthors(response.data);
        
        // For demo purposes, we're using mock data
        setTimeout(() => {
          const mockAuthors = [
            { id: 1, authorName: 'F. Scott Fitzgerald' },
            { id: 2, authorName: 'Harper Lee' },
            { id: 3, authorName: 'George Orwell' },
            { id: 4, authorName: 'Jane Austen' },
            { id: 5, authorName: 'J.R.R. Tolkien' },
            { id: 6, authorName: 'J.D. Salinger' },
            { id: 7, authorName: 'William Golding' },
            { id: 8, authorName: 'John Steinbeck' },
            { id: 9, authorName: 'Aldous Huxley' },
            { id: 10, authorName: 'Homer' },
            { id: 11, authorName: 'Mary Shelley' },
            { id: 12, authorName: 'Charles Dickens' },
          ];
          
          setAuthors(mockAuthors);
          setFilteredAuthors(mockAuthors);
          setIsLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Error fetching authors:', error);
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAuthors(authors);
    } else {
      const filtered = authors.filter(author => 
        author.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAuthors(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, authors]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAuthors.slice(indexOfFirstItem, indexOfLastItem);

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) {
      toast.error('Author name cannot be empty');
      return;
    }
    
    try {
      // In a real app, we would create via API
      // const response = await api.post('/api/Authors', { authorName: newAuthorName });
      // const newAuthor = response.data;
      
      // For demo purposes, create a mock author
      const newAuthor = {
        id: authors.length + 1,
        authorName: newAuthorName
      };
      
      setAuthors([...authors, newAuthor]);
      setFilteredAuthors([...authors, newAuthor]);
      setNewAuthorName('');
      setShowAddForm(false);
      toast.success('Author created successfully');
    } catch (error) {
      console.error('Error creating author:', error);
      toast.error('Failed to create author');
    }
  };

  const handleUpdateAuthor = async () => {
    if (!editingAuthor || !newAuthorName.trim()) {
      toast.error('Author name cannot be empty');
      return;
    }
    
    try {
      // In a real app, we would update via API
      // await api.put(`/api/Authors/${editingAuthor.id}`, { authorName: newAuthorName });
      
      // For demo purposes, update the mock data
      const updatedAuthors = authors.map(author => 
        author.id === editingAuthor.id 
          ? { ...author, authorName: newAuthorName }
          : author
      );
      
      setAuthors(updatedAuthors);
      setFilteredAuthors(updatedAuthors);
      setEditingAuthor(null);
      setNewAuthorName('');
      toast.success('Author updated successfully');
    } catch (error) {
      console.error('Error updating author:', error);
      toast.error('Failed to update author');
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this author?')) {
      return;
    }
    
    try {
      // In a real app, we would delete via API
      // await api.delete(`/api/Authors/${id}`);
      
      // For demo purposes, update the mock data
      const updatedAuthors = authors.filter(author => author.id !== id);
      setAuthors(updatedAuthors);
      setFilteredAuthors(updatedAuthors);
      toast.success('Author deleted successfully');
    } catch (error) {
      console.error('Error deleting author:', error);
      toast.error('Failed to delete author');
    }
  };

  const startEdit = (author: Author) => {
    setEditingAuthor(author);
    setNewAuthorName(author.authorName);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingAuthor(null);
    setNewAuthorName('');
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Authors</h1>
          <p className="text-gray-600 mt-1">Manage your library authors</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAuthor(null);
            setNewAuthorName('');
          }}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Author
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingAuthor) && (
        <div className="card mb-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">
              {editingAuthor ? 'Edit Author' : 'Add New Author'}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAuthor(null);
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Author Name"
              value={newAuthorName}
              onChange={(e) => setNewAuthorName(e.target.value)}
              className="input flex-grow"
            />
            
            <button
              onClick={editingAuthor ? handleUpdateAuthor : handleCreateAuthor}
              className="btn btn-primary btn-md"
            >
              {editingAuthor ? 'Update Author' : 'Add Author'}
            </button>
            
            {editingAuthor && (
              <button
                onClick={cancelEdit}
                className="btn btn-ghost btn-md border border-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
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
            {filteredAuthors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No authors found</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' 
                    ? `No authors match the search "${searchTerm}"`
                    : "Your author list is empty. Add authors to get started."}
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
                    <th>ID</th>
                    <th>Author Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((author) => (
                    <tr key={author.id}>
                      <td className="w-16">{author.id}</td>
                      <td className="font-medium">{author.authorName}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(author)}
                            className="btn btn-ghost btn-sm p-1"
                          >
                            <PenSquare className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteAuthor(author.id)}
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
          {filteredAuthors.length > 0 && (
            <div className="flex items-center justify-between my-6">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAuthors.length)} of {filteredAuthors.length} authors
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

export default Authors;