import { useCallback } from 'react';
import { Edge, Node, useReactFlow } from 'reactflow';
import { treeApi } from 'services/api';
import { useFetch } from 'shared/hooks/useFetch';
import { FamilyTree, TreeEdge, TreeNode } from 'shared/types/tree';
import { Person } from 'shared/types/person';
import { Marriage } from 'shared/types/marriage';
import { normalizeTreeData } from '../utils/normalizeTreeData';

interface TreeData {
  nodes: Node[];
  edges: Edge[];
}

export function useTreeData() {
  const { data: treeData, setData } = useFetch<TreeData>();
  const reactFlowInstance = useReactFlow();
  
  const transformNodes = useCallback((nodes: TreeNode[]) => {
    return nodes.map((node: TreeNode) => {
      const id = node.type === 'person' ? `p-${node.data.id}` : `m-${node.data.id}`;
      const position = {
        x: node.node_x_position || 0,
        y: node.node_y_position || 0,
      };

      if (node.type === 'person') {
        const personData = node.data as Person;
        return {
          id,
          type: 'person',
          data: {
            ...personData,
            firstName: personData.firstName || '',
            lastName: personData.lastName || '',
            gender: personData.gender || 'male',
          },
          position,
        };
      } else {
        const marriageData = node.data as Marriage;
        return {
          id,
          type: 'marriage',
          data: marriageData,
          position,
        };
      }
    });
  }, []);

  const transformEdges = useCallback((edges: TreeEdge[]) => {
    return edges.map((edge) => {
      const sourceId = edge.source.type === 'person' ? `p-${edge.source.id}` : `m-${edge.source.id}`;
      const targetId = edge.target.type === 'person' ? `p-${edge.target.id}` : `m-${edge.target.id}`;
      const type = edge.source.type === 'marriage' && edge.target.type === 'person' ? 'marriage-person' : 'person-marriage';

      return {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type,
      };
    });
  }, []);

  const loadTree = useCallback(async () => {
    try {
      const treeFromApi = await treeApi.getTree();
      if (!treeFromApi) {
        setData({ nodes: [], edges: [] });
        return;
      }
      setData(treeFromApi);

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }
      });
    } catch (error) {
      setData({ nodes: [], edges: [] });
      throw error;
    }
  }, [setData, reactFlowInstance]);

  return {
    treeData,
    setData,
    loadTree,
  };
} 