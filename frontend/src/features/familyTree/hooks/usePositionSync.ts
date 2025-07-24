import { useCallback, useEffect, useRef, useState } from 'react';
import { Node } from 'reactflow';
import draftApi from 'services/api/draftApi';

export function usePositionSync(
  nodes: Node[],
  activeDraftId: number | null,
  editMode: boolean
) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSavedPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const autoSaveIntervalRef = useRef<number | null>(null);

  // Check if positions have changed
  const checkForChanges = useCallback(() => {
    if (!activeDraftId || !editMode) {
      setHasUnsavedChanges(false);
      return false;
    }

    const currentPositions = new Map<string, { x: number; y: number }>();
    nodes.forEach(node => {
      currentPositions.set(node.id, { x: node.position.x, y: node.position.y });
    });

    // Compare with last saved positions
    if (currentPositions.size !== lastSavedPositionsRef.current.size) {
      setHasUnsavedChanges(true);
      return true;
    }

    for (const [nodeId, position] of currentPositions) {
      const lastSaved = lastSavedPositionsRef.current.get(nodeId);
      if (!lastSaved || lastSaved.x !== position.x || lastSaved.y !== position.y) {
        setHasUnsavedChanges(true);
        return true;
      }
    }

    setHasUnsavedChanges(false);
    return false;
  }, [nodes, activeDraftId, editMode]);

  // Save positions to backend
  const savePositions = useCallback(async () => {
    if (!activeDraftId || !editMode || !hasUnsavedChanges) return;

    setIsSyncing(true);
    try {
      const marriages = nodes
        .filter(n => n.type === 'marriage')
        .map(n => {
          const id = n.id.startsWith('m-') ? parseInt(n.id.substring(2)) : parseInt(n.id);
          return { id, x: n.position.x, y: n.position.y };
        })
        .filter(n => !isNaN(n.id));
      
      const persons = nodes
        .filter(n => n.type === 'person')
        .map(n => {
          const id = n.id.startsWith('p-') ? parseInt(n.id.substring(2)) : parseInt(n.id);
          return { id, x: n.position.x, y: n.position.y };
        })
        .filter(n => !isNaN(n.id));

      if (marriages.length === 0 && persons.length === 0) return;

      await draftApi.updateDraftPositions(activeDraftId, marriages, persons);

      // Update last saved positions
      const newSavedPositions = new Map<string, { x: number; y: number }>();
      nodes.forEach(node => {
        newSavedPositions.set(node.id, { x: node.position.x, y: node.position.y });
      });
      lastSavedPositionsRef.current = newSavedPositions;
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save positions:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [nodes, activeDraftId, editMode, hasUnsavedChanges]);

  // Auto-save every 20 seconds if there are changes
  useEffect(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    if (activeDraftId && editMode) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (hasUnsavedChanges && !isSyncing) {
          savePositions().catch(console.error);
        }
      }, 20000); // 20 seconds
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [activeDraftId, editMode, hasUnsavedChanges, isSyncing, savePositions]);

  // Check for changes when nodes change
  useEffect(() => {
    checkForChanges();
  }, [checkForChanges]);

  // Initialize saved positions when draft changes
  useEffect(() => {
    if (activeDraftId && editMode) {
      const initialPositions = new Map<string, { x: number; y: number }>();
      nodes.forEach(node => {
        initialPositions.set(node.id, { x: node.position.x, y: node.position.y });
      });
      lastSavedPositionsRef.current = initialPositions;
      setHasUnsavedChanges(false);
    } else {
      lastSavedPositionsRef.current.clear();
      setHasUnsavedChanges(false);
    }
  }, [activeDraftId, editMode, nodes.length]);

  return {
    hasUnsavedChanges,
    isSyncing,
    savePositions
  };
} 