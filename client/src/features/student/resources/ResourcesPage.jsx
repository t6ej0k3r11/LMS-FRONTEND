import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Download, Search, FileText, Video, Image, File } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useStudentToast } from '../components/ToastProvider';
import PropTypes from 'prop-types';

export const ResourcesPage = ({ courseId = null }) => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const { getResources } = useApi();
  const { showError, showSuccess } = useStudentToast();

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedType]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await getResources(courseId);
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      showError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  };

  const handleDownload = async (resource) => {
    try {
      // TODO: Implement actual download logic
      showSuccess(`Downloading ${resource.title}`);
    } catch (error) {
      showError('Download failed');
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const getFileSize = (size) => {
    if (!size) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const resourceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDFs' },
    { value: 'video', label: 'Videos' },
    { value: 'image', label: 'Images' },
    { value: 'document', label: 'Documents' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {resourceTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resources Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No resources are available yet.'}
            </p>
          </Card>
        ) : (
          filteredResources.map((resource) => (
            <Card key={resource._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getFileIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {resource.type.toUpperCase()}
                      </Badge>
                      {resource.size && (
                        <span className="text-xs text-gray-500">
                          {getFileSize(resource.size)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(resource.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleDownload(resource)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

ResourcesPage.propTypes = {
  courseId: PropTypes.string,
};