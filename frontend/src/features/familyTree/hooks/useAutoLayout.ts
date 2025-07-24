import { useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { PERSON_NODE_WIDTH } from '../constants/nodeSizes';
import { getMarriageChildren, getMarriageSpouses } from './familyTreeFunctions';

export let CHILDREN_ASSYMETRY = 150;

// Вспомогательные функции для поиска связей
function getSposesRelativePositions(): { left: { x: number, y: number }, right: { x: number, y: number } } {
  return {
    left: { x: - PERSON_NODE_WIDTH / 2, y: 0 },
    right: { x: PERSON_NODE_WIDTH / 2, y: 0 },
  };
}

// Функция для расчета относительных позиций детей относительно marriage
function getChildrenRelativePositions(
  n: number,
): { x: number, y: number }[] {
  if (n === 0) return [];
  // Эта формула соответствует плотному расположению n+2 кругов радиуса PERSON_NODE_WIDTH / 2
  const radius = Math.max((n - 1), 3) * PERSON_NODE_WIDTH / Math.PI;
  const positions = [];
  if (n === 1) return [{ x: 0, y: radius }];
  else if (n === 2) {
    const p = getChildrenRelativePositions(3);
    positions.push(p[0]);
    positions.push(p[2]);
  }
  else {
    for (let i = 0; i < n; ++i) {
      // Отсчитываем угол по стандартам математики, в положительном напрвлении
      const angle = Math.PI + Math.PI / (n + 1) * (i + 1);
      // Поскольку оси направлены вправо и вниз, по Y нужен минус
      positions.push({
        x: radius * Math.cos(angle),
        y: -(radius + CHILDREN_ASSYMETRY) * Math.sin(angle),
      });
    }
  }
  return positions;
}

// Размещает брак и родителей над человеком, детей полукругом под браком
function layoutParents(
  person: Node & { x: number, y: number, data: { gender: 'male' | 'female' } },
  marriage: Node & { x: number, y: number },
  spouses: [Node & { x: number, y: number, data: { gender: 'male' | 'female' } }, Node & { x: number, y: number, data: { gender: 'male' | 'female' } }],
  children: (Node & { x: number, y: number })[],
  rootX: number,
  rootPersonId?: string
) {
  if (children.length === 0) return;
  const n = children.length;
  const relativePositions = getChildrenRelativePositions(n);
  let centerIdx;
  if (rootPersonId && person.id === rootPersonId) {
    centerIdx = n % 2 === 0 ? n / 2 : Math.floor(n / 2);
  } else {
    const isRight = person.x >= rootX;
    centerIdx = isRight ? 0 : n - 1;
  }
  marriage.x = person.x - relativePositions[centerIdx].x;
  marriage.y = person.y - relativePositions[centerIdx].y;

  const otherChildren = children.filter(c => c.id !== person.id);
  const otherPositions = relativePositions.filter((_, idx) => idx !== centerIdx);
  for (let i = 0; i < otherChildren.length; ++i) {
    otherChildren[i].x = marriage.x + otherPositions[i].x;
    otherChildren[i].y = marriage.y + otherPositions[i].y;
  }

  const father = spouses.find(s => s.data.gender === 'male');
  const mother = spouses.find(s => s.data.gender === 'female');
  if (!father || !mother) return;
  const positions = getSposesRelativePositions();
  mother.x = marriage.x + positions.left.x;
  mother.y = marriage.y + positions.left.y;
  father.x = marriage.x + positions.right.x;
  father.y = marriage.y + positions.right.y;
}

function layoutMarriage(
  person: Node & { x: number, y: number },
  marriage: Node & { x: number, y: number },
  spouse: Node & { x: number, y: number },
  isRight: boolean
) {
  const positions = getSposesRelativePositions();
  if (isRight) {
    marriage.x = person.x - positions.left.x;
    marriage.y = person.y - positions.left.y;
    spouse.x = marriage.x + positions.right.x;
    spouse.y = marriage.y + positions.right.y;
  } else {
    marriage.x = person.x - positions.right.x;
    marriage.y = person.y - positions.right.y;
    spouse.x = marriage.x + positions.left.x;
    spouse.y = marriage.y + positions.left.y;
  }
}

function layoutChildren(
  marriage: Node & { x: number, y: number },
  children: (Node & { x: number, y: number })[]
) {
  if (children.length === 0) return;
  const n = children.length;
  const relativePositions = getChildrenRelativePositions(n);
  for (let i = 0; i < n; ++i) {
    children[i].x = marriage.x + relativePositions[i].x;
    children[i].y = marriage.y + relativePositions[i].y;
  }
}

export const useAutoLayout = () => {
  const { setNodes, getNodes, getEdges, setCenter } = useReactFlow();

  const handleAutoLayout = useCallback(() => {
    const nodes = getNodes().map(n => ({ ...n, x: n.position.x, y: n.position.y }));
    const edges = getEdges();
    const personNodes = nodes.filter(n => n.type === 'person');
    if (personNodes.length === 0) return;
    const rootPerson = personNodes[0] as Node & { x: number, y: number, data: { gender: 'male' | 'female' } };
    const visitedPerson = new Set<string>();
    const visitedMarriage = new Set<string>();

    function applyLayoutMarriage(person: Node & { x: number, y: number, data: { gender: 'male' | 'female' } }) {
      if (visitedPerson.has(person.id)) return;
      visitedPerson.add(person.id);
      // найти брак и второго супруга
      const marriageEdge = edges.find(e => e.source === person.id && nodes.find(n => n.id === e.target)?.type === 'marriage');
      if (!marriageEdge) return;
      const marriageNode = nodes.find(n => n.id === marriageEdge.target) as Node & { x: number, y: number };
      if (!marriageNode || visitedMarriage.has(marriageNode.id)) return;
      visitedMarriage.add(marriageNode.id);
      const spouses = getMarriageSpouses(marriageNode.id, edges, nodes);
      const otherSpouse = spouses.find(s => s.id !== person.id);
      if (!otherSpouse) return;
      const isRight = person.x >= rootPerson.x;
      layoutMarriage(person, marriageNode, otherSpouse, isRight);
      // после layoutMarriage: для второго супруга выполнить applyLayoutParents
      applyLayoutParents(otherSpouse as Node & { x: number, y: number, data: { gender: 'male' | 'female' } });
      // после layoutMarriage: для брака вызвать applyLayoutChildren
      applyLayoutChildren(marriageNode);
    }

    function applyLayoutChildren(marriage: Node & { x: number, y: number }) {
      if (visitedMarriage.has(marriage.id + ':children')) return;
      visitedMarriage.add(marriage.id + ':children');
      const children = getMarriageChildren(marriage.id, edges, nodes);
      layoutChildren(marriage, children);
      // после layoutChildren: для всех детей выполнить applyLayoutMarriage
      for (const child of children) {
        applyLayoutMarriage(child as Node & { x: number, y: number, data: { gender: 'male' | 'female' } });
      }
    }

    function applyLayoutParents(person: Node & { x: number, y: number, data: { gender: 'male' | 'female' } }) {
      if (visitedPerson.has(person.id + ':parents')) return;
      visitedPerson.add(person.id + ':parents');
      // найти родительский брак
      const parentMarriageEdge = edges.find(e => e.target === person.id && nodes.find(n => n.id === e.source)?.type === 'marriage');
      if (!parentMarriageEdge) return;
      const parentMarriageNode = nodes.find(n => n.id === parentMarriageEdge.source) as Node & { x: number, y: number };
      if (!parentMarriageNode || visitedMarriage.has(parentMarriageNode.id)) return;
      visitedMarriage.add(parentMarriageNode.id);
      const parentSpouses = getMarriageSpouses(parentMarriageNode.id, edges, nodes) as [Node & { x: number, y: number, data: { gender: 'male' | 'female' } }, Node & { x: number, y: number, data: { gender: 'male' | 'female' } }];
      const parentChildren = getMarriageChildren(parentMarriageNode.id, edges, nodes);
      if (parentSpouses.length !== 2) return;
      layoutParents(person, parentMarriageNode, parentSpouses, parentChildren, rootPerson.x, rootPerson.id);
      // после layoutParents: для всех других детей выполнить applyLayoutMarriage
      for (const sibling of parentChildren) {
        if (sibling.id !== person.id) {
          applyLayoutMarriage(sibling as Node & { x: number, y: number, data: { gender: 'male' | 'female' } });
        }
      }
      // после layoutParents: для обоих родителей - applyLayoutParents
      for (const parent of parentSpouses) {
        applyLayoutParents(parent);
      }
    }

    // Стартуем с rootPerson через applyLayoutParents
    applyLayoutParents(rootPerson);
    applyLayoutMarriage(rootPerson);
    setNodes(nodes.map(n => ({ ...n, position: { x: n.x, y: n.y } })));
    setCenter(rootPerson.x, rootPerson.y, { zoom: 1.2 });
  }, [getNodes, getEdges, setNodes, setCenter]);

  return { handleAutoLayout };
}; 