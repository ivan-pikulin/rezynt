import React, { createContext, useContext } from 'react';
import { Edge, Node } from 'reactflow';
import { useTreeData } from '../hooks/useTreeData';

// Переиспользуем типы из существующего хука
interface TreeData {
  nodes: Node[];
  edges: Edge[];
}

// Интерфейс для значения контекста
interface FamilyTreeContextValue {
  treeData: TreeData | null;
  loadTree: () => Promise<void>;
}

// Создаем контекст
const FamilyTreeContext = createContext<FamilyTreeContextValue | undefined>(undefined);

// Провайдер контекста
export function FamilyTreeProvider({ children }: { children: React.ReactNode }) {
  // Используем существующий хук для получения данных и методов
  const treeData = useTreeData();
  
  return (
    <FamilyTreeContext.Provider value={{
      treeData: treeData.treeData,
      loadTree: treeData.loadTree,
    }}>
      {children}
    </FamilyTreeContext.Provider>
  );
}

// Хук для использования контекста
export function useFamilyTree() {
  const context = useContext(FamilyTreeContext);
  if (context === undefined) {
    throw new Error('useFamilyTree must be used within a FamilyTreeProvider');
  }
  return context;
} 