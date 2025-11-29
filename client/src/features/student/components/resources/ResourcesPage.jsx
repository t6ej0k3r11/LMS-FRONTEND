import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, FileText, Image, Video, Archive, BookOpen, Calendar, User } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function ResourcesPage({ courseId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(courseId || 'all');
  const [downloading, setDownloading] = useState(null);
  const { get } = useApi();
  const { courses } = useStudentContext();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (courseId) params.append('courseId', courseId);

        const response = await get(`/student/resources?${params}`);
        if (response.success) {
          setResources(response.data);
        } else {
          // Mock data for development
          const mockResources = [
            {
              _id: '1',
              title: 'React Components Guide',
              description: 'Comprehensive guide to building reusable React components',
              type: 'document',
              fileName: 'react-components-guide.pdf',
              fileSize: 2457600, // 2.4MB
              mimeType: 'application/pdf',
              courseId: 'course123',
              courseTitle: 'React Development',
              uploadedBy: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              downloadCount: 45,
              tags: ['react', 'components', 'guide']
            },
            {
              _id: '2',
              title: 'JavaScript Fundamentals Cheat Sheet',
              description: 'Quick reference for JavaScript basics',
              type: 'document',
              fileName: 'js-cheat-sheet.pdf',
              fileSize: 512000, // 512KB
              mimeType: 'application/pdf',
              courseId: 'course456',
              courseTitle: 'JavaScript Fundamentals',
              uploadedBy: {
                _id: 'instructor2',
                userName: 'Mike Chen',
                role: 'instructor'
              },
              uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              downloadCount: 128,
              tags: ['javascript', 'cheat-sheet', 'basics']
            },
            {
              _id: '3',
              title: 'Project Starter Template',
              description: 'Complete project template with folder structure and configuration',
              type: 'archive',
              fileName: 'project-template.zip',
              fileSize: 15728640, // 15MB
              mimeType: 'application/zip',
              courseId: 'course123',
              courseTitle: 'React Development',
              uploadedBy: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              downloadCount: 23,
              tags: ['template', 'project', 'starter']
            },
            {
              _id: '4',
              title: 'Component Architecture Diagram',
              description: 'Visual diagram showing component relationships and data flow',
              type: 'image',
              fileName: 'component-architecture.png',
              fileSize: 1048576, // 1MB
              mimeType: 'image/png',
              courseId: 'course123',
              courseTitle: 'React Development',
              uploadedBy: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              downloadCount: 67,
              tags: ['diagram', 'architecture', 'components']
            }
          ];
          setResources(mockResources);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [courseId, get]);

  const handleDownload = async (resource) => {
    try {
      setDownloading(resource._id);
      // In a real implementation, this would call the download API
      // For now, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a mock download link
      const link = document.createElement('a');
      link.href = '#'; // In real implementation, this would be the actual file URL
      link.download = resource.fileName;
      link.click();

      // Update download count locally
      setResources(prev => prev.map(r =>
        r._id === resource._id
          ? { ...r, downloadCount: r.downloadCount + 1 }
          : r
      ));

    } catch (error) {
      console.error('Error downloading resource:', error);
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'archive':
        return <Archive className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'archive':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and search resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = !searchTerm ||
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesCourse = selectedCourse === 'all' || resource.courseId === selectedCourse;

      return matchesSearch && matchesType && matchesCourse;
    });
  }, [resources, searchTerm, selectedType, selectedCourse]);

  const resourceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'archive', label: 'Archives' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
          <h2 className="text-2xl font-bold">Course Resources</h2>
          <p className="text-gray-600">Download materials, guides, and additional resources</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
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
                {resourceTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' || selectedCourse !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No resources are available yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <Card key={resource._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                    {getFileIcon(resource.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                      </div>
                      <Button
                        onClick={() => handleDownload(resource)}
                        disabled={downloading === resource._id}
                        className="ml-4"
                      >
                        {downloading === resource._id ? (
                          'Downloading...'
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {resource.uploadedBy?.userName || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(resource.uploadedAt)}
                      </span>
                      <span>{formatFileSize(resource.fileSize)}</span>
                      <span>{resource.downloadCount} downloads</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                      {!courseId && (
                        <Badge variant="outline">
                          {resource.courseTitle}
                        </Badge>
                      )}
                    </div>

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
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

ResourcesPage.propTypes = {
  courseId: PropTypes.string,
};

export default ResourcesPage;