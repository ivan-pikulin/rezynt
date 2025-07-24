import React, { memo, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTheme } from '@mui/material/styles';
import { MARRIAGE_NODE_WIDTH, MARRIAGE_NODE_HEIGHT } from '../../constants/nodeSizes';
import './TreeNodes.css';

interface MarriageNodeData {
  label: string;
}

interface MarriageNodeProps {
  data: MarriageNodeData;
  selected: boolean;
}

export const MarriageNode = memo(({ data, selected }: MarriageNodeProps) => {
  const theme = useTheme();

  const nodeStyles = useMemo(() => ({
    borderStyle: 'solid',
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? theme.palette.marriage.active : theme.palette.marriage.border,
    bgcolor: theme.palette.marriage.background,
    color: theme.palette.marriage.text,
    width: MARRIAGE_NODE_WIDTH,
    height: MARRIAGE_NODE_HEIGHT,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4]
    }
  }), [selected, theme]);

  return (
    <Box
      className={`marriage-node ${selected ? 'marriage-node--selected' : ''}`}
      sx={nodeStyles}
      aria-label={data.label}
    >
      <Handle type="target" position={Position.Top} className="handle" />
      <FavoriteIcon fontSize="large" />
      <Handle type="source" position={Position.Bottom} className="handle" />
    </Box>
  );
}); 