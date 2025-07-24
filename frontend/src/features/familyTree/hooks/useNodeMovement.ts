import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { getMarriageChildren, getMarriageSpouses, getAllDescendants } from './familyTreeFunctions';

export function useNodeMovement(
  nodes: Node[], 
  edges: Edge[], 
  setNodes: (nodes: Node[]) => void,
  activeDraftId: number | null,
  editMode: boolean
) {
  // Helper to check if a person is married
  const isPersonMarried = useCallback((personId: string) => {
    return edges.some(e => e.source === personId && nodes.find(n => n.id === e.target)?.type === 'marriage');
  }, [edges, nodes]);

  // Note: Position saving is now handled by usePositionSync hook

  // Main movement handler
  const handleNodeDrag = useCallback((event: any, node: Node) => {
    if (!node || !node.id || !node.position) return;
    if (!activeDraftId || !editMode) return;

    const nodeType = node.type;
    const isShiftPressed = event.shiftKey;
    let newNodes = [...nodes];

    if (nodeType === 'marriage') {
      const marriageId = node.id;
      const spouses = getMarriageSpouses(marriageId, edges, nodes);
      
      const oldNode = nodes.find(n => n.id === node.id);
      if (!oldNode) return;
      const dx = node.position.x - oldNode.position.x;
      const dy = node.position.y - oldNode.position.y;
      
      let nodesToMove: Node[] = [];
      
      if (isShiftPressed) {
        // Shift+drag: move marriage, spouses, and ALL descendants
        const descendants = getAllDescendants(marriageId, edges, nodes);
        nodesToMove = [node, ...spouses, ...descendants];
      } else {
        // Normal drag: move marriage, spouses, and only non-married children
        const children = getMarriageChildren(marriageId, edges, nodes);
        const unmarriedChildren = children.filter(child => !isPersonMarried(child.id));
        nodesToMove = [node, ...spouses, ...unmarriedChildren];
      }
      
      // Move all selected nodes
      newNodes = newNodes.map(n => {
        if (n.id === node.id) {
          return { ...n, position: { x: node.position.x, y: node.position.y } };
        }
        if (nodesToMove.some(nodeToMove => nodeToMove.id === n.id && nodeToMove.id !== node.id)) {
          return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } };
        }
        return n;
      });
    } else if (nodeType === 'person') {
      // Only allow move if person is not married
      if (!isPersonMarried(node.id)) {
        newNodes = newNodes.map(n => {
          if (n.id === node.id) {
            return { ...n, position: { x: node.position.x, y: node.position.y } };
          }
          return n;
        });
      }
    }
    
    setNodes(newNodes);
  }, [nodes, edges, setNodes, isPersonMarried, activeDraftId, editMode]);

  // Helper to determine if a node is draggable
  const isNodeDraggable = useCallback((node: Node) => {
    // Node is only draggable if edit mode is on and a draft is selected
    if (!activeDraftId || !editMode) return false;
    
    // Apply existing draggability rules
    return node.type === 'marriage' || (node.type === 'person' && !isPersonMarried(node.id));
  }, [isPersonMarried, activeDraftId, editMode]);

  return { handleNodeDrag, isNodeDraggable };
} 