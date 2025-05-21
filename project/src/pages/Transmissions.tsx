import { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, ChevronLeft, ChevronRight, 
  BookCopy, Trash, CheckCircle, X, AlertTriangle,
  Calendar, User, BookOpen, Clock
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

interface Status {
  id: number;
  statusName: string;
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

const Transmissions = () => {
  const location = useLocation();
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [filteredTransmissions, setFilteredTransmissions] = useState<Transmission[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransmissionsAndStatuses = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from the API
        // const transmissionsResponse = await api.get('/api/Transmission');
        // const statusesResponse = await api.get('/api/Status');
        
        // For demo purposes, we're using mock data
        setTimeout(() => {
          const mockStatuses = [
            { id: 1, statusName: 'Active' },
            { id: 2, statusName: 'Returned' },
            { id: 3, statusName: 'Overdue' },
            { id: 4, statusName: 'Lost' },
          ];
          
          const mockTransmissions = [
            { 
              bookId: 1, 
              userId: 1, 
              issuanceDate: '2025-07-01', 
              dueDate: '2025-07-15', 
              statusId: 1, 
              bookTitle: 'The Great Gatsby', 
              userLogin: 'john.doe', 
              statusName: 'Active' 
            },
            { 
              bookId: 2, 
              userId: 2, 
              issuanceDate: '2025-06-15', 
              dueDate: '2025-06-29', 
              statusId: 2, 
              bookTitle: 'To Kill a Mockingbird', 
              userLogin: 'jane.smith', 
              statusName: 'Returned' 
            },
            { 
              bookId: 3, 
              userId: 3, 
              issuanceDate: '2025-06-20', 
              dueDate: '2025-07-04', 
              statusId: 3, 
              bookTitle: '1984', 
              userLogin: 'robert.johnson', 
              statusName: 'Overdue' 
            },
            { 
              bookId: 4, 
              userId: 4, 
              issuanceDate: '2025-06-25', 
              dueDate: '2025-07-09', 
              statusId: 1, 
              bookTitle: 'Pride and Prejudice', 
              userLogin: 'emily.williams', 
              statusName: 'Active' 
            },
            { 
              bookId: 5, 
              userId: 5, 
              issuanceDate: '2025-06-10', 
              dueDate: '2025-06-24', 
              statusId: 4, 
              bookTitle: 'The Hobbit', 
              userLogin: 'michael.brown', 
              statusName: 'Lost' 
            },
            { 
              bookId: 6, 
              userId: 1, 
              issuanceDate: '2025-06-05', 
              dueDate: '2025-06-19', 
              statusId: 3, 
              bookTitle: 'Animal Farm', 
              userLogin: 'john.doe', 
              statusName: 'Overdue' 
            },
          ];
          
          setStatuses(mockStatuses);
          setTransmissions(mockTransmissions);
          setFilteredTransmissions(mockTransmissions);
          setIsLoading(false);
          
          // Check if URL has filter=overdue parameter
          const params = new URLSearchParams(location.search);
          if (params.get('filter') === 'overdue') {
            setShowOverdueOnly(true);
          }
        }, 500);
        
      } catch (error) {
        console.error('Error fetching transmissions:', error);
        setIsLoading(false);
      }
    };

    fetchTransmissionsAndStatuses();
  }, [location.search]);

  // Apply filters
  useEffect(() => {
    let filtered = [...transmissions];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(transmission => 
        transmission.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transmission.userLogin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== null) {
      filtered = filtered.filter(transmission => transmission.statusId === statusFilter);
    }
    
    // Apply overdue filter
    if (showOverdueOnly) {
      filtered = filtered.filter(transmission => transmission.statusName === 'Overdue');
    }
    
    setFilteredTransmissions(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, statusFilter, showOverdueOnly, transmissions]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransmissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransmissions.slice(indexOfFirstItem, indexOfLastItem);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setShowOverdueOnly(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Book Transmissions</h1>
          <p className="text-gray-600 mt-1">Manage book loans and returns</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Issue Book
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by book title or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select
              value={statusFilter === null ? '' : statusFilter}
              onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : null)}
              className="input"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.statusName}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`btn btn-md ${showOverdueOnly ? 'btn-accent' : 'btn-ghost border border-gray-200'}`}
            >
              <AlertTriangle className={`mr-2 h-4 w-4 ${showOverdueOnly ? 'text-white' : 'text-red-500'}`} /> 
              Overdue Only
            </button>
            
            {(searchTerm || statusFilter !== null || showOverdueOnly) && (
              <button 
                onClick={clearFilters}
                className="btn btn-ghost btn-md border border-gray-200"
              >
                <X className="mr-2 h-4 w-4" /> Clear Filters
              </button>
            )}
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
            {filteredTransmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BookCopy className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No transmissions found</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' || statusFilter !== null || showOverdueOnly
                    ? "No transmissions match your search criteria"
                    : "No book transmissions recorded yet."}
                </p>
                {(searchTerm.trim() !== '' || statusFilter !== null || showOverdueOnly) && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost btn-sm mt-4 text-blue-600"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>User</th>
                    <th className="hidden sm:table-cell">Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((transmission, idx) => (
                    <tr key={idx}>
                      <td className="font-medium max-w-[180px] truncate">{transmission.bookTitle}</td>
                      <td>{transmission.userLogin}</td>
                      <td className="hidden sm:table-cell">{new Date(transmission.issuanceDate).toLocaleDateString()}</td>
                      <td>{new Date(transmission.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transmission.statusName === 'Active' 
                            ? 'bg-blue-100 text-blue-800' 
                            : transmission.statusName === 'Returned'
                              ? 'bg-green-100 text-green-800'
                              : transmission.statusName === 'Overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transmission.statusName === 'Overdue' && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {transmission.statusName === 'Returned' && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {transmission.statusName}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          {transmission.statusName === 'Active' && (
                            <button
                              title="Mark as Returned"
                              className="btn btn-ghost btn-sm p-1"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          <button
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
          {filteredTransmissions.length > 0 && (
            <div className="flex items-center justify-between my-6">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransmissions.length)} of {filteredTransmissions.length} transmissions
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

      {/* Issue Book Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Issue Book</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
                  Book
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select id="book" className="input pl-9">
                    <option value="">Select a book</option>
                    <option value="1">The Great Gatsby</option>
                    <option value="2">To Kill a Mockingbird</option>
                    <option value="3">1984</option>
                    <option value="4">Pride and Prejudice</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select id="user" className="input pl-9">
                    <option value="">Select a user</option>
                    <option value="1">john.doe</option>
                    <option value="2">jane.smith</option>
                    <option value="3">robert.johnson</option>
                    <option value="4">emily.williams</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="issueDate"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="input pl-9"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="dueDate"
                    type="date"
                    defaultValue={new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]}
                    className="input pl-9"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost btn-md border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    toast.success('Book issued successfully');
                  }}
                  className="btn btn-primary btn-md"
                >
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transmissions;