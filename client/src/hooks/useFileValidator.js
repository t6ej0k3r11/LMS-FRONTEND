// Reusable file validation hook for LMS frontend
// Implements client-side validation matching backend rules

import { useState, useCallback } from 'react';

const FILE_TYPES = {
  IMAGE: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    name: 'image'
  },
  VIDEO: {
    allowedTypes: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    maxSize: 500 * 1024 * 1024, // 500MB
    name: 'video'
  },
  DOCUMENT: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    name: 'document'
  },
  ZIP: {
    allowedTypes: ['application/zip', 'application/x-zip-compressed'],
    maxSize: 50 * 1024 * 1024, // 50MB
    name: 'zip'
  }
};

const useFileValidator = (options = {}) => {
  const {
    allowedTypes = ['image'], // Default to images
    maxSizeMB = null, // If not provided, use type defaults
    multiple = false
  } = options;

  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);

  // Get file type config
  const getFileTypeConfig = (fileType) => {
    return FILE_TYPES[fileType.toUpperCase()] || null;
  };

  // Validate single file
  const validateFile = useCallback((file) => {
    const fileErrors = [];

    // Check if file exists
    if (!file) {
      fileErrors.push('No file selected');
      return { valid: false, errors: fileErrors };
    }

    // Determine file type from mimetype
    let typeConfig = null;
    for (const type of allowedTypes) {
      const config = getFileTypeConfig(type);
      if (config && config.allowedTypes.includes(file.type)) {
        typeConfig = config;
        break;
      }
    }

    if (!typeConfig) {
      const allowedTypeNames = allowedTypes.map(type => {
        const config = getFileTypeConfig(type);
        return config ? config.name : type;
      });
      fileErrors.push(`Invalid file type. Allowed: ${allowedTypeNames.join(', ')}`);
      return { valid: false, errors: fileErrors };
    }

    // Check file size
    const maxSize = maxSizeMB ? maxSizeMB * 1024 * 1024 : typeConfig.maxSize;
    if (file.size > maxSize) {
      const maxSizeMBFormatted = (maxSize / (1024 * 1024)).toFixed(0);
      fileErrors.push(`File too large. Max allowed size for ${typeConfig.name} is ${maxSizeMBFormatted} MB.`);
    }

    return {
      valid: fileErrors.length === 0,
      errors: fileErrors,
      type: typeConfig.name
    };
  }, [allowedTypes, maxSizeMB]);

  // Validate multiple files
  const validateFiles = useCallback((files) => {
    if (!files || files.length === 0) {
      setErrors(['No files selected']);
      setIsValid(false);
      return { valid: false, errors: ['No files selected'] };
    }

    const allErrors = [];
    const validFiles = [];
    const fileDetails = [];

    Array.from(files).forEach((file, index) => {
      const result = validateFile(file);
      if (!result.valid) {
        allErrors.push(`File ${index + 1} (${file.name}): ${result.errors.join(', ')}`);
      } else {
        validFiles.push(file);
        fileDetails.push({
          file,
          type: result.type,
          size: file.size,
          sizeMB: (file.size / (1024 * 1024)).toFixed(2)
        });
      }
    });

    setErrors(allErrors);
    setIsValid(allErrors.length === 0);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      validFiles,
      fileDetails
    };
  }, [validateFile]);

  // Validate single file (for single file inputs)
  const validateSingleFile = useCallback((file) => {
    const result = validateFile(file);
    setErrors(result.errors);
    setIsValid(result.valid);
    return result;
  }, [validateFile]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsValid(true);
  }, []);

  // Get accepted file types for input accept attribute
  const getAcceptedTypes = useCallback(() => {
    const types = [];
    allowedTypes.forEach(type => {
      const config = getFileTypeConfig(type);
      if (config) {
        types.push(...config.allowedTypes);
      }
    });
    return types.join(',');
  }, [allowedTypes]);

  // Get max file size in MB
  const getMaxSizeMB = useCallback(() => {
    if (maxSizeMB) return maxSizeMB;

    // Find the maximum size among allowed types
    let maxSize = 0;
    allowedTypes.forEach(type => {
      const config = getFileTypeConfig(type);
      if (config && config.maxSize > maxSize) {
        maxSize = config.maxSize;
      }
    });
    return maxSize / (1024 * 1024);
  }, [allowedTypes, maxSizeMB]);

  return {
    validateFile: multiple ? validateFiles : validateSingleFile,
    errors,
    isValid,
    clearErrors,
    getAcceptedTypes,
    getMaxSizeMB,
    FILE_TYPES
  };
};

export default useFileValidator;