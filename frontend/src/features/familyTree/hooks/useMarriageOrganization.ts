import { useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { PERSON_NODE_WIDTH } from '../constants/nodeSizes';
import { getMarriageSpouses } from './familyTreeFunctions';
import { useTreeData } from './useTreeData';

// Helper function to get spouse positions relative to marriage node
const getSpousePositions = () => ({
  left: { x: - PERSON_NODE_WIDTH / 2, y: 0 },
  right: { x: PERSON_NODE_WIDTH / 2, y: 0 },
});

export const useMarriageOrganization = (editMode: boolean, activeDraftId: number | null) => {
  const { getNodes, getEdges } = useReactFlow();
  const { setData } = useTreeData();

  const swapSpousePositions = useCallback(async (marriageNodeId: string) => {
    // Only proceed if in edit mode and draft is selected
    if (!editMode || !activeDraftId) return;

    const nodes = getNodes();
    const edges = getEdges();
    
    const marriageNode = nodes.find(n => n.id === marriageNodeId);
    if (!marriageNode) return;

    const spouses = getMarriageSpouses(marriageNode.id, edges, nodes);
    if (spouses.length !== 2) return;

    // Swap positions of spouses
    const updatedNodes = nodes.map(node => {
      if (node.id === spouses[0].id) {
        return {
          ...node,
          position: spouses[1].position
        };
      }
      if (node.id === spouses[1].id) {
        return {
          ...node,
          position: spouses[0].position
        };
      }
      return node;
    });

    // Update tree data with new positions (saving is handled by usePositionSync)
    setData({
      nodes: updatedNodes,
      edges: edges
    });

    return updatedNodes;
  }, [getNodes, getEdges, setData, editMode, activeDraftId]);

  const organizeMarriage = useCallback(async (marriageNodeId: string) => {
    // Only proceed if in edit mode and draft is selected
    if (!editMode || !activeDraftId) return;

    const nodes = getNodes();
    const edges = getEdges();
    
    const marriageNode = nodes.find(n => n.id === marriageNodeId);
    if (!marriageNode) return;

    const spouses = getMarriageSpouses(marriageNode.id, edges, nodes);
    if (spouses.length !== 2) return;

    const positions = getSpousePositions();

    // Calculate new positions
    const updatedNodes = nodes.map(node => {
      if (node.id === spouses[0].id) {
        return {
          ...node,
          position: {
            x: marriageNode.position.x + positions.left.x,
            y: marriageNode.position.y + positions.left.y
          }
        };
      }
      if (node.id === spouses[1].id) {
        return {
          ...node,
          position: {
            x: marriageNode.position.x + positions.right.x,
            y: marriageNode.position.y + positions.right.y
          }
        };
      }
      return node;
    });

    // Update tree data with new positions (saving is handled by usePositionSync)
    setData({
      nodes: updatedNodes,
      edges: edges
    });

    return updatedNodes;
  }, [getNodes, getEdges, setData, editMode, activeDraftId]);

  return { organizeMarriage, swapSpousePositions };
}; 