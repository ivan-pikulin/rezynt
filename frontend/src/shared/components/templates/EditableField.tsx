import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box, IconButton } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { EditableFieldProps } from './types';

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  fieldPath,
  isEditing,
  onStartEdit,
  onEndEdit,
  onValueChange,
  placeholder,
  multiline = false,
  className,
  style
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isCurrentlyEditing = isEditing || isLocalEditing;

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isCurrentlyEditing) {
      const ref = multiline ? textareaRef.current : inputRef.current;
      if (ref) {
        ref.focus();
        // select() работает только для input элементов, для textarea используем setSelectionRange
        if (multiline && textareaRef.current) {
          textareaRef.current.setSelectionRange(0, textareaRef.current.value.length);
        } else if (inputRef.current) {
          inputRef.current.select();
        }
      }
    }
  }, [isCurrentlyEditing, multiline]);

  const handleStartEdit = () => {
    setIsLocalEditing(true);
    onStartEdit(fieldPath);
  };

  const handleSave = () => {
    if (editValue !== value) {
      onValueChange(fieldPath, editValue);
    }
    setIsLocalEditing(false);
    onEndEdit(fieldPath);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsLocalEditing(false);
    onEndEdit(fieldPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isCurrentlyEditing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 0.5,
        position: 'relative',
        zIndex: 1000
      }}>
        <TextField
          ref={multiline ? textareaRef : inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline={multiline}
          rows={multiline ? 3 : 1}
          variant="outlined"
          size="small"
          placeholder={placeholder}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }
            }
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleSave}
            color="primary"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCancel}
            color="error"
            sx={{ 
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        cursor: 'pointer',
        p: 0.5,
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          '& .edit-icon': {
            opacity: 1
          }
        }
      }}
      onClick={handleStartEdit}
      className={className}
      style={style}
    >
      <Box sx={{ flex: 1, color: 'inherit' }}>
        {value || placeholder || 'Click to edit'}
      </Box>
      <IconButton
        size="small"
        className="edit-icon"
        sx={{ 
          opacity: 0,
          transition: 'opacity 0.2s',
          '&:hover': { opacity: 1 }
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default EditableField;
