import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactFlow, {
  Background,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { draftApi, personApi, userApi } from 'services/api';
import type { Draft, FamilyTree } from 'services/api/types';
import { useNotification } from 'shared/components/feedback/Notification';
import { useApp } from 'shared/context/AppContext';
import { useApiError } from 'shared/hooks/useApiError';
import { Person } from 'shared/types/person';
import EditActionsPanel from '../components/EditActionsPanel';
import MarriageDialog from '../components/EditMarriageDialog';
import PersonDialog from '../components/EditPersonDialog';
import PersonDetailsPanel from '../components/personDetails/PersonDetailsPanel';
import { edgeTypes, nodeTypes } from '../constants/familyTreeNodeTypes';
import { FamilyTreeProvider, useFamilyTree } from '../context/FamilyTreeContext';
import { useAutoLayout } from '../hooks/useAutoLayout';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useNodeMovement } from '../hooks/useNodeMovement';
import { usePositionSync } from '../hooks/usePositionSync';

// Move nodeTypes and edgeTypes outside the component
const memoizedNodeTypes = nodeTypes;
const memoizedEdgeTypes = edgeTypes;

const CHANGE_SELECTED_TAB_TIMEOUT = 200;

const initialPersonForm = {
  first_name: '',
  last_name: '',
  gender: '',
  middle_name: '',
  birth_day: '',
  birth_month: '',
  birth_year: '',
  alive: true,
  death_day: '',
  death_month: '',
  death_year: '',
  description: '',
  father_id: '',
  mother_id: '',
};

const initialMarriageForm = {
  husband_id: '',
  wife_id: '',
};

type TreeView = 
  | { type: 'published'; data: any }
  | { type: 'draft'; data: any }
  | { type: 'loading'; data: null };

const FamilyTreeContent: React.FC = () => {
  const { treeData, loadTree } = useFamilyTree();
  const { handleError } = useApiError();
  const { handleAutoLayout } = useAutoLayout();
  const { dispatch } = useApp();
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedMarriage, setSelectedMarriage] = useState<any | null>(null);
  const [selectedMarriageId, setSelectedMarriageId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [personEditDialogOpen, setPersonEditDialogOpen] = useState(false);
  const [marriageDialogOpen, setMarriageDialogOpen] = useState(false);
  const [personForm, setPersonForm] = useState(initialPersonForm);
  const [marriageForm, setMarriageForm] = useState(initialMarriageForm);
  const [editMode, setEditMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const peopleCache = useRef<{ [key: string]: Person[] }>({});
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeTab, setActiveTab] = useState<'published' | number | 'new'>('published');
  const [treeView, setTreeView] = useState<TreeView>({ type: 'loading', data: null });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<number | null>(null);
  const [confirmPublishDraftOpen, setConfirmPublishDraftOpen] = useState(false);
  const [draftToPublish, setDraftToPublish] = useState<number | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmMarriageDeleteOpen, setConfirmMarriageDeleteOpen] = useState(false);
  const [confirmPersonDeleteOpen, setConfirmPersonDeleteOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  const { peopleMen, peopleWomen } = useMemo(() => ({
    peopleMen: people.filter(p => p.gender === 'male'),
    peopleWomen: people.filter(p => p.gender === 'female')
  }), [people]);

  const { handleNodeDrag } = useNodeMovement(nodes, edges, setNodes, activeDraftId, editMode);
  const { hasUnsavedChanges, isSyncing, savePositions } = usePositionSync(nodes, activeDraftId, editMode);

  // Helper function to preserve current node positions when updating tree data
  const updateTreeViewWithPreservedPositions = useCallback((newData: any) => {
    setTreeView((currentTreeView) => {
      if (!editMode || !activeDraftId) {
        return { type: 'draft', data: newData };
      }

      // Preserve current node positions from current nodes state
      const currentPositions = new Map<string, { x: number; y: number }>();
      nodes.forEach(node => {
        currentPositions.set(node.id, { x: node.position.x, y: node.position.y });
      });
      
      // Update tree data with preserved positions
      const updatedTreeDataWithPositions = {
        ...newData,
        nodes: newData.nodes.map((n: any) => {
          const nodeId = n.type === 'person' ? `p-${n.data.id}` : `m-${n.data.id}`;
          const currentPos = currentPositions.get(nodeId);
          if (currentPos) {
            return {
              ...n,
              node_x_position: currentPos.x,
              node_y_position: currentPos.y
            };
          }
          return n;
        })
      };
      
      return { type: 'draft', data: updatedTreeDataWithPositions };
    });
  }, [editMode, activeDraftId, nodes]);

  const loadPeople = useCallback(async (forceRefresh = false) => {
    try {
      // If we're already loading, don't start another request
      if (isLoadingPeople) return;
      
      setIsLoadingPeople(true);
      
      const cacheKey = activeDraftId ? `draft-${activeDraftId}` : 'published';
      
      // Return cached data if available and not forcing refresh
      if (!forceRefresh && peopleCache.current[cacheKey]) {
        setPeople(peopleCache.current[cacheKey]);
        setIsLoadingPeople(false);
        return;
      }

      let allPeople: Person[];
      if (activeDraftId) {
        allPeople = await draftApi.getPersonsInDraft(activeDraftId);
      } else {
        allPeople = await personApi.getAll();
      }
      
      // Update cache
      peopleCache.current[cacheKey] = allPeople;
      setPeople(allPeople);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoadingPeople(false);
    }
  }, [handleError, activeDraftId]);

  useEffect(() => {
    if (activeDraftId || !people.length) {
      loadPeople();
    }
  }, [activeDraftId]);

  const handleClickAddPerson = useCallback(() => {
    loadPeople(true);
    setSelectedPerson(null);
    setSelectedPersonId(null);
    setIsEditing(false);
    setPersonEditDialogOpen(true);
    setPersonForm(initialPersonForm);
  }, [loadPeople]);

  const handleClosePersonDialog = useCallback(() => {
    setPersonEditDialogOpen(false);
    setPersonForm(initialPersonForm);
    
    if (selectedPerson) {
      const refreshPerson = async () => {
        try {
          if (activeDraftId) {
            // If we're in a draft, get the person from the draft
            const updatedPerson = await draftApi.getPersonInDraft(activeDraftId, selectedPerson.id);
              setSelectedPerson(updatedPerson);
          } else {
            // If we're in published view, get the person from the published tree
            const [refreshedPerson] = await Promise.all([
              personApi.getById(selectedPerson.id),
              loadTree()
            ]);
            setSelectedPerson(refreshedPerson);
          }
        } catch (error) {
          handleError(error);
        }
      };
      refreshPerson();
    }
  }, [selectedPerson, handleError, loadTree, activeDraftId]);

  const handleClickAddMarriage = useCallback(() => {
    loadPeople();
    setMarriageDialogOpen(true);
  }, [loadPeople]);

  const handleCloseMarriageDialog = useCallback(() => {
    setMarriageDialogOpen(false);
    setMarriageForm(initialMarriageForm);
  }, []);

  const handlePersonFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPersonForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleMarriageFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMarriageForm(f => ({ ...f, [name]: value }));
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        await loadTree();
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!editMode) {
      loadTree();
    }
  }, [editMode]);

  useEffect(() => {
    if (treeData) {
      setNodes(treeData.nodes);
      setEdges(treeData.edges);
      
      if (treeView.type === 'published') {
        setTreeView({ type: 'published', data: treeData });
        setActiveDraftId(null);
      }
    }
  }, [treeData, setNodes, setEdges]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userApi.getCurrentUser();
        setIsAdmin(!!response.isAdmin);
      } catch (e) {
        setIsAdmin(false);
      }
    };
    fetchUser();
  }, []);

  const handleTabChange = async (_: any, value: string | number) => {
    if (activeTab === value) return; // если клик по уже активной — ничего не делать

    // Reset selected person state
    setSelectedPerson(null);
    setSelectedPersonId(null);
    setSelectedMarriageId(null);
    setSelectedMarriage(null);
    setNodes(ns => ns.map(n => ({ ...n, selected: false })));

    // Сначала сбрасываем выделение
    setActiveTab(null as any);
    setTimeout(async () => {
      setActiveTab(value as 'published' | number | 'new');

      if (value === 'published') {
        await loadTree();
        setTreeView({ type: 'published', data: treeData! });
        setActiveDraftId(null);
      } else if (value === 'new') {
        const newDraft = await draftApi.createDraft();
        const updatedDrafts = await draftApi.getDrafts();
        setDrafts(updatedDrafts);
        setActiveDraftId(newDraft.id);
        setActiveTab(newDraft.id);
        const data = await draftApi.getDraftById(newDraft.id);
        updateTreeViewWithPreservedPositions(data);
      } else {
        setTreeView({ type: 'loading', data: null });
        try {
          const data = await draftApi.getDraftById(value as number);
        updateTreeViewWithPreservedPositions(data);
          setActiveDraftId(value as number);
        } catch (error) {
          handleError(error);
          setTreeView({ type: 'published', data: treeData! });
        }
      }
    }, CHANGE_SELECTED_TAB_TIMEOUT);
  };

  useEffect(() => {
    if (editMode) {
      draftApi.getDrafts()
        .then(drafts => {
          setDrafts(drafts);
        })
        .catch(err => {
          handleError(err);
        });
    }
  }, [editMode]);

  // Effect for updating tree structure (nodes and edges from treeView)
  useEffect(() => {
    function isNodeDraggableLocal(node: Node) {
      // Node is only draggable if edit mode is on and a draft is selected
      if (!editMode || !activeDraftId) return false;
      
      if (node.type === 'marriage') return true;
      if (node.type === 'person' && !treeData?.edges?.some(e => e.source === node.id && treeData.nodes.find(n => n.id === e.target)?.type === 'marriage')) return true;
      return false;
    }

    if (treeView.type === 'loading') return;

    const data = treeView.data;
    
    if (data?.nodes) {
      const mappedNodes = data.nodes.map((n: any) => {
        const nodeId = n.type === 'person' ? `p-${n.data.id}` : `m-${n.data.id}`;
        const position = {
          x: n.node_x_position || n.position?.x || 0,
          y: n.node_y_position || n.position?.y || 0
        };

        return {
          id: nodeId,
          type: n.type,
          position,
          data: n.data,
          selected: false, // Reset selection when tree structure changes
          draggable: isNodeDraggableLocal({ ...n, id: nodeId })
        };
      });
      setNodes(mappedNodes);
    }
    if (data?.edges) {
      setEdges(data.edges);
    }
  }, [treeView, setNodes, setEdges, editMode, activeDraftId, isAdmin]);

  // Separate effect for updating selection state without affecting positions
  useEffect(() => {
    setNodes(currentNodes => 
      currentNodes.map(node => ({
        ...node,
        selected: (selectedPersonId === node.id) || (selectedMarriageId === node.id)
      }))
    );
  }, [selectedPersonId, selectedMarriageId, setNodes]);

  const handleDeleteDraft = async (id: number) => {
    await draftApi.deleteDraft(id);
    const updatedDrafts = await draftApi.getDrafts();
    setDrafts(updatedDrafts);
    setActiveTab('published');
    setActiveDraftId(null);
    setTreeView({ type: 'published', data: treeData! });
    setDeleteDialogOpen(false);
    setDraftToDelete(null);
    await loadTree();
  };

  const handlePublishDraft = async (id: number) => {
    try {
      // Auto-sync positions before publishing if there are unsaved changes
      if (hasUnsavedChanges && activeDraftId === id) {
        await savePositions();
      }
      
      await draftApi.publishDraft(id);
      setDrafts(drafts.filter(d => d.id !== id));
      setActiveTab('published');
      setActiveDraftId(null);
      setTreeView({ type: 'published', data: treeData! });
      await loadTree();
      showNotification(t('tree.draft.published_successfully'), 'success');
    } catch (error) {
      handleError(error);
      showNotification(t('tree.draft.publish_failed'), 'error');
    }
  };

  const handleSavePerson = async (form: any): Promise<Person> => {
    try {
      let savedPerson: Person;
      
      if (isEditing && selectedPerson) {
        const genderValue: 'male' | 'female' | undefined = form.gender === 'male' || form.gender === 'female' ? form.gender : undefined;
        const payload = {
          first_name: form.first_name || undefined,
          last_name: form.last_name || undefined,
          gender: genderValue,
          middle_name: form.middle_name || undefined,
          birth_day: form.birth_day ? Number(form.birth_day) : undefined,
          birth_month: form.birth_month ? Number(form.birth_month) : undefined,
          birth_year: form.birth_year ? Number(form.birth_year) : undefined,
          alive: form.alive,
          death_day: !form.alive && form.death_day ? Number(form.death_day) : undefined,
          death_month: !form.alive && form.death_month ? Number(form.death_month) : undefined,
          death_year: !form.alive && form.death_year ? Number(form.death_year) : undefined,
          description: form.description || undefined,
          father_id: form.father_id ? Number(form.father_id) : undefined,
          mother_id: form.mother_id ? Number(form.mother_id) : undefined,
        };
        
        if (activeDraftId) {
          savedPerson = await draftApi.updatePersonInDraft(activeDraftId, selectedPerson.id, payload);
          const data = await draftApi.getDraftById(activeDraftId);
          updateTreeViewWithPreservedPositions(data);
          setSelectedPerson(savedPerson);
        } else {
          throw new Error('No draft selected');
        }
      } else {
        const genderValue: 'male' | 'female' | undefined = form.gender === 'male' || form.gender === 'female' ? form.gender : undefined;
        const payload = {
          first_name: form.first_name || undefined,
          last_name: form.last_name || undefined,
          gender: genderValue,
          middle_name: form.middle_name || undefined,
          birth_day: form.birth_day ? Number(form.birth_day) : undefined,
          birth_month: form.birth_month ? Number(form.birth_month) : undefined,
          birth_year: form.birth_year ? Number(form.birth_year) : undefined,
          alive: form.alive,
          death_day: !form.alive && form.death_day ? Number(form.death_day) : undefined,
          death_month: !form.alive && form.death_month ? Number(form.death_month) : undefined,
          death_year: !form.alive && form.death_year ? Number(form.death_year) : undefined,
          description: form.description || undefined,
          father_id: form.father_id ? Number(form.father_id) : undefined,
          mother_id: form.mother_id ? Number(form.mother_id) : undefined,
        };
        
        if (activeDraftId) {
          savedPerson = await draftApi.createPersonInDraft(activeDraftId, payload);
          const data = await draftApi.getDraftById(activeDraftId);
          updateTreeViewWithPreservedPositions(data);
          setSelectedPerson(savedPerson);
        } else {
          throw new Error('No draft selected');
        }
      }
      
      return savedPerson;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const handleSaveMarriage = async () => {
    try {
      const payload: any = {};
      if (marriageForm.husband_id) payload.husband_id = Number(marriageForm.husband_id);
      if (marriageForm.wife_id) payload.wife_id = Number(marriageForm.wife_id);
      
      if (activeDraftId) {
        await draftApi.createMarriageInDraft(activeDraftId, payload);
        const data = await draftApi.getDraftById(activeDraftId);
        updateTreeViewWithPreservedPositions(data);
      } else {
        throw new Error('No draft selected');
      }
      
      handleCloseMarriageDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeletePerson = async (): Promise<void> => {
    if (!selectedPerson) return;
    try {
      if (activeDraftId) {
        await draftApi.deletePersonInDraft(activeDraftId, selectedPerson.id);
        const data = await draftApi.getDraftById(activeDraftId);
        updateTreeViewWithPreservedPositions(data);
        // Clear selected person state before closing dialog
        setSelectedPerson(null);
        setSelectedPersonId(null);
        setSelectedMarriageId(null);
        setSelectedMarriage(null);
        handleClosePersonDialog();
      } else {
        throw new Error('No draft selected');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditPerson = useCallback((person: Person) => {
    loadPeople(true);
    setIsEditing(true);
    setPersonForm({
      first_name: person.firstName || '',
      last_name: person.lastName || '',
      gender: person.gender || '',
      middle_name: person.middleName || '',
      birth_day: person.birthDay ? String(person.birthDay) : '',
      birth_month: person.birthMonth ? String(person.birthMonth) : '',
      birth_year: person.birthYear ? String(person.birthYear) : '',
      alive: person.alive,
      death_day: person.deathDay ? String(person.deathDay) : '',
      death_month: person.deathMonth ? String(person.deathMonth) : '',
      death_year: person.deathYear ? String(person.deathYear) : '',
      description: person.description || '',
      father_id: person.fatherId ? String(person.fatherId) : '',
      mother_id: person.motherId ? String(person.motherId) : '',
    });
    setPersonEditDialogOpen(true);
  }, [loadPeople]);

  useKeyboardShortcuts({
    selectedMarriage,
    selectedMarriageId,
    editMode,
    activeDraftId,
    treeView,
    setTreeView,
    setConfirmMarriageDeleteOpen,
    selectedPerson,
    onEditPerson: handleEditPerson,
    setDeletePersonDialogOpen: setConfirmPersonDeleteOpen,
    onCreatePerson: handleClickAddPerson,
    onCreateMarriage: handleClickAddMarriage,
    personEditDialogOpen,
    marriageDialogOpen,
    deleteDialogOpen,
    confirmPublishDraftOpen,
    confirmMarriageDeleteOpen,
    confirmPersonDeleteOpen,
    cropDialogOpen
  });

  const handleDeleteMarriage = async () => {
    if (!selectedMarriage || !activeDraftId) return;
    
    try {
      await draftApi.deleteMarriageInDraft(activeDraftId, selectedMarriage.id);
      const data = await draftApi.getDraftById(activeDraftId);
      updateTreeViewWithPreservedPositions(data);
      // Clear selected marriage state
      setSelectedMarriage(null);
      setSelectedMarriageId(null);
      setConfirmMarriageDeleteOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (!treeData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>{t('familyTree.noData')}</Typography>
      </Box>
    );
  }

  return (
    <Stack direction="row" sx={{ height: '100vh' }}>
      {!editMode && isAdmin && (
        <Box sx={{ position: 'absolute', top: 80, left: 16, zIndex: 20 }}>
          <IconButton
            onClick={() => setEditMode(true)}
            sx={{ 'width': 40, 'height': 40, bgcolor: 'background.paper' }}
            size="large"
          >
            <EditIcon />
          </IconButton>
        </Box>
      )}
      {editMode && <EditActionsPanel
            onAddPerson={handleClickAddPerson}
            onAddMarriage={handleClickAddMarriage}
            onAutoLayout={handleAutoLayout}
            onSyncPositions={savePositions}
            hasUnsavedChanges={hasUnsavedChanges}
            isSyncing={isSyncing}
            drafts={drafts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onDeleteDraft={handleDeleteDraft}
            onPublishDraft={id => {
              setConfirmPublishDraftOpen(false);
              setDraftToPublish(null);
              handlePublishDraft(id);
            }}
            onCreateDraft={() => handleTabChange(null, 'new')}
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            draftToDelete={draftToDelete}
            setDraftToDelete={setDraftToDelete}
            onExitEditMode={async () => {
              setEditMode(false);
              setActiveTab('published');
              setActiveDraftId(null);
              setTreeView({ type: 'published', data: treeData! });
              await loadTree();
            }}
            setConfirmPublishDraftOpen={setConfirmPublishDraftOpen}
            confirmPublishDraftOpen={confirmPublishDraftOpen}
            draftToPublish={draftToPublish}
            setDraftToPublish={setDraftToPublish}
            setDrafts={setDrafts}
        />
      }
      <Box sx={{ flex: 1, height: '100%', width: '100%' }}>
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDrag={handleNodeDrag}
            nodeTypes={memoizedNodeTypes}
            nodeOrigin={[0.5, 0.5]}
            edgeTypes={memoizedEdgeTypes}
            minZoom={0.05}
            maxZoom={5}
            zoomOnScroll
            zoomOnPinch
            fitView
            onlyRenderVisibleElements={true}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            nodesDraggable={editMode && !!activeDraftId}
            onNodeClick={(_, node) => {
              if (node.type === 'person') {
                setSelectedPersonId(node.id);
                setSelectedMarriageId(null);
                setSelectedMarriage(null);
                setNodes(ns => ns.map(n => ({
                  ...n,
                  selected: n.id === node.id
                })));
                const personId = node.id.startsWith('p-') ? node.id.slice(2) : node.data.id.toString();
                
                const fetchPerson = async () => {
                  try {
                    if (editMode && activeDraftId) {
                      // If we're in draft mode and have an active draft, get person from draft
                      const person = await draftApi.getPersonInDraft(activeDraftId, Number(personId));
                      setSelectedPerson(person);
                    } else {
                      // If we're in published view or not in edit mode, get person from published tree
                      const person = await personApi.getById(Number(personId));
                      setSelectedPerson(person);
                    }
                  } catch (error) {
                    handleError(error);
                  }
                };
                fetchPerson();
              } else if (node.type === 'marriage') {
                setSelectedMarriageId(node.id);
                setSelectedPersonId(null);
                setSelectedPerson(null);
                setNodes(ns => ns.map(n => ({
                  ...n,
                  selected: n.id === node.id
                })));
                const marriageId = node.id.startsWith('m-') ? node.id.slice(2) : node.data.id.toString();
                setSelectedMarriage(node.data);
              }
            }}
            onPaneClick={() => {
              setSelectedPerson(null);
              setSelectedPersonId(null);
              setSelectedMarriageId(null);
              setSelectedMarriage(null);
              setNodes(ns => ns.map(n => ({ ...n, selected: false })));
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
          </ReactFlow>
        </Box>
        <PersonDialog
          open={personEditDialogOpen}
          onClose={handleClosePersonDialog}
          onSave={handleSavePerson}
          isEditing={isEditing}
          personForm={personForm}
          setPersonForm={setPersonForm}
          peopleMen={peopleMen}
          peopleWomen={peopleWomen}
          selectedPerson={selectedPerson}
          handlePersonFormChange={handlePersonFormChange}
          onDelete={handleDeletePerson}
          handleError={handleError}
          loadTree={loadTree}
          activeDraftId={activeDraftId}
          confirmOpen={confirmPersonDeleteOpen}
          setConfirmOpen={setConfirmPersonDeleteOpen}
          cropDialogOpen={cropDialogOpen}
          setCropDialogOpen={setCropDialogOpen}
          currentTreeData={treeView.data}
        />
        <MarriageDialog
          open={marriageDialogOpen}
          onClose={handleCloseMarriageDialog}
          onSave={handleSaveMarriage}
          marriageForm={marriageForm}
          handleMarriageFormChange={handleMarriageFormChange}
          peopleMen={peopleMen}
          peopleWomen={peopleWomen}
        />
        <Dialog
          open={confirmMarriageDeleteOpen}
          onClose={() => setConfirmMarriageDeleteOpen(false)}
        >
          <DialogTitle>{t('tree.marriage.delete_confirmation')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('tree.marriage.delete_confirmation_text')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmMarriageDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleDeleteMarriage} color="error">
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {selectedPerson && selectedPersonId && (
        <PersonDetailsPanel
          editMode={editMode}
          person={selectedPerson} 
          onEdit={handleEditPerson} 
          people={people} 
          isAdmin={isAdmin} 
          activeDraftId={activeDraftId}
        />
      )}
      {selectedMarriage && selectedMarriageId && editMode && (
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
          <IconButton
            onClick={() => setConfirmMarriageDeleteOpen(true)}
            sx={{ 'width': 40, 'height': 40, bgcolor: 'background.paper' }}
            size="large"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Stack>
  );
};

const FamilyTree: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FamilyTreeProvider>
        <FamilyTreeContent />
      </FamilyTreeProvider>
    </ReactFlowProvider>
  );
};

export default FamilyTree; 