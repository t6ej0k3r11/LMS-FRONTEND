import { useState, useCallback } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Upload, X, FileText } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useStudentToast } from '../components/ToastProvider';
import PropTypes from 'prop-types';

export const AssignmentSubmit = ({ assignment, onSubmit, onCancel }) => {
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { submitAssignment } = useApi();
  const { showSuccess, showError } = useStudentToast();

  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (file.size > maxSize) {
      return `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File type not allowed. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF`;
    }

    return null;
  }, []);

  const handleFileSelect = useCallback((selectedFiles) => {
    const validFiles = [];
    const errors = [];

    Array.from(selectedFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      showError('File Validation Error', errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [validateFile, showError]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    if (files.length === 0) {
      showError('No files selected', 'Please select at least one file to submit.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      if (comments.trim()) {
        formData.append('comments', comments.trim());
      }

      const result = await submitAssignment(assignment._id, formData);

      showSuccess('Assignment Submitted', 'Your assignment has been submitted successfully!');
      onSubmit?.(result);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showError('Submission Failed', 'Failed to submit assignment. Please try again.');
    } finally {
      setUploading(false);
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
    <Card className="p-6">
      <div className="space-y-6">
        {/* Assignment Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {assignment.title}
          </h3>
          <p className="text-gray-600 text-sm">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-600">
              Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB each)
            </p>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="mt-4" asChild>
              <span>Choose Files</span>
            </Button>
          </label>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Selected Files:</h4>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any comments or notes about your submission..."
            rows={3}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

AssignmentSubmit.propTypes = {
  assignment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};