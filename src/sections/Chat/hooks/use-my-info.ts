import { useQuery } from '@tanstack/react-query';

import { getMyInfo } from 'src/services/member/member.service';
import type { Member } from 'src/services/member/member.types';

// ----------------------------------------------------------------------

type MyInfoData = Member & {
  memberIdx?: number;
  memberIndex?: number;
};

export function useMyInfo() {
  return useQuery({
    queryKey: ['myInfo'],
    queryFn: async () => {
      const response = await getMyInfo();
      const data = (response as any)?.data || response;
      return data as MyInfoData;
    },
    staleTime: 1000 * 60 * 5,
  });
}

