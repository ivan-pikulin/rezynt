// Helper functions for family tree node relationships
import { Edge, Node } from 'reactflow';
import { Gender } from 'shared/types/person';
import { t } from 'i18next';

export function getMarriageChildren(marriageId: string, edges: Edge[], nodes: Node[]) {
  return edges
    .filter(e => e.source === marriageId)
    .map(e => nodes.find(n => n.id === e.target))
    .filter((n): n is Node & { x: number, y: number } => !!n && n.type === 'person');
}

export function getMarriageSpouses(marriageId: string, edges: Edge[], nodes: Node[]) {
  return edges
    .filter(e => e.target === marriageId)
    .map(e => nodes.find(n => n.id === e.source))
    .filter((n): n is Node & { x: number, y: number } => !!n && n.type === 'person');
}

export function getAllDescendants(marriageId: string, edges: Edge[], nodes: Node[]): Node[] {
  const descendants: Node[] = [];
  const visited = new Set<string>();

  function collectDescendants(currentMarriageId: string) {
    if (visited.has(currentMarriageId)) return;
    visited.add(currentMarriageId);

    // Get direct children of this marriage
    const children = getMarriageChildren(currentMarriageId, edges, nodes);
    
    for (const child of children) {
      if (!descendants.find(d => d.id === child.id)) {
        descendants.push(child);
      }

      // Find marriages where this child is a spouse
      const childMarriages = edges
        .filter(e => e.source === child.id && nodes.find(n => n.id === e.target)?.type === 'marriage')
        .map(e => nodes.find(n => n.id === e.target))
        .filter((n): n is Node => !!n);

      for (const childMarriage of childMarriages) {
        if (!descendants.find(d => d.id === childMarriage.id)) {
          descendants.push(childMarriage);
        }

        // Get the spouse of this child in this marriage
        const spouse = getMarriageSpouses(childMarriage.id, edges, nodes)
          .find(s => s.id !== child.id);
        
        if (spouse && !descendants.find(d => d.id === spouse.id)) {
          descendants.push(spouse);
        }

        // Recursively get descendants of this marriage
        collectDescendants(childMarriage.id);
      }
    }
  }

  collectDescendants(marriageId);
  return descendants;
}

export function getKinships(meDepth: number, otherDepth: number, otherGender: Gender) {
  if (meDepth === 0 && otherDepth === 0) {
    return t('family_kinships.me');
  }

  ///// ровесники /////
  
  // брат, двоюродный брат, троюродный брат, ...
  if (meDepth === otherDepth) {
    return t(`family_kinships.sibling.${otherGender}.${meDepth}`);
  }

  ///// старшие родственники /////

  // отец, дед, прадед, ...
  if (otherDepth === 0) {
    return t(`family_kinships.ancestor.${otherGender}.${meDepth}`);
  }

  // двоюродный/троюродный/... дедушка/прадедушка/...
  else if (meDepth > otherDepth) {
    function cleanSpaces(input: string): string {
      return input.trim().replace(/\s+/g, ' ');
    }
    const order = t(`family_kinships.uncle.${otherGender}.order.${otherDepth + 1}`);
    const name = t(`family_kinships.uncle.${otherGender}.name.${meDepth - otherDepth}`);
    return cleanSpaces(order + ' ' + name);
  }

  ///// младшие родственники /////

  // сын, внук, правнук, ...
  else if (meDepth === 0) {
    return t(`family_kinships.child.${otherGender}.${otherDepth}`);
  }

  // двоюродный/троюродный/..., внучатый/правкучатый/... племянник
  else if (otherDepth > meDepth) {
    function cleanSpaces(input: string): string {
      return input.trim().replace(/\s+/g, ' ');
    }
    const order = t(`family_kinships.cousin.${otherGender}.order.${meDepth + 1}`);
    const great = t(`family_kinships.cousin.${otherGender}.great.${otherDepth - meDepth}`);
    const name = t(`family_kinships.cousin.${otherGender}.name`);
    return cleanSpaces(order + ' ' + great + ' ' + name);
  }

  // невозможное состояние
  throw new Error(`Invalid depth difference: meDepth=${meDepth}, otherDepth=${otherDepth}`);
}