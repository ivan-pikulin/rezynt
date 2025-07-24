import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  TableSortLabel,
} from '@mui/material';
import { User } from 'shared/types/user';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from 'services';
import { useTranslation } from 'react-i18next';

type Order = 'asc' | 'desc';

export const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const [orderBy, setOrderBy] = useState<keyof User>('username');
  const [order, setOrder] = useState<Order>('asc');
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => userApi.getAllUsers(),
  });

  const handleRequestSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = React.useMemo(() => {
    const comparator = (a: User, b: User) => {
      if (orderBy === 'lastLogin') {
        const aTime = a[orderBy] ? new Date(a[orderBy]).getTime() : 0;
        const bTime = b[orderBy] ? new Date(b[orderBy]).getTime() : 0;
        return order === 'asc' ? aTime - bTime : bTime - aTime;
      }
      
      return order === 'asc'
        ? String(a[orderBy]).localeCompare(String(b[orderBy]))
        : String(b[orderBy]).localeCompare(String(a[orderBy]));
    };

    return [...users].sort(comparator);
  }, [users, order, orderBy]);

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) =>
      userApi.updateUserRole(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
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
                active={orderBy === 'lastLogin'}
                direction={orderBy === 'lastLogin' ? order : 'asc'}
                onClick={() => handleRequestSort('lastLogin')}
              >
                {t('admin.table.last_login')}
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'isAdmin'}
                direction={orderBy === 'isAdmin' ? order : 'asc'}
                onClick={() => handleRequestSort('isAdmin')}
              >
                {t('admin.table.role')}
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('admin.table.never')}
              </TableCell>
              <TableCell>
                <FormControl size="small">
                  <Select
                    value={user.isAdmin ? 'admin' : 'user'}
                    onChange={(e) =>
                      updateRoleMutation.mutate({
                        userId: user.id,
                        isAdmin: e.target.value === 'admin',
                      })
                    }
                  >
                    <MenuItem value="user">{t('admin.roles.user')}</MenuItem>
                    <MenuItem value="admin">{t('admin.roles.admin')}</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 