import { useQuery } from '@tanstack/react-query';
import { getOrganizations } from 'src/services/organization/organization.service';

// ----------------------------------------------------------------------

export function useAdminDashboardData() {
  const { data: organizationData, isLoading: organizationLoading } = useQuery({
    queryKey: ['adminDashboard', 'organizations'],
    queryFn: async () => {
      const response = await getOrganizations({ page: 1, pageSize: 1000 });
      return response;
    },
  });

  return {
    organizationData,
    organizationLoading,
  };
}
