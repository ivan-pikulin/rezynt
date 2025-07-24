import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TableSortLabel,
  IconButton,
  styled,
  Theme,
  Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { AccountLinkRequest } from 'services/api/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountLinkRequestApi, userApi, personApi } from 'services';
import { User } from 'shared/types/user';
import { Person } from 'shared/types/person';
import { useTranslation } from 'react-i18next';

type ActionType = 'approve' | 'reject';

interface StyledIconButtonProps {
  $action: ActionType;
}

const ActionIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== '$action',
})<StyledIconButtonProps>(({ theme, $action }) => ({
  width: 36,
  height: 36,
  backgroundColor: theme.palette.actionIcons[$action].background,
  color: theme.palette.actionIcons[$action].color,
  '&:hover': {
    backgroundColor: theme.palette.actionIcons[$action].hover,
  },
}));

type Order = 'asc' | 'desc';

export const LinkRequests: React.FC = () => {
  const { t } = useTranslation();
  const [orderBy, setOrderBy] = useState<'username' | 'personName' | 'created_at'>('created_at');
  const [order, setOrder] = useState<Order>('asc');
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery<AccountLinkRequest[]>({
    queryKey: ['admin', 'linkRequests'],
    queryFn: async () => {
      const response = await accountLinkRequestApi.getAll();
      return response.data;
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userApi.getAllUsers(),
  });

  const { data: persons = [] } = useQuery<Person[]>({
    queryKey: ['persons'],
    queryFn: () => personApi.getAll(),
  });

  const handleRequestSort = (property: 'username' | 'personName' | 'created_at') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRequests = React.useMemo(() => {
    const getUser = (userId: number) => users.find(u => u.id === userId);
    const getPerson = (personId: number) => persons.find(p => p.id === personId);

    const comparator = (a: AccountLinkRequest, b: AccountLinkRequest) => {
      if (orderBy === 'created_at') {
        return order === 'asc'
          ? new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime()
          : new Date(b[orderBy]).getTime() - new Date(a[orderBy]).getTime();
      }

      const aUser = getUser(a.user_id);
      const bUser = getUser(b.user_id);
      const aPerson = getPerson(a.person_id);
      const bPerson = getPerson(b.person_id);

      if (orderBy === 'username') {
        return order === 'asc'
          ? (aUser?.username || '').localeCompare(bUser?.username || '')
          : (bUser?.username || '').localeCompare(aUser?.username || '');
      }

      if (orderBy === 'personName') {
        const aName = `${aPerson?.firstName} ${aPerson?.lastName}`;
        const bName = `${bPerson?.firstName} ${bPerson?.lastName}`;
        return order === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      return 0;
    };

    return [...requests].sort(comparator);
  }, [requests, users, persons, order, orderBy]);

  const updateStatusMutation = useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: number;
      status: 'approved' | 'rejected';
    }) => status === 'approved' 
      ? accountLinkRequestApi.approve(requestId)
      : accountLinkRequestApi.reject(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'linkRequests'] });
    },
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'username'}
                direction={orderBy === 'username' ? order : 'asc'}
                onClick={() => handleRequestSort('username')}
              >
                {t('admin.table.username')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'personName'}
                direction={orderBy === 'personName' ? order : 'asc'}
                onClick={() => handleRequestSort('personName')}
              >
                {t('admin.table.person_name')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'created_at'}
                direction={orderBy === 'created_at' ? order : 'asc'}
                onClick={() => handleRequestSort('created_at')}
              >
                {t('admin.table.created_at')}
              </TableSortLabel>
            </TableCell>
            <TableCell>{t('admin.table.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRequests.map((request: AccountLinkRequest) => {
            const user = users.find(u => u.id === request.user_id);
            const person = persons.find(p => p.id === request.person_id);
            return (
              <TableRow key={request.id}>
                <TableCell>{user?.username || t('admin.table.unknown_user')}</TableCell>
                <TableCell>
                  {person ? `${person.firstName} ${person.lastName}` : t('admin.table.unknown_person')}
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={t('admin.actions.approve')}>
                        <ActionIconButton
                          $action="approve"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              requestId: request.id,
                              status: 'approved',
                            })
                          }
                        >
                          <CheckIcon />
                        </ActionIconButton>
                      </Tooltip>
                      <Tooltip title={t('admin.actions.reject')}>
                        <ActionIconButton
                          $action="reject"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              requestId: request.id,
                              status: 'rejected',
                            })
                          }
                        >
                          <CloseIcon />
                        </ActionIconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 