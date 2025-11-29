import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bookmark, BookmarkCheck, Search, ExternalLink, Play, FileText, BookOpen, Trash2, Folder } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useStudentContext } from '../../hooks/useStudentContext';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const { get, delete: deleteApi } = useApi();
  const { courses } = useStudentContext();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const response = await get('/student/bookmarks');
        if (response.success) {
          setBookmarks(response.data);
        } else {
          // Mock data for development
          const mockBookmarks = [
            {
              _id: '1',
              itemType: 'lecture',
              itemId: 'lecture123',
              title: 'Introduction to React Hooks',
              description: 'Learn the fundamentals of React Hooks and state management',
              courseId: 'course123',
              courseTitle: 'React Development',
              metadata: {
                duration: '15:30',
                lectureNumber: 5
              },
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              tags: ['important', 'review']
            },
            {
              _id: '2',
              itemType: 'resource',
              itemId: 'resource456',
              title: 'React Documentation',
              description: 'Official React documentation and API reference',
              courseId: 'course123',
              courseTitle: 'React Development',
              metadata: {
                url: 'https://react.dev',
                type: 'external'
              },
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              tags: ['reference', 'documentation']
            },
            {
              _id: '3',
              itemType: 'course',
              itemId: 'course456',
              title: 'JavaScript Fundamentals',
              description: 'Master the basics of JavaScript programming',
              courseId: 'course456',
              courseTitle: 'JavaScript Fundamentals',
              metadata: {
                progress: 75,
                totalLectures: 25
              },
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              tags: ['foundation', 'programming']
            },
            {
              _id: '4',
              itemType: 'note',
              itemId: 'note789',
              title: 'CSS Flexbox Cheat Sheet',
              description: 'Quick reference for CSS Flexbox properties',
              courseId: 'course123',
              courseTitle: 'React Development',
              metadata: {
                wordCount: 150
              },
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              tags: ['css', 'flexbox', 'reference']
            }
          ];
          setBookmarks(mockBookmarks);
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [get]);

  const removeBookmark = async (bookmarkId) => {
    try {
      await deleteApi(`/student/bookmarks/${bookmarkId}`);
      setBookmarks(prev => prev.filter(bookmark => bookmark._id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const getBookmarkIcon = (type) => {
    switch (type) {
      case 'lecture':
        return <Play className="h-4 w-4" />;
      case 'resource':
        return <FileText className="h-4 w-4" />;
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'note':
        return <Bookmark className="h-4 w-4" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800';
      case 'resource':
        return 'bg-green-100 text-green-800';
      case 'course':
        return 'bg-purple-100 text-purple-800';
      case 'note':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookmarkAction = (bookmark) => {
    // Navigate to the bookmarked item
    switch (bookmark.itemType) {
      case 'lecture':
        // Navigate to course progress with specific lecture
        window.location.href = `/course-progress/${bookmark.courseId}?lecture=${bookmark.itemId}`;
        break;
      case 'resource':
        if (bookmark.metadata?.url) {
          window.open(bookmark.metadata.url, '_blank');
        } else {
          // Navigate to resources page
          window.location.href = `/student/resources?course=${bookmark.courseId}`;
        }
        break;
      case 'course':
        window.location.href = `/course-progress/${bookmark.itemId}`;
        break;
      case 'note':
        // Navigate to notes page
        window.location.href = `/student/notes?course=${bookmark.courseId}`;
        break;
      default:
        break;
    }
  };

  // Filter and search bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      const matchesSearch = !searchTerm ||
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || bookmark.itemType === selectedType;
      const matchesCourse = selectedCourse === 'all' || bookmark.courseId === selectedCourse;

      return matchesSearch && matchesType && matchesCourse;
    });
  }, [bookmarks, searchTerm, selectedType, selectedCourse]);

  const bookmarkTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'course', label: 'Courses' },
    { value: 'lecture', label: 'Lectures' },
    { value: 'resource', label: 'Resources' },
    { value: 'note', label: 'Notes' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
          <h2 className="text-2xl font-bold">My Bookmarks</h2>
          <p className="text-gray-600">Quick access to your saved items</p>
        </div>
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">{bookmarks.length} bookmarks</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {bookmarkTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        </CardContent>
      </Card>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' || selectedCourse !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start bookmarking important items to access them quickly!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(bookmark.itemType)}`}>
                    {getBookmarkIcon(bookmark.itemType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{bookmark.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{bookmark.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {bookmark.courseTitle}
                          </span>
                          <span>Bookmarked {formatDate(bookmark.createdAt)}</span>
                          {bookmark.metadata?.duration && (
                            <span>{bookmark.metadata.duration}</span>
                          )}
                          {bookmark.metadata?.progress && (
                            <span>{bookmark.metadata.progress}% complete</span>
                          )}
                        </div>

                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {bookmark.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBookmarkAction(bookmark)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBookmark(bookmark._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookmarks;