import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  File,
  Image,
  Video,
  Archive
} from "lucide-react";

function ResourcesBox() {

  const [isExpanded, setIsExpanded] = useState(false);

  // Mock resources data - in real implementation, this would come from the lecture data
  const resources = [
    {
      id: 1,
      title: "Lecture Slides",
      type: "pdf",
      size: "2.5 MB",
      url: "#"
    },
    {
      id: 2,
      title: "Code Examples",
      type: "zip",
      size: "1.2 MB",
      url: "#"
    },
    {
      id: 3,
      title: "Additional Reading",
      type: "pdf",
      size: "850 KB",
      url: "#"
    }
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-4 w-4 text-yellow-500" />;
      case 'jpg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'mp4':
      case 'avi':
        return <Video className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            Resources ({resources.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(resource.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {resource.title}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      {resource.type} • {resource.size}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => {
                      // Handle download
                      const link = document.createElement('a');
                      link.href = resource.url;
                      link.download = resource.title;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourcesBox;