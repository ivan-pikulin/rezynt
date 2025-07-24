import { FamilyTreeFromApi, DraftTreeFromApi, TreeNode, TreeEdge } from 'services/api/types';
import { FamilyTree } from 'shared/types/tree';
import { mapPersonFromApi, mapMarriageFromApi } from 'services/api/utils';
import { Person } from 'shared/types/person';
import { Marriage } from 'shared/types/marriage';

/**
 * Универсальная функция нормализации дерева (draft/published)
 * Возвращает nodes/edges в формате, подходящем для React Flow
 */
export function normalizeTreeData(rawTreeData: FamilyTreeFromApi | DraftTreeFromApi): { nodes: any[]; edges: any[] } {
  const nodes = (rawTreeData.nodes || []).map((node: TreeNode, idx) => {
    const position = {
      x: node.node_x_position || 0,
      y: node.node_y_position || 0,
    };
    const logObj = { idx, node, node_id: node.id, node_type: node.type, node_data: node.data };
    if (node.type === 'person') {
      const mapped = {
        ...node,
        id: `p-${node.data.id}`,
        type: 'person',
        data: mapPersonFromApi(node.data),
        position,
      };
      return mapped;
    } else if (node.type === 'marriage') {
      const mapped = {
        ...node,
        id: `m-${node.data.id}`,
        type: 'marriage',
        data: mapMarriageFromApi(node.data),
        position,
      };
      return mapped;
    }
    return node;
  });

  // edges: source/target должны быть строками для React Flow
  const edges = (rawTreeData.edges || []).map((edge: TreeEdge, idx) => {
    const source = `${edge.source.type === 'person' ? 'p' : 'm'}-${edge.source.id}`;
    const target = `${edge.target.type === 'person' ? 'p' : 'm'}-${edge.target.id}`;
    const mapped = {
      id: `e-${edge.source.id}-${edge.target.id}`,
      source,
      target,
      type: edge.source.type === 'marriage' && edge.target.type === 'person' ? 'marriage-person' : 'person-marriage',
    };
    return mapped;
  });

  return { nodes, edges };
} 