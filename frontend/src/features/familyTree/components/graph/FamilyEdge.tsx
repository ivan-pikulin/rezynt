import React from 'react';
import { getBezierPath } from 'reactflow';
import { useTheme } from '@mui/material/styles';

interface MarriagePersonEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  markerEnd?: string;
}

export const MarriagePersonEdge: React.FC<MarriagePersonEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}) => {
  const theme = useTheme();
  const gradientId = `family-gradient-${id}`;
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Animation state for dash offset
  const [dashOffset, setDashOffset] = React.useState(0);
  React.useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setDashOffset((prev) => (prev - 0.3) % 40); // 40 is dash array length, even slower
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <>
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.palette.familyEdge.start} />
            <stop offset="50%" stopColor={theme.palette.familyEdge.middle} />
            <stop offset="100%" stopColor={theme.palette.familyEdge.end} />
          </linearGradient>
        </defs>
      </svg>
      <svg style={{ position: 'absolute', overflow: 'visible', pointerEvents: 'none' }}>
        <path
          d={edgePath}
          stroke={`url(#${gradientId})`}
          strokeWidth={2.1}
          fill="none"
          strokeDasharray="12 8"
          strokeDashoffset={dashOffset}
          style={{
            ...style,
            filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.2))',
          }}
        />
      </svg>
    </>
  );
};

export const PersonMarriageEdge: React.FC<MarriagePersonEdgeProps> = () => {
  return null;
}; 