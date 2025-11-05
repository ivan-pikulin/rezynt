import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import DiffMatchPatch from 'diff-match-patch';

interface Props {
  original: string;
  updated: string;
}

/**
 * Display inline diff between original and updated text
 * Removed parts are shown with strikethrough in red, added parts highlighted in green
 */
const DiffView: React.FC<Props> = ({ original, updated }) => {
  const diffParts = useMemo(() => {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(original, updated);
    dmp.diff_cleanupSemantic(diffs);
    return diffs;
  }, [original, updated]);

  return (
    <Box
      sx={{
        marginTop: '8px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        padding: '12px',
        fontSize: '12px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.6,
      }}
    >
      {diffParts.map((part, index) => {
        const [operation, text] = part;
        
        // -1 = deletion, 0 = no change, 1 = addition
        if (operation === -1) {
          // Removed text: strikethrough with red color and light red background
          return (
            <Box
              key={index}
              component="del"
              sx={{
                color: '#991b1b',
                backgroundColor: '#fef2f2',
                textDecoration: 'line-through',
                padding: '0 2px',
              }}
            >
              {text}
            </Box>
          );
        } else if (operation === 1) {
          // Added text: green color with light green background
          return (
            <Box
              key={index}
              component="ins"
              sx={{
                color: '#166534',
                backgroundColor: '#f0fdf4',
                textDecoration: 'none',
                padding: '0 2px',
              }}
            >
              {text}
            </Box>
          );
        } else {
          // Unchanged text
          return (
            <Box key={index} component="span" sx={{ color: '#374151' }}>
              {text}
            </Box>
          );
        }
      })}
    </Box>
  );
};

export default DiffView;

