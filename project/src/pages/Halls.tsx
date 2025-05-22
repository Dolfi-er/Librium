"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, ChevronLeft, ChevronRight, Building, Trash, PenSquare, X } from "lucide-react"
import api from "../services/api"
import toast from "react-hot-toast"

interface Hall {
  id: number
  libraryName: string
  hallName: string
  totalCapacity: number
  takenCapacity: number
  specification: string | null
}

const Halls = () => {
  const [halls, setHalls] = useState<Hall[]>([])
  const [filteredHalls, setFilteredHalls] = useState<Hall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHall, setEditingHall] = useState<Hall | null>(null)
  const [newHall, setNewHall] = useState({
    libraryName: "",
    hallName: "",
    totalCapacity: 1,
    takenCapacity: 0,
    specification: "",
  })
  const itemsPerPage = 10

  useEffect(() => {
    const fetchHalls = async () => {
      setIsLoading(true)
      try {
        const response = await api.get("/api/Hall")
        setHalls(response.data)
        setFilteredHalls(response.data)
      } catch (error) {
        console.error("Error fetching halls:", error)
        toast.error("Не удалось загрузить залы")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHalls()
  }, [])

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredHalls(halls)
    } else {
      const filtered = halls.filter(
        (hall) =>
          hall.hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hall.libraryName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredHalls(filtered)
    }
    setCurrentPage(1) // Reset to first page on search
  }, [searchTerm, halls])

  // Calculate pagination
  const totalPages = Math.ceil(filteredHalls.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredHalls.slice(indexOfFirstItem, indexOfLastItem)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewHall((prev) => ({
      ...prev,
      [name]: name === "totalCapacity" || name === "takenCapacity" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleCreateHall = async () => {
    if (!newHall.libraryName.trim() || !newHall.hallName.trim()) {
      toast.error("Название библиотеки и зала не могут быть пустыми")
      return
    }

    if (newHall.totalCapacity < 1) {
      toast.error("Общая вместимость должна быть не менее 1")
      return
    }

    if (newHall.takenCapacity < 0 || newHall.takenCapacity > newHall.totalCapacity) {
      toast.error("Занятая вместимость должна быть от 0 до общей вместимости")
      return
    }

    try {
      const response = await api.post("/api/Hall", newHall)
      const createdHall = response.data

      setHalls([...halls, createdHall])
      setNewHall({
        libraryName: "",
        hallName: "",
        totalCapacity: 1,
        takenCapacity: 0,
        specification: "",
      })
      setShowAddForm(false)
      toast.success("Зал создан")
    } catch (error) {
      console.error("Error creating hall:", error)
      toast.error("Не удалось создать зал")
    }
  }

  const handleUpdateHall = async () => {
    if (!editingHall) return

    if (!newHall.libraryName.trim() || !newHall.hallName.trim()) {
      toast.error("Название библиотеки и зала не могут быть пустыми")
      return
    }

    if (newHall.totalCapacity < 1) {
      toast.error("Общая вместимость должна быть не менее 1")
      return
    }

    if (newHall.takenCapacity < 0 || newHall.takenCapacity > newHall.totalCapacity) {
      toast.error("Занятая вместимость должна быть от 0 до общей вместимости")
      return
    }

    try {
      await api.put(`/api/Hall/${editingHall.id}`, newHall)

      const updatedHalls = halls.map((hall) => (hall.id === editingHall.id ? { ...hall, ...newHall } : hall))

      setHalls(updatedHalls)
      setEditingHall(null)
      setNewHall({
        libraryName: "",
        hallName: "",
        totalCapacity: 1,
        takenCapacity: 0,
        specification: "",
      })
      toast.success("Информация о зале обновлена")
    } catch (error) {
      console.error("Error updating hall:", error)
      toast.error("Не удалось обновить информацию о зале")
    }
  }

  const handleDeleteHall = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот зал?")) {
      return
    }

    try {
      await api.delete(`/api/Hall/${id}`)
      const updatedHalls = halls.filter((hall) => hall.id !== id)
      setHalls(updatedHalls)
      toast.success("Зал удален")
    } catch (error) {
      console.error("Error deleting hall:", error)
      toast.error("Не удалось удалить зал")
    }
  }

  const startEdit = (hall: Hall) => {
    setEditingHall(hall)
    setNewHall({
      libraryName: hall.libraryName,
      hallName: hall.hallName,
      totalCapacity: hall.totalCapacity,
      takenCapacity: hall.takenCapacity,
      specification: hall.specification || "",
    })
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditingHall(null)
    setNewHall({
      libraryName: "",
      hallName: "",
      totalCapacity: 1,
      takenCapacity: 0,
      specification: "",
    })
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Залы</h1>
          <p className="text-gray-600 mt-1">Управление залами в вашей библиотеке</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingHall(null)
            setNewHall({
              libraryName: "",
              hallName: "",
              totalCapacity: 1,
              takenCapacity: 0,
              specification: "",
            })
          }}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить зал
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingHall) && (
        <div className="card mb-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{editingHall ? "Редактировать зал" : "Добавить новый зал"}</h2>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingHall(null)
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название библиотеки *</label>
              <input
                type="text"
                name="libraryName"
                placeholder="Название библиотеки"
                value={newHall.libraryName}
                onChange={handleInputChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название зала *</label>
              <input
                type="text"
                name="hallName"
                placeholder="Название зала"
                value={newHall.hallName}
                onChange={handleInputChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Общая вместимость *</label>
              <input
                type="number"
                name="totalCapacity"
                placeholder="Общая вместимость"
                value={newHall.totalCapacity}
                onChange={handleInputChange}
                min="1"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Занятая вместимость *</label>
              <input
                type="number"
                name="takenCapacity"
                placeholder="Занятая вместимость"
                value={newHall.takenCapacity}
                onChange={handleInputChange}
                min="0"
                max={newHall.totalCapacity}
                className="input w-full"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Спецификация</label>
              <textarea
                name="specification"
                placeholder="Спецификация зала"
                value={newHall.specification}
                onChange={handleInputChange}
                className="input w-full h-24"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={editingHall ? handleUpdateHall : handleCreateHall} className="btn btn-primary btn-md">
              {editingHall ? "Обновить информацию" : "Добавить зал"}
            </button>

            {editingHall && (
              <button onClick={cancelEdit} className="btn btn-ghost btn-md border border-gray-200">
                Отменить
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
              placeholder="Искать залы..."
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
            {filteredHalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Залы не найдены</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== ""
                    ? `Ни один зал не соответствует запросу "${searchTerm}"`
                    : "Ваш список залов пуст. Добавьте залы, чтобы начать."}
                </p>
                {searchTerm.trim() !== "" && (
                  <button onClick={() => setSearchTerm("")} className="btn btn-ghost btn-sm mt-4 text-blue-600">
                    Очистить поиск
                  </button>
                )}
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Библиотека</th>
                    <th>Название зала</th>
                    <th>Вместимость</th>
                    <th>Занято</th>
                    <th>Управление</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((hall) => (
                    <tr key={hall.id}>
                      <td className="w-16">{hall.id}</td>
                      <td>{hall.libraryName}</td>
                      <td className="font-medium">{hall.hallName}</td>
                      <td>{hall.totalCapacity}</td>
                      <td>
                        <div className="flex items-center">
                          <span className="mr-2">{hall.takenCapacity}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${(hall.takenCapacity / hall.totalCapacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button onClick={() => startEdit(hall)} className="btn btn-ghost btn-sm p-1">
                            <PenSquare className="h-4 w-4 text-blue-600" />
                          </button>
                          <button onClick={() => handleDeleteHall(hall.id)} className="btn btn-ghost btn-sm p-1">
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
          {filteredHalls.length > 0 && (
            <div className="flex items-center justify-between my-6">
              <div className="text-sm text-gray-600">
                Показывается {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredHalls.length)} из{" "}
                {filteredHalls.length} залов
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
                  Страница {currentPage} из {totalPages}
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
  )
}

export default Halls
