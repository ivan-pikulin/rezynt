import { useEffect } from 'react';
import { useApiError } from 'shared/hooks/useApiError';
import { useMarriageOrganization } from './useMarriageOrganization';

interface UseKeyboardShortcutsProps {
  selectedMarriage: any | null;
  selectedMarriageId: string | null;
  editMode: boolean;
  activeDraftId: number | null;
  treeView: { type: 'published' | 'draft' | 'loading'; data: any };
  setTreeView: (view: { type: 'published' | 'draft' | 'loading'; data: any }) => void;
  setConfirmMarriageDeleteOpen: (open: boolean) => void;
  selectedPerson: any | null;
  onEditPerson: (person: any) => void;
  setDeletePersonDialogOpen: (open: boolean) => void;
  onCreatePerson: () => void;
  onCreateMarriage: () => void;
  personEditDialogOpen: boolean;
  marriageDialogOpen: boolean;
  deleteDialogOpen: boolean;
  confirmPublishDraftOpen: boolean;
  confirmMarriageDeleteOpen: boolean;
  confirmPersonDeleteOpen: boolean;
  cropDialogOpen: boolean;
}

export const useKeyboardShortcuts = ({
  selectedMarriage,
  selectedMarriageId,
  editMode,
  activeDraftId,
  treeView,
  setTreeView,
  setConfirmMarriageDeleteOpen,
  selectedPerson,
  onEditPerson,
  setDeletePersonDialogOpen,
  onCreatePerson,
  onCreateMarriage,
  personEditDialogOpen,
  marriageDialogOpen,
  deleteDialogOpen,
  confirmPublishDraftOpen,
  confirmMarriageDeleteOpen,
  confirmPersonDeleteOpen,
  cropDialogOpen
}: UseKeyboardShortcutsProps) => {
  const { organizeMarriage, swapSpousePositions } = useMarriageOrganization(editMode, activeDraftId);
  const { handleError } = useApiError();

  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      // Check if any dialog is open
      if (personEditDialogOpen || marriageDialogOpen || deleteDialogOpen || 
          confirmPublishDraftOpen || confirmMarriageDeleteOpen || confirmPersonDeleteOpen || cropDialogOpen) {
        return;
      }

      if ((event.key === 'o' || event.key === 'щ') && selectedMarriage && selectedMarriageId) {
        try {
          const updatedNodes = await organizeMarriage(selectedMarriageId);
          if (updatedNodes && treeView.type === 'draft') {
            // Update local state with new positions
            const updatedData = {
              ...treeView.data,
              nodes: treeView.data.nodes.map((node: any) => {
                const updatedNode = updatedNodes.find(n => 
                  (n.id.startsWith('p-') && node.type === 'person' && node.data.id === parseInt(n.id.slice(2))) ||
                  (n.id.startsWith('m-') && node.type === 'marriage' && node.data.id === parseInt(n.id.slice(2)))
                );
                if (updatedNode) {
                  return {
                    ...node,
                    node_x_position: updatedNode.position.x,
                    node_y_position: updatedNode.position.y
                  };
                }
                return node;
              })
            };
            setTreeView({ type: 'draft', data: updatedData });
          }
        } catch (error) {
          handleError(error);
        }
      } else if ((event.key === 'r' || event.key === 'к') && selectedMarriage && selectedMarriageId) {
        try {
          const updatedNodes = await swapSpousePositions(selectedMarriageId);
          if (updatedNodes && treeView.type === 'draft') {
            // Update local state with new positions
            const updatedData = {
              ...treeView.data,
              nodes: treeView.data.nodes.map((node: any) => {
                const updatedNode = updatedNodes.find(n => 
                  (n.id.startsWith('p-') && node.type === 'person' && node.data.id === parseInt(n.id.slice(2))) ||
                  (n.id.startsWith('m-') && node.type === 'marriage' && node.data.id === parseInt(n.id.slice(2)))
                );
                if (updatedNode) {
                  return {
                    ...node,
                    node_x_position: updatedNode.position.x,
                    node_y_position: updatedNode.position.y
                  };
                }
                return node;
              })
            };
            setTreeView({ type: 'draft', data: updatedData });
          }
        } catch (error) {
          handleError(error);
        }
      } else if ((event.key === 'Backspace' || event.key === 'Delete') && selectedMarriage && selectedMarriageId && editMode && activeDraftId) {
        setConfirmMarriageDeleteOpen(true);
      } else if ((event.key === 'e' || event.key === 'у') && selectedPerson && editMode && activeDraftId) {
        onEditPerson(selectedPerson);
      } else if ((event.key === 'Backspace' || event.key === 'Delete') && selectedPerson && editMode && activeDraftId) {
        setDeletePersonDialogOpen(true);
      } else if (event.altKey && (event.key === 'm' || event.key === 'ь') && editMode && activeDraftId) {
        onCreateMarriage();
      } else if (event.altKey && (event.key === 'p' || event.key === 'з') && editMode && activeDraftId) {
        onCreatePerson();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    selectedMarriage,
    selectedMarriageId,
    organizeMarriage,
    swapSpousePositions,
    handleError,
    treeView,
    editMode,
    activeDraftId,
    setTreeView,
    setConfirmMarriageDeleteOpen,
    selectedPerson,
    onEditPerson,
    setDeletePersonDialogOpen,
    onCreatePerson,
    onCreateMarriage,
    personEditDialogOpen,
    marriageDialogOpen,
    deleteDialogOpen,
    confirmPublishDraftOpen,
    confirmMarriageDeleteOpen,
    confirmPersonDeleteOpen,
    cropDialogOpen
  ]);
}; 