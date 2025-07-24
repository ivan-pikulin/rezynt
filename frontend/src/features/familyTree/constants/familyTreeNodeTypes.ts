import { PersonNode } from '../components/graph/PersonNode';
import { MarriageNode } from '../components/graph/MarriageNode';
import { MarriagePersonEdge, PersonMarriageEdge } from '../components/graph/FamilyEdge';

export const nodeTypes = {
  person: PersonNode,
  marriage: MarriageNode,
};

export const edgeTypes = {
  'marriage-person': MarriagePersonEdge,
  'person-marriage': PersonMarriageEdge,
}; 