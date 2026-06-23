import { useAuth } from '../context/AuthContext';

export const ROLE_LEVEL: Record<string, number> = {
  ADMIN:      6,
  MANAGER:    5,
  SUPERVISOR: 4,
  STAFF:      3,
  PICKER:     2,
  AUDITOR:    1,
  VIEWER:     0,
};

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const level = ROLE_LEVEL[role] ?? 0;

  return {
    canViewUsers:          level >= 5,
    canViewApprovals:      level >= 3,
    canViewReports:        level >= 1,
    canViewAnalytics:      level >= 2,

    canEditWarehouses:     level >= 5,
    canEditZones:          level >= 5,
    canEditRacks:          level >= 5,
    canEditShelves:        level >= 5,
    canEditCategories:     level >= 5,
    canEditProducts:       level >= 5,
    canEditInventory:      level >= 3,
    canEditStockMovements: level >= 2,
    canApproveRequests:    level >= 4,
    canDeleteAny:          level >= 5,

    isReadOnly: role === 'AUDITOR' || role === 'VIEWER',
    role,
    level,
  };
}
