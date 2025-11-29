import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save, Edit3, Trash2, Plus, Search } from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "@/hooks/use-toast";

function NotesSystem({ lectureId, lectureTitle }) {
  NotesSystem.propTypes = {
    lectureId: PropTypes.string,
    lectureTitle: PropTypes.string
  };

  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load notes from localStorage (in real app, this would be from API)
  useEffect(() => {
    if (lectureId) {
      const savedNotes = localStorage.getItem(`notes_${lectureId}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }
  }, [lectureId]);

  // Save notes to localStorage
  const saveNotesToStorage = (updatedNotes) => {
    if (lectureId) {
      localStorage.setItem(`notes_${lectureId}`, JSON.stringify(updatedNotes));
    }
  };

  const handleSaveNote = () => {
    if (!currentNote.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      content: currentNote,
      timestamp: new Date().toISOString(),
      lectureTitle: lectureTitle || "Current Lecture"
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setCurrentNote("");
    setIsAddingNote(false);

    toast({
      title: "Note saved!",
      description: "Your note has been saved successfully.",
    });
  };

  const handleUpdateNote = (noteId) => {
    if (!currentNote.trim()) return;

    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, content: currentNote, timestamp: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setCurrentNote("");
    setEditingNoteId(null);

    toast({
      title: "Note updated!",
      description: "Your note has been updated successfully.",
    });
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);

    toast({
      title: "Note deleted",
      description: "Your note has been deleted.",
    });
  };

  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setCurrentNote(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setCurrentNote("");
    setIsAddingNote(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter(note =>
      note.content.toLowerCase().includes(query) ||
      note.lectureTitle.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Notes</h3>
        <Button
          onClick={() => setIsAddingNote(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Search Input */}
      {notes.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Add/Edit Note Form */}
      {(isAddingNote || editingNoteId) && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-800">
              {editingNoteId ? "Edit Note" : "Add New Note"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-24 border-green-300 focus:border-green-500 focus:ring-green-500"
            />
            <div className="flex space-x-2">
              <Button
                onClick={editingNoteId ? () => handleUpdateNote(editingNoteId) : handleSaveNote}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingNoteId ? "Update" : "Save"} Note
              </Button>
              <Button
                onClick={cancelEditing}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-sm">Add your first note to remember important points from this lecture.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No matching notes</p>
            <p className="text-sm">Try adjusting your search query.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      {note.lectureTitle} • {formatTimestamp(note.timestamp)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startEditing(note)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Notes Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Notes Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Take notes on key concepts and important formulas</li>
            <li>• Note down questions you want to ask the instructor</li>
            <li>• Summarize complex topics in your own words</li>
            <li>• Your notes are saved locally and persist across sessions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotesSystem;