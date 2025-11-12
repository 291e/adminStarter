// ----------------------------------------------------------------------

export type ChatRoom = {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  avatar?: string;
  isGroup?: boolean;
  members?: string[];
  type?: 'chatbot' | 'emergency' | 'normal' | 'group';
  organizationName?: string;
};

export type ChatMessage = {
  id: string;
  sender: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
};

export type ChatParticipant = {
  name: string;
  role: string;
};

// ----------------------------------------------------------------------

// 채팅방 목록 목업 데이터 (ShareToChatModal용)
export const mockShareChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: '안전관리팀',
    lastMessage: '안전 점검 일정 확인 부탁드립니다',
    lastMessageTime: '10:30',
    unreadCount: 3,
    isGroup: true,
    type: 'group',
    members: ['김철수', '이영희', '박민수'],
  },
  {
    id: '2',
    name: '김철수',
    lastMessage: '문서 확인했습니다',
    lastMessageTime: '09:15',
    type: 'normal',
  },
  {
    id: '3',
    name: '이영희',
    lastMessage: '검토 완료했습니다',
    lastMessageTime: '08:45',
    unreadCount: 1,
    type: 'normal',
  },
  {
    id: '4',
    name: '프로젝트팀',
    lastMessage: '회의 일정 공유',
    lastMessageTime: '어제',
    isGroup: true,
    type: 'group',
    members: ['김철수', '이영희', '박민수', '최지영'],
  },
];

// 채팅방 목록 목업 데이터 (Chat View용)
export const mockChatRooms: ChatRoom[] = [
  {
    id: 'chatbot',
    name: '챗봇',
    lastMessage: '',
    lastMessageTime: '',
    type: 'chatbot',
  },
  {
    id: 'emergency',
    name: '사고 발생 현황',
    lastMessage: '응급신고',
    lastMessageTime: '4:56 PM',
    unreadCount: 2,
    type: 'emergency',
    organizationName: '이편한자동화기술 물류팀',
  },
  {
    id: '1',
    name: '홍길동',
    lastMessage: '새로 온 분들께 안전 장비 착용법 알려줬습니다.',
    lastMessageTime: '4:56 PM',
    unreadCount: 2,
    type: 'normal',
  },
  {
    id: '2',
    name: '리처드',
    lastMessage: '새로 온 분들께 안전 장비 착용법 알려줬습니다.',
    lastMessageTime: '2025-08-27',
    type: 'normal',
  },
  {
    id: 'group1',
    name: '도르지 바르볼드, 응우옌우옌, 리처드',
    lastMessage: '새로 온 분들께 안전 장비 착용법 알려줬습니다.',
    lastMessageTime: '9:23 PM',
    unreadCount: 2,
    isGroup: true,
    type: 'group',
    members: ['도르지 바르볼드', '응우옌우옌', '리처드', '외 4명'],
  },
  {
    id: 'group2',
    name: '홍반장, 조지, 리처드',
    lastMessage: '작업자 분들은 신속히 이동 바랍니다.',
    lastMessageTime: '10:30 AM',
    isGroup: true,
    type: 'group',
    members: ['홍반장', '조지', '리처드'],
  },
  {
    id: 'group3',
    name: '조지, 홍반장',
    lastMessage: '아직 서명하지 않은분들 서명해주세요.',
    lastMessageTime: '어제',
    isGroup: true,
    type: 'group',
    members: ['조지', '홍반장'],
  },
  {
    id: 'group4',
    name: '도르지 바르볼드, 응우옌우옌, 리처드',
    lastMessage: '가스안전관련 교육이 있습니다.',
    lastMessageTime: '2025-08-27',
    isGroup: true,
    type: 'group',
    members: ['도르지 바르볼드', '응우옌우옌', '리처드', '외 4명'],
  },
];

// 메시지 목록 목업 데이터 (채팅방별)
export const mockChatMessagesByRoom: Record<string, ChatMessage[]> = {
  '1': [
    // 홍길동 채팅방
    {
      id: '1',
      sender: '홍길동',
      message: '안녕하세요. 오늘 작업 일정 확인 부탁드립니다.',
      timestamp: '9:00 AM',
    },
    {
      id: '3',
      sender: '나',
      message: '감사합니다.',
      timestamp: '9:02 AM',
      isOwn: true,
    },
  ],
  '2': [
    // 리처드 채팅방
    {
      id: '4',
      sender: '리처드',
      message: '안녕하세요.',
      timestamp: '10:00 AM',
    },
    {
      id: '5',
      sender: '리처드',
      message: '작업 일정 확인했습니다.',
      timestamp: '10:01 AM',
      isOwn: true,
    },
  ],
  group1: [
    // 그룹 채팅방 1
    {
      id: '6',
      sender: '도르지 바르볼드',
      message: '안전 장비 착용법 알려드립니다.',
      timestamp: '9:00 AM',
    },
    {
      id: '7',
      sender: '응우옌우옌',
      message: '감사합니다.',
      timestamp: '9:01 AM',
    },
  ],
  emergency: [
    // 사고 발생 현황 채팅방
    {
      id: '8',
      sender: '유승언',
      message: '응급신고',
      timestamp: '4:56 PM',
    },
  ],
  chatbot: [
    // 챗봇 채팅방
    {
      id: '9',
      sender: '챗봇',
      message: '안녕하세요. 무엇을 도와드릴까요?',
      timestamp: '9:00 AM',
    },
  ],
};

// 메시지 목록 목업 데이터 (기존 호환성 유지)
export const mockChatMessages: ChatMessage[] = mockChatMessagesByRoom['1'] || [];

// 참가자 목록 목업 데이터 (일반 채팅/그룹 채팅용)
export const mockChatParticipants: ChatParticipant[] = [
  { name: '유승언', role: 'CEO' },
  { name: '최유연', role: 'CTO' },
  { name: '김하루', role: '대리' },
  { name: '박하나', role: '팀장' },
  { name: '이철수', role: '사원' },
  { name: '정영희', role: '과장' },
  { name: '강민수', role: '대리' },
  { name: '윤지영', role: '주임' },
];

// 챗봇 참가자 목록 목업 데이터
export const mockChatbotParticipants: ChatParticipant[] = [{ name: '챗봇', role: 'chatbot' }];

// 사고 발생 현황 채팅 참가자 목록 목업 데이터 (응급 담당자들)
export const mockEmergencyParticipants: ChatParticipant[] = [
  { name: '유승언', role: '조직 관리자' },
  { name: '최유연', role: '관리 감독자' },
  { name: '김하루', role: '안전보건 담당자' },
  { name: '박하나', role: '안전보건 담당자' },
  { name: '이철수', role: '관리 감독자' },
];
