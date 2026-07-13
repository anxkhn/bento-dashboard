import { useState } from 'react'
import { useDashboardStore } from '../../store/dashboardStore'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

const NOTE_COLORS = [
  '#fef3c7',
  '#fce7f3',
  '#dbeafe',
  '#d1fae5',
  '#e0e7ff',
  '#fef9c3',
]

export function NotesWidget() {
  const { notes, addNote, updateNote, deleteNote } = useDashboardStore()
  const [newNoteContent, setNewNoteContent] = useState('')
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return
    
    addNote(newNoteContent.trim(), selectedColor)
    setNewNoteContent('')
    setSelectedColor(NOTE_COLORS[0])
    setIsAddingNote(false)
  }

  const handleStartEdit = (id: string, content: string) => {
    setEditingId(id)
    setEditContent(content)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return
    
    updateNote(editingId, editContent.trim())
    setEditingId(null)
    setEditContent('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddNote()
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
      setIsAddingNote(false)
    }
  }

  return (
    <div className="widget-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sticky Notes</h2>
        <button
          onClick={() => setIsAddingNote(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Add new note"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAddingNote && (
        <div className="mb-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your note..."
            className="w-full p-2 bg-transparent border-none outline-none resize-none text-sm"
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedColor === color 
                      ? 'border-primary-500' 
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className="btn-primary text-xs disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {notes.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            No notes yet. Click + to add one!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg relative group"
              style={{ backgroundColor: note.color }}
            >
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full p-1 bg-transparent border-none outline-none resize-none text-sm"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 rounded hover:bg-white/50"
                      aria-label="Save edit"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 rounded hover:bg-white/50"
                      aria-label="Cancel edit"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleStartEdit(note.id, note.content)}
                      className="p-1 rounded hover:bg-white/50"
                      aria-label="Edit note"
                    >
                      <Edit2 className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded hover:bg-white/50"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
