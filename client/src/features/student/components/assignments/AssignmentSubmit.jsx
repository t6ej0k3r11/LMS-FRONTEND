import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useFileValidator } from '@/hooks/useFileValidator';
import { useApi } from '../../hooks/useApi';
import PropTypes from 'prop-types';

function AssignmentSubmit({ assignment, courseId, onSubmit, onCancel }) {
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const { validateFiles } = useFileValidator();
  const { post } = useApi();

  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.jpg', '.jpeg', '.png'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxFiles = 5;

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validation = validateFiles(selectedFiles, {
      allowedTypes,
      maxFileSize,
      maxFiles: maxFiles - files.length
    });

    if (validation.isValid) {
      setFiles(prev => [...prev, ...selectedFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        progress: 0,
        error: null
      }))]);
    } else {
      // Show validation errors
      validation.errors.forEach(error => {
        console.error('File validation error:', error);
      });
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to submit.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('assignmentId', assignment._id);
      formData.append('courseId', courseId);
      formData.append('comment', comment);

      files.forEach(({ file }) => {
        formData.append('files', file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual API endpoint when backend is ready
      const response = await post(`/student/assignments/${assignment._id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        onSubmit(response.data);
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Submit Assignment: {assignment.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Assignment Details</h3>
          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
          <div className="text-sm text-gray-500">
            Due: {new Date(assignment.dueDate).toLocaleDateString()} • {assignment.maxPoints} points
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Comments (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any comments or notes about your submission..."
            rows={3}
            disabled={uploading}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Files ({files.length}/{maxFiles})
          </label>

          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || files.length >= maxFiles}
            />

            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || files.length >= maxFiles}
                >
                  Choose Files
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Supported formats: {allowedTypes.join(', ')}
                <br />
                Maximum file size: {formatFileSize(maxFileSize)} per file
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map(({ file, id, error }) => (
                <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {error ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">{error}</span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(id)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || files.length === 0}
            className="btn-primary"
          >
            {uploading ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

AssignmentSubmit.propTypes = {
  assignment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    dueDate: PropTypes.string,
    maxPoints: PropTypes.number,
  }).isRequired,
  courseId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AssignmentSubmit;