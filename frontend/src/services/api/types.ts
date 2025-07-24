import { Person } from "shared/types/person";
import { Marriage } from "shared/types/marriage";

export type Gender = 'male' | 'female';

// API response types
export interface PersonFromApi {
    id: string;
    first_name: string;
    last_name: string;
    gender: Gender;
    kinship?: {
        me_depth: number;
        other_depth: number;
        other_gender: Gender;
    };
    middle_name?: string;
    avatar_url?: string;
    birth_day?: number;
    birth_month?: number;
    birth_year?: number;
    death_day?: number;
    death_month?: number;
    death_year?: number;
    description?: string;
    father_id?: number;
    mother_id?: number;
    alive: boolean;
}

export interface MarriageFromApi {
    id: number;
    husband_id: number;
    wife_id: number;
}

export interface MarriageCreate {
    husband_id: string;
    wife_id: string;
}

export interface UserLogin {
    username: string;
    password: string;
}

export interface UserSignup {
    username: string;
    password: string;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
}

export interface TreeNodeBase {
    id: number;
    node_x_position: number;
    node_y_position: number;
}

export interface TreePersonNode extends TreeNodeBase {
    type: 'person';
    data: PersonFromApi;
}

export interface TreeMarriageNode extends TreeNodeBase {
    type: 'marriage';
    data: MarriageFromApi;
}

export type TreeNode = TreePersonNode | TreeMarriageNode;

export interface TreeEdgeEndpoint {
    type: 'person' | 'marriage';
    id: number;
}

export interface TreeEdge {
    source: TreeEdgeEndpoint;
    target: TreeEdgeEndpoint;
}

export interface FamilyTreeFromApi {
    nodes: TreeNode[];
    edges: TreeEdge[];
}

export type UserRole = 'user' | 'admin';

export interface UserFromApi {
    id: number;
    username: string;
    is_admin: boolean;
    last_login?: string | null;
    person_id?: number | null;
}

export interface AccountLinkRequest {
    id: number;
    person_id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export type PersonLinkStatus = 'pending' | 'approved';

export interface PersonMeResponseApi {
  status: PersonLinkStatus;
  person: PersonFromApi;
}

export interface PersonMeResponse {
    status: PersonLinkStatus;
    person: Person;
  }

export interface Draft {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DraftList {
  drafts: Draft[];
}

export interface DraftTreeFromApi {
  nodes: TreeNode[];
  edges: TreeEdge[];
}

export interface FamilyTree {
  nodes: (TreePersonNode & { data: Person } | TreeMarriageNode & { data: Marriage })[];
  edges: TreeEdge[];
}