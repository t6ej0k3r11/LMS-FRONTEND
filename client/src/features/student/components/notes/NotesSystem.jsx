import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Tag, Download, Edit, Trash2, StickyNote, Calendar, BookOpen } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function NotesSystem({ courseId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(courseId || 'all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    courseId: courseId || ''
  });
  const [tagInput, setTagInput] = useState('');

  const { get, post, put, delete: deleteApi } = useApi();
  const { courses } = useStudentContext();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (courseId) params.append('courseId', courseId);

        const response = await get(`/student/notes?${params}`);
        if (response.success) {
          setNotes(response.data);
        } else {
          // Mock data for development
          const mockNotes = [
            {
              _id: '1',
              title: 'React Hooks Summary',
              content: 'useState: Manages local state\nuseEffect: Side effects\nuseContext: Context consumption\nuseReducer: Complex state logic\nuseMemo: Memoization\nuseCallback: Callback memoization',
              tags: ['react', 'hooks', 'javascript'],
              courseId: 'course123',
              courseTitle: 'React Development',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: '2',
              title: 'JavaScript Array Methods',
              content: 'map(): Transform array elements\nfilter(): Filter elements\nreduce(): Accumulate values\nfind(): Find first match\nsome(): Test condition\nevery(): Test all elements\nforEach(): Iterate without return',
              tags: ['javascript', 'arrays', 'methods'],
              courseId: 'course456',
              courseTitle: 'JavaScript Fundamentals',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: '3',
              title: 'CSS Flexbox Cheat Sheet',
              content: 'display: flex;\njustify-content: center/space-between/space-around;\nalign-items: center/stretch/flex-start;\nflex-direction: row/column;\nflex-wrap: wrap/nowrap;\nflex: 1 (grow/shrink/basis);',
              tags: ['css', 'flexbox', 'layout'],
              courseId: 'course123',
              courseTitle: 'React Development',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          setNotes(mockNotes);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [courseId, get]);

  const handleCreateNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      const noteData = {
        ...formData,
        courseId: formData.courseId || courseId
      };

      const response = await post('/student/notes', noteData);
      if (response.success) {
        setNotes(prev => [response.data, ...prev]);
        resetForm();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !formData.title.trim() || !formData.content.trim()) return;

    try {
      const response = await put(`/student/notes/${editingNote._id}`, formData);
      if (response.success) {
        setNotes(prev => prev.map(note =>
          note._id === editingNote._id ? response.data : note
        ));
        resetForm();
        setEditingNote(null);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteApi(`/student/notes/${noteId}`);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags,
      courseId: note.courseId
    });
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      courseId: courseId || ''
    });
    setTagInput('');
    setEditingNote(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const exportNotes = () => {
    const exportData = filteredNotes.map(note => ({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      course: note.courseTitle,
      created: new Date(note.createdAt).toLocaleDateString(),
      updated: new Date(note.updatedAt).toLocaleDateString()
    }));

    const textContent = exportData.map(note =>
      `Title: ${note.title}\nContent:\n${note.content}\nTags: ${note.tags}\nCourse: ${note.course}\nCreated: ${note.created}\nUpdated: ${note.updated}\n\n---\n\n`
    ).join('');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-export-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = !searchTerm ||
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
      const matchesCourse = selectedCourse === 'all' || note.courseId === selectedCourse;

      return matchesSearch && matchesTag && matchesCourse;
    });
  }, [notes, searchTerm, selectedTag, selectedCourse]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Notes</h2>
          <p className="text-gray-600">Create, organize, and manage your study notes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportNotes} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your notes..."
                    rows={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button onClick={addTag} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {!courseId && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Course</label>
                    <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingNote ? handleUpdateNote : handleCreateNote}>
                    {editingNote ? 'Update' : 'Create'} Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!courseId && (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedTag !== 'all' || selectedCourse !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start creating notes to organize your learning!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.updatedAt)}
                  </span>
                  {!courseId && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {note.courseTitle}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm line-clamp-4 mb-3 whitespace-pre-wrap">
                  {note.content}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

NotesSystem.propTypes = {
  courseId: PropTypes.string,
};

export default NotesSystem;