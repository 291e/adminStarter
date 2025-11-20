/**
 * 데이터베이스 스키마에 맞는 임시 데이터 생성
 *
 * 이 파일은 _db.ts에 정의된 스키마에 맞춰 실제 사용 가능한 목업 데이터를 생성합니다.
 */

import { fSub } from 'src/utils/format-time';
import { _mock } from './_mock';

import type {
  SuperAdmin,
  Company,
  CompanyBranch,
  Member,
  EducationReport,
  EducationRecord,
  EducationStandard,
  SafetySystem,
  SafetySystemItem,
  SafetySystemDocument,
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  Checklist,
  DisasterFactor,
  CodeSetting,
  ServiceSetting,
  ApiSetting,
  LibraryReport,
  RiskReport,
  SafetyReport,
  SharedDocument,
  PrioritySetting,
  LibraryCategory,
  CompanySubscription,
  CompanyInvitation,
  DocumentApproval,
  DocumentSignature,
  DocumentNotification,
  ChatRoomSharedDocument,
} from './_db';

// ============================================================================
// 1. Company (회사) 데이터 생성
// ============================================================================

export function generateCompanies(members: Member[], count: number = 5): Company[] {
  const creator = members[0];
  return Array.from({ length: count }, (_, index) => ({
    companyIdx: index + 1,
    companyName: _mock.companyNames(index),
    createdBy: creator?.memberIdx || null,
    updatedBy: creator?.memberIdx || null,
    companyCode: `COMP-${String(index + 1).padStart(3, '0')}`,
    businessNumber: `123-45-${String(index + 1).padStart(5, '0')}`,
    address: _mock.fullAddress(index),
    phone: _mock.phoneNumber(index),
    email: `company${index + 1}@example.com`,
    description: index % 3 === 0 ? '회사 설명' : null,
    memo: index % 5 === 0 ? '메모 내용' : null,
    isActive: 1,
    isAccidentFreeWorksite: index % 3 === 0 ? 1 : 0,
    accidentFreeStatus: index % 3 === 0 ? 'approved' : 'pending',
    accidentFreeCertifiedAt: index % 3 === 0 ? fSub({ days: (count - index) * 10 }) : null,
    accidentFreeExpiresAt: index % 3 === 0 ? fSub({ days: 365 }) : null,
    createAt: fSub({ days: (count - index) * 30 }),
    updateAt: fSub({ days: Math.floor(Math.random() * (count - index) * 30) }),
    deletedAt: null,
  }));
}

// ============================================================================
// 2. CompanyBranch (회사 지점) 데이터 생성
// ============================================================================

export function generateCompanyBranches(
  companies: Company[],
  members: Member[],
  count: number = 10
): CompanyBranch[] {
  const creator = members[0];
  return Array.from({ length: count }, (_, index) => {
    const companyIdx = companies[Math.floor(index / 2)].companyIdx;
    const hasManager1 = index % 2 === 0;
    const hasManager2 = index % 3 === 0;

    return {
      companyBranchIdx: index + 1,
      companyIdx,
      branchManager1MemberIdx: hasManager1
        ? members[index % members.length]?.memberIdx || null
        : null,
      branchManager2MemberIdx:
        hasManager2 && hasManager1
          ? members[(index + 1) % members.length]?.memberIdx || null
          : null,
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      companyBranchName: `${companies[Math.floor(index / 2)].companyName} ${
        index % 2 === 0 ? '본점' : `${Math.floor(index / 2) + 1}지점`
      }`,
      branchCode: `BR-${String(index + 1).padStart(3, '0')}`,
      address: _mock.fullAddress(index),
      phone: _mock.phoneNumber(index),
      email: `branch${index + 1}@example.com`,
      description: index % 3 === 0 ? '지점 설명' : null,
      memo: index % 5 === 0 ? '메모 내용' : null,
      isActive: 1,
      createAt: fSub({ days: (count - index) * 15 }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index) * 15) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 3. Member (멤버/사용자) 데이터 생성
// ============================================================================

export function generateMembers(
  companies: Company[],
  branches: CompanyBranch[],
  count: number = 20
): Member[] {
  const roles: Array<'admin' | 'member' | 'distributor' | 'agency' | 'dealer'> = [
    'admin',
    'member',
    'distributor',
    'agency',
    'dealer',
  ];

  return Array.from({ length: count }, (_, index) => {
    const companyIdx = companies[index % companies.length].companyIdx;
    const branch = branches[index % branches.length];
    const hasBranch = index % 2 === 0;
    const hasLastSignin = index % 3 !== 0;
    const hasLocation = index % 3 === 0;

    return {
      memberIdx: index + 1,
      memberId: `member${index + 1}`,
      companyIdx,
      companyBranchIdx: hasBranch ? branch.companyBranchIdx : null,
      memberRole: roles[index % roles.length],
      memberName: _mock.fullName(index),
      memberEmail: `member${index + 1}@example.com`,
      memberPhone: _mock.phoneNumber(index),
      memberStatus: index % 10 < 8 ? 'active' : 'inactive',
      memberAddress: _mock.fullAddress(index),
      memberAddressDetail: `${Math.floor(Math.random() * 999) + 1}호`,
      memberMemo: index % 5 === 0 ? '메모가 있는 멤버입니다.' : null,
      memberThumbnail: _mock.image.avatar(index),
      memberNameOrg: _mock.companyNames(index),
      memberLang: 'ko',
      password: 'hashed_password_here',
      duplicateSigninKey: index % 4 === 0 ? `key_${index}` : null,
      lastSigninAt: hasLastSignin ? fSub({ days: Math.floor(Math.random() * 7) }) : null,
      joinedAt: fSub({ days: (count - index) * 30 }), // 입사일 (이수율 계산용)
      deviceToken: index % 2 === 0 ? `device_token_${index}` : null,
      deviceGubun: (['web', 'ios', 'android', null] as const)[index % 4],
      memberlat: hasLocation ? 37.5665 + index * 0.01 : null,
      memberlng: hasLocation ? 126.978 + index * 0.01 : null,
      lastLocationUpdateAt: hasLocation ? fSub({ hours: Math.floor(Math.random() * 24) }) : null,
      loginAttempts: Math.floor(Math.random() * 3),
      loginBlockedUntil: null,
      createdBy: index === 0 ? null : index > 0 ? index : null, // 첫 번째 멤버는 null, 나머지는 이전 멤버 참조
      updatedBy: index > 0 ? index : null,
      description: index % 5 === 0 ? '멤버 설명' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 4. EducationReport (교육 리포트) 데이터 생성
// ============================================================================

export function generateEducationReports(
  members: Member[],
  companies: Company[],
  count: number = 20
): EducationReport[] {
  const positions = ['팀장', '과장', '대리', '주임', '사원'];
  const departments = ['경영전략팀', '안전관리팀', '인사팀', '재무팀', '영업팀'];
  const roles = ['안전보건 담당자', '근로자', '관리감독자', '조직관리자', '안전관리자'];

  return Array.from({ length: count }, (_, index) => {
    const member = members[index % members.length];
    const creator = members[Math.floor(Math.random() * members.length)];
    const mandatoryEducation = Math.floor(Math.random() * 40) + 10;
    const regularEducation = Math.floor(Math.random() * 40) + 10;
    const totalEducation = mandatoryEducation + regularEducation;
    const standardEducation = Math.floor(Math.random() * 200) + 50;
    const completionRate = Math.min(Math.round((totalEducation / standardEducation) * 100), 100);

    return {
      id: `education-report-${index + 1}`,
      memberIdx: member.memberIdx,
      companyIdx: member.companyIdx,
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      organizationName: companies[member.companyIdx - 1]?.companyName || '이편한 자동화기술',
      name: member.memberName,
      position: positions[index % positions.length],
      department: departments[index % departments.length],
      role: roles[index % roles.length],
      mandatoryEducation,
      regularEducation,
      totalEducation,
      standardEducation,
      completionRate,
      description: index % 5 === 0 ? '교육 리포트 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 5. EducationRecord (교육 기록) 데이터 생성
// ============================================================================

export function generateEducationRecords(
  members: Member[],
  educationReports: EducationReport[],
  count: number = 50
): EducationRecord[] {
  const educationNames = [
    '아크릴로니트릴_10분 작업 안전',
    '화학물질 안전관리 교육',
    '건설현장 안전보건 교육',
    '전기안전 작업 교육',
    '소방안전 교육',
  ];
  const methods: Array<'집체' | '온라인'> = ['집체', '온라인'];
  const times = [30, 60, 90, 120, 150, 180];

  return Array.from({ length: count }, (_, index) => {
    const member = members[index % members.length];
    const report = educationReports[index % educationReports.length];
    const creator = members[Math.floor(Math.random() * members.length)];
    const method = methods[index % methods.length];
    const educationName = educationNames[index % educationNames.length];
    const educationTime = times[index % times.length];
    const hasFile = index % 3 !== 0;

    return {
      id: `education-record-${index + 1}`,
      memberIdx: member.memberIdx,
      educationReportId: report.id,
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      method,
      educationName,
      educationTime,
      educationType: index % 2 === 0 ? 'mandatory' : 'regular',
      educationDate: fSub({ days: count - index }).split('T')[0],
      fileName: hasFile ? `교육자료_${index + 1}.pdf` : null,
      fileUrl: hasFile ? `/files/education/${index + 1}.pdf` : null,
      description: index % 5 === 0 ? '교육 기록 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 6. SafetySystem (안전 시스템 그룹) 데이터 생성
// ============================================================================

export function generateSafetySystems(members: Member[]): SafetySystem[] {
  const creator = members[0];
  const systems = [
    { safetyIdx: 1, systemName: '위험요인파악' },
    { safetyIdx: 2, systemName: '위험요인 제거·대체 및 통제' },
    { safetyIdx: 3, systemName: '경영자 리더십' },
    { safetyIdx: 4, systemName: '근로자 참여' },
    { safetyIdx: 5, systemName: '비상조치계획 수립' },
    { safetyIdx: 6, systemName: '도급·용역·위탁 시 안전보건 확보' },
    { safetyIdx: 7, systemName: '평가 및 개선' },
  ];

  return systems.map((system, index) => ({
    ...system,
    createdBy: creator?.memberIdx || null,
    updatedBy: creator?.memberIdx || null,
    description: `${system.systemName}에 대한 설명`,
    order: index + 1,
    isActive: 1,
    createAt: fSub({ days: (systems.length - index) * 30 }),
    updateAt: fSub({ days: Math.floor(Math.random() * (systems.length - index) * 30) }),
    deletedAt: null,
  }));
}

// ============================================================================
// 7. SafetySystemItem (안전 시스템 아이템) 데이터 생성
// ============================================================================

export function generateSafetySystemItems(
  systems: SafetySystem[],
  members: Member[]
): SafetySystemItem[] {
  const items: SafetySystemItem[] = [];
  const creator = members[0];

  systems.forEach((system) => {
    const itemCount = system.safetyIdx === 1 ? 5 : system.safetyIdx === 2 ? 3 : 2;

    for (let itemNumber = 1; itemNumber <= itemCount; itemNumber++) {
      items.push({
        safetyIdx: system.safetyIdx,
        itemNumber,
        createdBy: creator?.memberIdx || null,
        updatedBy: creator?.memberIdx || null,
        documentName: `${system.systemName} - 항목 ${itemNumber}`,
        documentCount: 5,
        cycle: itemNumber === 1 ? 5 : 1,
        cycleUnit: itemNumber === 1 ? 'year' : 'half',
        lastWrittenAt: fSub({ days: Math.floor(Math.random() * 30) }),
        status: (['normal', 'always', 'approaching', 'overdue'] as const)[
          Math.floor(Math.random() * 4)
        ],
        description: `${system.systemName} - 항목 ${itemNumber}에 대한 설명`,
        memo: itemNumber % 3 === 0 ? '메모 내용' : null,
        createAt: fSub({ days: Math.floor(Math.random() * 30) }),
        updateAt: fSub({ days: Math.floor(Math.random() * 30) }),
        deletedAt: null,
      });
    }
  });

  return items;
}

// ============================================================================
// 8. SafetySystemDocument (안전 시스템 문서) 데이터 생성
// ============================================================================

export function generateSafetySystemDocuments(
  items: SafetySystemItem[],
  members: Member[]
): SafetySystemDocument[] {
  const documents: SafetySystemDocument[] = [];
  const organizations = ['이편한자동화기술', '삼성전자', 'LG전자', '현대자동차', 'SK하이닉스'];

  items.forEach((item) => {
    for (let docNum = 1; docNum <= item.documentCount; docNum++) {
      const creator = members[Math.floor(Math.random() * members.length)];
      const date = new Date();
      date.setDate(date.getDate() - docNum);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');

      documents.push({
        safetyIdx: item.safetyIdx,
        itemNumber: item.itemNumber,
        documentNumber: docNum,
        createdBy: creator.memberIdx,
        updatedBy: creator.memberIdx,
        uploadedBy: creator.memberIdx,
        sequence: item.safetyIdx * 1000 + item.itemNumber * 100 + docNum,
        registeredAt: fSub({ days: docNum }),
        organizationName: organizations[(docNum - 1) % organizations.length],
        documentName: `${item.safetyIdx}-${item.itemNumber} 문서 ${docNum}`,
        writtenAt: `${y}-${m}-${d}`,
        approvalDeadline: `${y}-${m}-${String(Number(d) + 30).padStart(2, '0')}`,
        completionRate: {
          removal: Math.floor(Math.random() * 50) + 10,
          engineering: Math.floor(Math.random() * 50) + 10,
        },
        isPublished: docNum % 3 === 0 ? 1 : 0,
        publishedAt: docNum % 3 === 0 ? fSub({ days: docNum - 1 }) : null,
        fileName: `document-${item.safetyIdx}-${item.itemNumber}-${docNum}.pdf`,
        fileUrl: `/files/documents/${item.safetyIdx}-${item.itemNumber}-${docNum}.pdf`,
        fileSize: Math.floor(Math.random() * 1000000) + 100000,
        description: docNum % 3 === 0 ? '문서 설명' : null,
        memo: docNum % 5 === 0 ? '메모 내용' : null,
        createAt: fSub({ days: docNum }),
        updateAt: fSub({ days: Math.floor(Math.random() * docNum) }),
        deletedAt: null,
      });
    }
  });

  return documents;
}

// ============================================================================
// 9. ChatRoom (채팅방) 데이터 생성
// ============================================================================

export function generateChatRooms(
  members: Member[],
  companies: Company[],
  count: number = 10
): ChatRoom[] {
  const creator = members[0];
  const rooms: ChatRoom[] = [
    {
      id: 'chatbot',
      name: '챗봇',
      type: 'chatbot',
      isGroup: 0,
      createdBy: creator?.memberIdx || null,
      organizationIdx: companies[0]?.companyIdx || null,
      emergencyRoomCompanyIdx: null,
      organizationName: null,
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: null,
      avatar: null,
      description: null,
      isActive: 1,
      createAt: fSub({ days: 100 }),
      updateAt: fSub({ days: 100 }),
      deletedAt: null,
    },
    {
      id: 'emergency',
      name: '사고 발생 현황',
      type: 'emergency',
      isGroup: 0,
      createdBy: creator?.memberIdx || null,
      organizationIdx: companies[0]?.companyIdx || null,
      emergencyRoomCompanyIdx: companies[0]?.companyIdx || null,
      organizationName: '이편한자동화기술 물류팀',
      lastMessage: '응급신고',
      lastMessageAt: fSub({ hours: 2 }),
      unreadCount: 2,
      avatar: null,
      description: '응급 상황 보고 채팅방',
      isActive: 1,
      createAt: fSub({ days: 50 }),
      updateAt: fSub({ hours: 2 }),
      deletedAt: null,
    },
  ];

  for (let i = 1; i <= count - 2; i++) {
    const isGroup = i % 3 === 0;
    rooms.push({
      id: `chat-room-${i}`,
      name: isGroup ? `그룹 채팅 ${i}` : _mock.fullName(i),
      type: isGroup ? 'group' : 'normal',
      isGroup: isGroup ? 1 : 0,
      createdBy: members[i % members.length]?.memberIdx || null,
      organizationIdx: isGroup ? companies[0]?.companyIdx || null : null,
      emergencyRoomCompanyIdx: null,
      organizationName: isGroup ? '이편한자동화기술' : null,
      lastMessage: `메시지 ${i}`,
      lastMessageAt: fSub({ hours: i }),
      unreadCount: i % 2 === 0 ? Math.floor(Math.random() * 5) : null,
      avatar: null,
      description: isGroup ? `그룹 채팅 ${i} 설명` : null,
      isActive: 1,
      createAt: fSub({ days: count - i }),
      updateAt: fSub({ hours: i }),
      deletedAt: null,
    });
  }

  return rooms;
}

// ============================================================================
// 10. ChatMessage (채팅 메시지) 데이터 생성
// ============================================================================

export function generateChatMessages(
  rooms: ChatRoom[],
  members: Member[],
  count: number = 50
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  rooms.forEach((room) => {
    const messageCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < messageCount; i++) {
      const sender = members[Math.floor(Math.random() * members.length)];
      const messageIndex = messages.length;
      messages.push({
        id: `chat-message-${messageIndex + 1}`,
        chatRoomId: room.id,
        senderMemberIdx: sender.memberIdx,
        sharedDocumentId: null,
        sender: sender.memberName,
        senderAvatar: sender.memberThumbnail || null,
        message: `메시지 내용 ${messageIndex + 1}`,
        messageType: 'text',
        signalType:
          room.type === 'emergency' && Math.random() > 0.7
            ? (['risk', 'rescue', 'evacuation'] as const)[Math.floor(Math.random() * 3)]
            : null,
        attachments: null,
        isRead: Math.random() > 0.3 ? 1 : 0,
        isOwn: Math.random() > 0.5 ? 1 : 0,
        createAt: fSub({ hours: messageIndex }),
        updateAt: fSub({ hours: messageIndex }),
        deletedAt: null,
      });
    }
  });

  return messages.slice(0, count);
}

// ============================================================================
// 11. ChatParticipant (채팅 참가자) 데이터 생성
// ============================================================================

export function generateChatParticipants(rooms: ChatRoom[], members: Member[]): ChatParticipant[] {
  const participants: ChatParticipant[] = [];

  rooms.forEach((room) => {
    const participantCount = room.isGroup ? Math.floor(Math.random() * 5) + 2 : 1;
    const selectedMembers = members.sort(() => Math.random() - 0.5).slice(0, participantCount);

    selectedMembers.forEach((member, memberIndex) => {
      const inviter = members[Math.floor(Math.random() * members.length)];
      participants.push({
        id: `chat-participant-${participants.length + 1}`,
        chatRoomId: room.id,
        memberIdx: member.memberIdx,
        invitedBy: memberIndex === 0 ? null : inviter.memberIdx, // 첫 번째는 생성자
        role: memberIndex === 0 ? 'admin' : 'member',
        joinedAt: fSub({ days: Math.floor(Math.random() * 30) }),
        leftAt: null,
        isRead: Math.random() > 0.3 ? 1 : 0,
        lastReadAt: Math.random() > 0.3 ? fSub({ hours: Math.floor(Math.random() * 24) }) : null,
        isActive: 1,
        createAt: fSub({ days: Math.floor(Math.random() * 30) }),
        updateAt: fSub({ days: Math.floor(Math.random() * 30) }),
        deletedAt: null,
      });
    });
  });

  return participants;
}

// ============================================================================
// 12. Checklist (체크리스트) 데이터 생성
// ============================================================================

export function generateChecklists(members: Member[], count: number = 20): Checklist[] {
  const industries = ['manufacturing', 'transport', 'forestry', 'building', 'sanitation'];
  const highRiskWorks = [
    '기계·설비 정비, 수리, 교체, 청소 등 비정형 작업',
    '크레인 취급 작업 (이동식크레인 포함)',
    '고소작업 (2m 이상)',
    '전기 작업 (전기설비의 설치·보수·점검)',
    '용접·절단 작업',
  ];

  return Array.from({ length: count }, (_, index) => {
    const creator = members[index % members.length];
    return {
      id: `checklist-${index + 1}`,
      order: count - index,
      industry: industries[index % industries.length],
      highRiskWork: highRiskWorks[index % highRiskWorks.length],
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      status: index % 10 < 8 ? 'active' : 'inactive',
      description: index % 5 === 0 ? '체크리스트 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 13. DisasterFactor (재해 유발 요인) 데이터 생성
// ============================================================================

export function generateDisasterFactors(
  checklists: Checklist[],
  members: Member[]
): DisasterFactor[] {
  const factors: DisasterFactor[] = [];
  const factorNames = ['협착', '절단', '끼임', '추락', '충돌', '감전', '화상'];

  checklists.forEach((checklist, checklistIndex) => {
    const creator = members[checklistIndex % members.length];
    const factorCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < factorCount; i++) {
      factors.push({
        id: `disaster-factor-${factors.length + 1}`,
        checklistId: checklist.id,
        createdBy: creator.memberIdx,
        updatedBy: creator.memberIdx,
        factorName: factorNames[Math.floor(Math.random() * factorNames.length)],
        description: null,
        order: i + 1,
        isActive: 1,
        createAt: fSub({ days: checklistIndex }),
        updateAt: fSub({ days: checklistIndex }),
        deletedAt: null,
      });
    }
  });

  return factors;
}

// ============================================================================
// 14. CodeSetting (코드 설정) 데이터 생성
// ============================================================================

export function generateCodeSettings(members: Member[], count: number = 20): CodeSetting[] {
  const codes = ['PRS', 'CRN', 'LFT', 'CNV', 'WLD'];
  const names = ['프레스', '크레인', '리프트', '컨베이어', '용접기'];

  return Array.from({ length: count }, (_, index) => {
    const creator = members[index % members.length];
    const categoryType: 'machine' | 'hazard' = index % 2 === 0 ? 'machine' : 'hazard';
    const codeIndex = index % codes.length;

    if (categoryType === 'machine') {
      return {
        id: `code-setting-${index + 1}`,
        order: count - index,
        code: codes[codeIndex],
        name: names[codeIndex],
        categoryType,
        status: index % 10 < 8 ? 'active' : 'inactive',
        createdBy: creator.memberIdx,
        updatedBy: creator.memberIdx,
        inspectionCycle: '3개월',
        protectiveDevices: ['안전장치', '비상정지장치'],
        riskTypes: ['협착', '절단'],
        description: index % 5 === 0 ? '코드 설정 설명' : null,
        memo: index % 10 === 0 ? '메모 내용' : null,
        createAt: fSub({ days: count - index }),
        updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
        deletedAt: null,
      };
    }

    return {
      id: `code-setting-${index + 1}`,
      order: count - index,
      code: `HAZ-${codeIndex}`,
      name: '유해인자',
      categoryType,
      status: index % 10 < 8 ? 'active' : 'inactive',
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      category: '물리적 인자',
      formAndType: '가스',
      location: '1층 작업장',
      exposureRisk: '높음',
      organizationName: '이편한자동화기술',
      description: index % 5 === 0 ? '코드 설정 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 15. ServiceSetting (서비스 설정) 데이터 생성
// ============================================================================

export function generateServiceSettings(members: Member[], count: number = 10): ServiceSetting[] {
  const serviceNames = [
    '안전해YOU 프리미엄',
    '안전해YOU 플러스',
    '안전해YOU 스탠다드',
    '안전해YOU 라이트',
    '안전해YOU 스타트',
  ];
  const periods = ['1개월', '3개월', '6개월', '12개월'];
  const fees = [150000, 100000, 70000, 30000, 0];

  return Array.from({ length: count }, (_, index) => {
    const creator = members[index % members.length];
    return {
      id: `service-setting-${index + 1}`,
      order: count - index,
      serviceName: serviceNames[index % serviceNames.length],
      servicePeriod: periods[index % periods.length],
      memberCount: Math.floor(Math.random() * 50) + (index % 5) * 10,
      monthlyFee: fees[index % fees.length],
      subscriptions: Math.floor(Math.random() * 20) + 1,
      status: index % 10 < 8 ? 'active' : 'inactive',
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      description: index % 5 === 0 ? '서비스 설정 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 16. ApiSetting (API 설정) 데이터 생성
// ============================================================================

export function generateApiSettings(members: Member[], count: number = 10): ApiSetting[] {
  const names = [
    'KOSHA 유해물질 API',
    '산업안전보건공단 API',
    '화학물질안전원 API',
    '환경부 대기질 API',
    '국토교통부 건설안전 API',
  ];
  const providers = ['KOSHA', '산업안전보건공단', '화학물질안전원', '환경부', '국토교통부'];

  return Array.from({ length: count }, (_, index) => {
    const creator = members[index % members.length];
    const apiIndex = index % names.length;
    return {
      id: `api-setting-${index + 1}`,
      order: count - index,
      name: names[apiIndex],
      provider: providers[apiIndex],
      apiKey: index % 3 === 0 ? `encrypted_api_key_${index}` : null,
      keyStatus: index % 5 === 3 ? 'abnormal' : 'normal',
      lastInterlockedAt: index % 2 === 0 ? fSub({ days: count - index - 1 }) : null,
      expiresAt: index % 2 === 0 ? fSub({ days: count - index + 30 }).split('T')[0] : null,
      status: index % 10 < 8 ? 'active' : 'inactive',
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      description: index % 5 === 0 ? 'API 설정 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 17. LibraryReport (라이브러리 리포트) 데이터 생성
// ============================================================================

export function generateLibraryReports(
  categories: LibraryCategory[],
  members: Member[],
  count: number = 20
): LibraryReport[] {
  const titles = [
    '식품제조용 혼합기_10분작업안전',
    '아크릴로니트릴_10분작업안전',
    '6.개인정보보호교육',
    '화학물질 안전관리 교육',
    '건설현장 안전보건 교육',
  ];
  const playbackTimes = ['16:24:22', '10:30:00', '09:15:45', '12:45:30', '08:20:15'];

  return Array.from({ length: count }, (_, index) => {
    const creator = members[index % members.length];
    const companyIdx = creator.companyIdx;
    return {
      id: `library-report-${index + 1}`,
      categoryId: categories[index % categories.length]?.id || null,
      order: count - index,
      title: titles[index % titles.length],
      organizationName: '이편한자동화기술',
      category: categories[index % categories.length]?.name || '기타',
      playbackTime: playbackTimes[index % playbackTimes.length],
      hasSubtitles: index % 3 !== 0 ? 1 : 0,
      visibilityType: index % 2 === 0 ? 'public' : 'organization',
      hiddenByCompanyIdx: index % 5 === 0 ? JSON.stringify([companyIdx + 1]) : null,
      status: index % 10 < 8 ? 'active' : 'inactive',
      isActive: 1,
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      uploadedBy: creator.memberIdx,
      createdByCompanyIdx: companyIdx,
      fileUrl: `/files/library/${index + 1}.mp4`,
      thumbnailUrl: `/files/library/thumbnails/${index + 1}.jpg`,
      viewCount: Math.floor(Math.random() * 100),
      description: index % 5 === 0 ? '라이브러리 리포트 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 18. LibraryCategory (라이브러리 카테고리) 데이터 생성
// ============================================================================

export function generateLibraryCategories(members: Member[]): LibraryCategory[] {
  const names = [
    'TBM 작업안전',
    '사무직 외 근로자',
    '사무직 근로자',
    '물질안전보건 교육',
    '개인정보보호 교육',
  ];
  const creator = members[0];

  return names.map((name, index) => ({
    id: `library-category-${index + 1}`,
    name,
    isActive: 1,
    order: index + 1,
    createdBy: creator?.memberIdx || null,
    updatedBy: creator?.memberIdx || null,
    createdByCompanyIdx: index === 0 ? null : creator?.companyIdx || null, // 첫 번째는 슈퍼어드민이 생성
    description: `${name} 카테고리 설명`,
    createAt: fSub({ days: (names.length - index) * 10 }),
    updateAt: fSub({ days: Math.floor(Math.random() * (names.length - index) * 10) }),
    deletedAt: null,
  }));
}

// ============================================================================
// 19. RiskReport (위험 리포트) 데이터 생성
// ============================================================================

export function generateRiskReports(
  members: Member[],
  companies: Company[],
  count: number = 20
): RiskReport[] {
  const titles = [
    '포크레인이 기둥을 무너뜨렸습니다.',
    '전기선이 절단되었습니다.',
    '화재 진압이 완료되었습니다.',
    '가스 누출이 감지 되었습니다.',
    '건물 외벽이 붕괴 되었습니다.',
  ];
  const locations = [
    '대전광역시 유성구 유성대로 99길99',
    '서울특별시 강남구 테헤란로 123',
    '부산광역시 해운대구 해운대해변로 456',
    '인천광역시 남동구 인주대로 789',
  ];
  const contents = ['포크레인 사고현장', '전기 사고 발생', '화재 진압 완료', '가스 누출 감지'];

  return Array.from({ length: count }, (_, index) => {
    const reporter = members[Math.floor(Math.random() * members.length)];
    const author = members[Math.floor(Math.random() * members.length)];
    const confirmer = index % 2 === 1 ? members[Math.floor(Math.random() * members.length)] : null;
    const isConfirmed = index % 2 === 1;

    return {
      id: `risk-report-${index + 1}`,
      reporterMemberIdx: reporter.memberIdx,
      authorMemberIdx: author.memberIdx,
      companyIdx: reporter.companyIdx,
      chatRoomId: index % 3 === 0 ? 'emergency' : null,
      sourceType: index % 3 === 0 ? 'chat' : 'direct',
      signalType: index % 3 === 0 ? (['risk', 'rescue', 'evacuation'] as const)[index % 3] : null,
      confirmedBy: confirmer?.memberIdx || null,
      title: titles[index % titles.length],
      location: locations[index % locations.length],
      content: contents[index % contents.length],
      imageUrl: `/assets/images/mock/travel/travel-${(index % 8) + 1}.webp`,
      imageUrls:
        index % 3 === 0 ? [`/assets/images/mock/travel/travel-${(index % 8) + 1}.webp`] : null,
      status: isConfirmed ? 'confirmed' : 'unconfirmed',
      confirmedAt: isConfirmed ? fSub({ days: count - index - 1 }) : null,
      description: index % 5 === 0 ? '위험 리포트 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 20. SafetyReport (안전 리포트) 데이터 생성
// ============================================================================

export function generateSafetyReports(members: Member[], count: number = 20): SafetyReport[] {
  const documentTypes = ['정책/방침', '매뉴얼', '가이드라인', '안전규정', '교육자료'];
  const documentNames = [
    '안전관리 정책서',
    '현장 안전 매뉴얼',
    '작업 안전 가이드라인',
    '비상대응 매뉴얼',
    '안전 교육 자료집',
  ];

  return Array.from({ length: count }, (_, index) => {
    const creator = members[index % members.length];
    const publisher = index % 3 === 0 ? members[Math.floor(Math.random() * members.length)] : null;
    return {
      id: `safety-report-${index + 1}`,
      order: 1000 + index + 1,
      documentType: documentTypes[index % documentTypes.length],
      documentName: documentNames[index % documentNames.length],
      documentWrittenAt: fSub({ days: count - index + 90 }).split('T')[0],
      publishedAt: publisher ? fSub({ days: count - index }) : null,
      viewCount: Math.floor(Math.random() * 100) + 1,
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      publishedBy: publisher?.memberIdx || null,
      fileUrl: `/files/safety-reports/${index + 1}.pdf`,
      description: index % 5 === 0 ? '안전 리포트 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      isActive: 1,
      createAt: fSub({ days: count - index + 90 }),
      updateAt: fSub({ days: count - index }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 21. SharedDocument (공유 문서) 데이터 생성
// ============================================================================

export function generateSharedDocuments(
  members: Member[],
  safetySystemDocuments: SafetySystemDocument[],
  prioritySettings: PrioritySetting[],
  count: number = 20
): SharedDocument[] {
  const priorities: Array<'urgent' | 'important' | 'reference'> = [
    'urgent',
    'important',
    'reference',
  ];

  return Array.from({ length: count }, (_, index) => {
    const member = members[index % members.length];
    const creator = members[Math.floor(Math.random() * members.length)];
    const doc = safetySystemDocuments[index % safetySystemDocuments.length];
    const priority = priorities[index % priorities.length];
    const prioritySetting =
      prioritySettings.find((p) => p.labelType === priority) || prioritySettings[0];

    return {
      id: `shared-document-${index + 1}`,
      safetySystemDocumentId: `${doc.safetyIdx}-${doc.itemNumber}-${doc.documentNumber}`,
      memberIdx: member.memberIdx,
      createdBy: creator.memberIdx,
      updatedBy: creator.memberIdx,
      priorityId: prioritySetting?.id || null,
      sharedByCompanyIdx: member.companyIdx,
      priority,
      documentName: doc.documentName,
      documentWrittenAt: doc.writtenAt,
      isPublic: index % 2 === 0 ? 1 : 0,
      fileName: `document-${index + 1}.pdf`,
      fileUrl: `/files/documents/${index + 1}.pdf`,
      fileSize: Math.floor(Math.random() * 1000000) + 100000,
      viewCount: Math.floor(Math.random() * 100),
      downloadCount: Math.floor(Math.random() * 50),
      description: index % 5 === 0 ? '공유 문서 설명' : null,
      memo: index % 10 === 0 ? '메모 내용' : null,
      createAt: fSub({ days: count - index }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index)) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 22. PrioritySetting (중요도 설정) 데이터 생성
// ============================================================================

// ============================================================================
// 0. SuperAdmin (슈퍼어드민) 데이터 생성
// ============================================================================

export function generateSuperAdmins(members: Member[], count: number = 2): SuperAdmin[] {
  const creator = members[0];
  return Array.from({ length: count }, (_, index) => ({
    superAdminIdx: index + 1,
    memberIdx: members[index]?.memberIdx || index + 1,
    createdBy: creator?.memberIdx || null,
    updatedBy: creator?.memberIdx || null,
    isActive: 1,
    description: index === 0 ? '슈퍼어드민 계정' : null,
    createAt: fSub({ days: 365 }),
    updateAt: fSub({ days: 365 }),
    deletedAt: null,
  }));
}

// ============================================================================
// 5-1. EducationStandard (교육 이수 기준 시간) 데이터 생성
// ============================================================================

export function generateEducationStandards(members: Member[]): EducationStandard[] {
  const creator = members[0];
  const standards: Array<{
    role: string;
    workType: 'production' | 'office' | null;
    standardHours: number;
    period: 'year' | 'quarter';
    isAccidentFreeReduction: 0 | 1;
    reductionRate: number;
  }> = [
    {
      role: '조직관리자',
      workType: null,
      standardHours: 480,
      period: 'year',
      isAccidentFreeReduction: 1,
      reductionRate: 10,
    },
    {
      role: '관리감독자',
      workType: null,
      standardHours: 960,
      period: 'year',
      isAccidentFreeReduction: 1,
      reductionRate: 10,
    },
    {
      role: '안전보건 담당자',
      workType: null,
      standardHours: 1440,
      period: 'year',
      isAccidentFreeReduction: 1,
      reductionRate: 10,
    },
    {
      role: '근로자',
      workType: 'production',
      standardHours: 360,
      period: 'quarter',
      isAccidentFreeReduction: 1,
      reductionRate: 10,
    },
    {
      role: '근로자',
      workType: 'office',
      standardHours: 180,
      period: 'quarter',
      isAccidentFreeReduction: 1,
      reductionRate: 10,
    },
  ];

  return standards.map((std, index) => ({
    id: `education-standard-${index + 1}`,
    role: std.role,
    workType: std.workType,
    standardHours: std.standardHours,
    period: std.period,
    isAccidentFreeReduction: std.isAccidentFreeReduction,
    reductionRate: std.reductionRate,
    isActive: 1,
    order: index + 1,
    createdBy: creator?.memberIdx || null,
    updatedBy: creator?.memberIdx || null,
    description: `${std.role} ${std.workType || ''} 교육 기준 시간`,
    createAt: fSub({ days: 365 }),
    updateAt: fSub({ days: 365 }),
    deletedAt: null,
  }));
}

// ============================================================================
// 23. CompanySubscription (조직 구독 서비스) 데이터 생성
// ============================================================================

export function generateCompanySubscriptions(
  companies: Company[],
  serviceSettings: ServiceSetting[],
  members: Member[],
  count: number = 10
): CompanySubscription[] {
  const creator = members[0];
  return Array.from({ length: count }, (_, index) => {
    const company = companies[index % companies.length];
    const service = serviceSettings[index % serviceSettings.length];
    const isActive = index % 3 !== 0;

    return {
      id: `company-subscription-${index + 1}`,
      companyIdx: company.companyIdx,
      serviceSettingId: service.id,
      billingKey: isActive ? `billing_key_${index + 1}` : null,
      isDefaultCard: index % 2 === 0 ? 1 : 0,
      subscriptionStatus: isActive ? 'active' : 'cancelled',
      subscribedAt: fSub({ days: (count - index) * 30 }),
      cancelledAt: isActive ? null : fSub({ days: (count - index) * 15 }),
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      description: index % 5 === 0 ? '구독 서비스 설명' : null,
      createAt: fSub({ days: (count - index) * 30 }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index) * 30) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 24. CompanyInvitation (조직원 초대) 데이터 생성
// ============================================================================

export function generateCompanyInvitations(
  companies: Company[],
  members: Member[],
  count: number = 10
): CompanyInvitation[] {
  const creator = members[0];
  return Array.from({ length: count }, (_, index) => {
    const company = companies[index % companies.length];
    const inviter = members[index % members.length];
    const isUsed = index % 3 === 0;

    return {
      id: `company-invitation-${index + 1}`,
      companyIdx: company.companyIdx,
      invitedBy: inviter.memberIdx,
      inviteToken: `invite_token_${index + 1}_${Date.now()}`,
      invitedEmail: `invite${index + 1}@example.com`,
      expiresAt: fSub({ days: 7 }),
      acceptedAt: isUsed ? fSub({ days: (count - index) * 2 }) : null,
      isUsed: isUsed ? 1 : 0,
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      description: index % 5 === 0 ? '초대 설명' : null,
      createAt: fSub({ days: (count - index) * 5 }),
      updateAt: fSub({ days: Math.floor(Math.random() * (count - index) * 5) }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 25. DocumentApproval (문서 결재 정보) 데이터 생성
// ============================================================================

export function generateDocumentApprovals(
  safetySystemDocuments: SafetySystemDocument[],
  members: Member[],
  count: number = 30
): DocumentApproval[] {
  const creator = members[0];
  const approvals: DocumentApproval[] = [];

  safetySystemDocuments.forEach((doc, docIndex) => {
    const approvalCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < approvalCount; i++) {
      const targetMember = members[Math.floor(Math.random() * members.length)];
      const approvalStatus = i === 0 && docIndex % 2 === 0 ? 'approved' : 'pending';
      approvals.push({
        id: `document-approval-${approvals.length + 1}`,
        documentId: `${doc.safetyIdx}-${doc.itemNumber}-${doc.documentNumber}`,
        targetMemberIdx: targetMember.memberIdx,
        approvalType: i % 2 === 0 ? 'sequential' : 'parallel',
        approvalOrder: i + 1,
        approvalStatus,
        approvedAt: approvalStatus === 'approved' ? fSub({ days: docIndex }) : null,
        signatureData:
          approvalStatus === 'approved' ? `signature_data_${approvals.length + 1}` : null,
        createdBy: creator?.memberIdx || null,
        updatedBy: creator?.memberIdx || null,
        description: docIndex % 5 === 0 ? '결재 정보 설명' : null,
        createAt: fSub({ days: docIndex }),
        updateAt: fSub({ days: docIndex }),
        deletedAt: null,
      });
    }
  });

  return approvals.slice(0, count);
}

// ============================================================================
// 26. DocumentSignature (문서 서명 정보) 데이터 생성
// ============================================================================

export function generateDocumentSignatures(
  safetySystemDocuments: SafetySystemDocument[],
  members: Member[],
  count: number = 30
): DocumentSignature[] {
  const creator = members[0];
  const signatures: DocumentSignature[] = [];

  safetySystemDocuments.forEach((doc, docIndex) => {
    const signatureCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < signatureCount; i++) {
      const targetMember = members[Math.floor(Math.random() * members.length)];
      const signatureStatus = i === 0 && docIndex % 3 === 0 ? 'signed' : 'pending';
      signatures.push({
        id: `document-signature-${signatures.length + 1}`,
        documentId: `${doc.safetyIdx}-${doc.itemNumber}-${doc.documentNumber}`,
        targetMemberIdx: targetMember.memberIdx,
        signatureType: i % 2 === 0 ? 'approval' : 'signature',
        signatureStatus,
        requestedAt: fSub({ days: docIndex }),
        signedAt: signatureStatus === 'signed' ? fSub({ days: docIndex - 1 }) : null,
        signatureData:
          signatureStatus === 'signed' ? `signature_data_${signatures.length + 1}` : null,
        createdBy: creator?.memberIdx || null,
        updatedBy: creator?.memberIdx || null,
        description: docIndex % 5 === 0 ? '서명 정보 설명' : null,
        createAt: fSub({ days: docIndex }),
        updateAt: fSub({ days: docIndex }),
        deletedAt: null,
      });
    }
  });

  return signatures.slice(0, count);
}

// ============================================================================
// 27. DocumentNotification (문서 알림 발송 이력) 데이터 생성
// ============================================================================

export function generateDocumentNotifications(
  safetySystemDocuments: SafetySystemDocument[],
  members: Member[],
  count: number = 50
): DocumentNotification[] {
  const creator = members[0];
  const notifications: DocumentNotification[] = [];

  safetySystemDocuments.forEach((doc, docIndex) => {
    const notificationCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < notificationCount; i++) {
      const targetMember = members[Math.floor(Math.random() * members.length)];
      const notificationTypes: Array<
        'approval_request' | 'signature_request' | 'deadline_reminder'
      > = ['approval_request', 'signature_request', 'deadline_reminder'];
      const notificationType = notificationTypes[i % notificationTypes.length];
      const isSent = docIndex % 2 === 0;
      notifications.push({
        id: `document-notification-${notifications.length + 1}`,
        documentId: `${doc.safetyIdx}-${doc.itemNumber}-${doc.documentNumber}`,
        targetMemberIdx: targetMember.memberIdx,
        notificationType,
        scheduledAt: fSub({ days: docIndex }),
        sentAt: isSent ? fSub({ days: docIndex - 1 }) : null,
        reminderDays:
          notificationType === 'deadline_reminder' ? ([15, 7, 1] as const)[i % 3] : null,
        createdBy: creator?.memberIdx || null,
        description: docIndex % 5 === 0 ? '알림 설명' : null,
        createAt: fSub({ days: docIndex }),
        deletedAt: null,
      });
    }
  });

  return notifications.slice(0, count);
}

// ============================================================================
// 28. ChatRoomSharedDocument (채팅방 공유 문서) 데이터 생성
// ============================================================================

export function generateChatRoomSharedDocuments(
  chatRooms: ChatRoom[],
  sharedDocuments: SharedDocument[],
  members: Member[],
  count: number = 20
): ChatRoomSharedDocument[] {
  const creator = members[0];
  return Array.from({ length: count }, (_, index) => {
    const room = chatRooms[index % chatRooms.length];
    const doc = sharedDocuments[index % sharedDocuments.length];
    const sharer = members[index % members.length];

    return {
      id: `chat-room-shared-document-${index + 1}`,
      chatRoomId: room.id,
      sharedDocumentId: doc.id,
      sharedByMemberIdx: sharer.memberIdx,
      createdBy: creator?.memberIdx || null,
      description: index % 5 === 0 ? '공유 문서 설명' : null,
      createAt: fSub({ days: count - index }),
      deletedAt: null,
    };
  });
}

// ============================================================================
// 22. PrioritySetting (중요도 설정) 데이터 생성
// ============================================================================

export function generatePrioritySettings(members: Member[]): PrioritySetting[] {
  const creator = members[0];
  const now = new Date().toISOString();

  return [
    {
      id: 'priority-1',
      color: '#b71d18',
      labelType: 'urgent',
      customLabel: null,
      isActive: 1,
      order: 1,
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      description: '긴급 중요도 설정',
      createAt: now,
      updateAt: now,
      deletedAt: null,
    },
    {
      id: 'priority-2',
      color: '#b76e00',
      labelType: 'important',
      customLabel: null,
      isActive: 1,
      order: 2,
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      description: '중요 중요도 설정',
      createAt: now,
      updateAt: now,
      deletedAt: null,
    },
    {
      id: 'priority-3',
      color: '#1d7bf5',
      labelType: 'reference',
      customLabel: null,
      isActive: 1,
      order: 3,
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      description: '참고 중요도 설정',
      createAt: now,
      updateAt: now,
      deletedAt: null,
    },
    {
      id: 'priority-4',
      color: '#007867',
      labelType: 'normal',
      customLabel: null,
      isActive: 1,
      order: 4,
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      description: '보통 중요도 설정',
      createAt: now,
      updateAt: now,
      deletedAt: null,
    },
    {
      id: 'priority-5',
      color: '#9c27b0',
      labelType: 'custom',
      customLabel: '직접 작성',
      isActive: 1,
      order: 5,
      createdBy: creator?.memberIdx || null,
      updatedBy: creator?.memberIdx || null,
      description: '사용자 정의 중요도 설정',
      createAt: now,
      updateAt: now,
      deletedAt: null,
    },
  ];
}

// ============================================================================
// 전체 데이터베이스 데이터 생성 함수
// ============================================================================

export function generateDatabaseData() {
  // 0. 임시 멤버 생성 (다른 엔티티 생성에 필요)
  const tempMembers: Member[] = Array.from({ length: 5 }, (_, index) => ({
    memberIdx: index + 1,
    memberId: `temp-member-${index + 1}`,
    companyIdx: 1,
    companyBranchIdx: null,
    createdBy: null,
    updatedBy: null,
    memberRole: 'admin',
    memberName: `임시 멤버 ${index + 1}`,
    memberEmail: `temp${index + 1}@example.com`,
    memberPhone: '010-0000-0000',
    memberStatus: 'active',
    memberAddress: '주소',
    memberAddressDetail: null,
    memberMemo: null,
    memberThumbnail: null,
    memberNameOrg: null,
    memberLang: 'ko',
    password: 'hashed',
    duplicateSigninKey: null,
    lastSigninAt: null,
    joinedAt: new Date().toISOString(),
    deviceToken: null,
    deviceGubun: null,
    memberlat: null,
    memberlng: null,
    lastLocationUpdateAt: null,
    loginAttempts: 0,
    loginBlockedUntil: null,
    description: null,
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString(),
    deletedAt: null,
  }));

  // 1. 기본 엔티티 생성
  const companies = generateCompanies(tempMembers, 5);
  const branches = generateCompanyBranches(companies, tempMembers, 10);
  const members = generateMembers(companies, branches, 20);

  // 2. 교육 관련 엔티티 생성
  const educationReports = generateEducationReports(members, companies, 20);
  const educationRecords = generateEducationRecords(members, educationReports, 50);
  const educationStandards = generateEducationStandards(members);

  // 3. 안전 시스템 관련 엔티티 생성
  const safetySystems = generateSafetySystems(members);
  const safetySystemItems = generateSafetySystemItems(safetySystems, members);
  const safetySystemDocuments = generateSafetySystemDocuments(safetySystemItems, members);

  // 4. 채팅 관련 엔티티 생성
  const chatRooms = generateChatRooms(members, companies, 10);
  const chatMessages = generateChatMessages(chatRooms, members, 50);
  const chatParticipants = generateChatParticipants(chatRooms, members);

  // 5. 체크리스트 관련 엔티티 생성
  const checklists = generateChecklists(members, 20);
  const disasterFactors = generateDisasterFactors(checklists, members);

  // 6. 설정 관련 엔티티 생성
  const codeSettings = generateCodeSettings(members, 20);
  const serviceSettings = generateServiceSettings(members, 10);
  const apiSettings = generateApiSettings(members, 10);

  // 7. 라이브러리 관련 엔티티 생성
  const libraryCategories = generateLibraryCategories(members);
  const libraryReports = generateLibraryReports(libraryCategories, members, 20);

  // 8. 리포트 관련 엔티티 생성
  const riskReports = generateRiskReports(members, companies, 20);
  const safetyReports = generateSafetyReports(members, 20);

  // 9. 공유 문서 관련 엔티티 생성
  const prioritySettings = generatePrioritySettings(members);
  const sharedDocuments = generateSharedDocuments(
    members,
    safetySystemDocuments,
    prioritySettings,
    20
  );

  // 10. 슈퍼어드민 생성
  const superAdmins = generateSuperAdmins(members, 2);

  // 11. 조직 구독 서비스 생성
  const companySubscriptions = generateCompanySubscriptions(
    companies,
    serviceSettings,
    members,
    10
  );

  // 12. 조직원 초대 생성
  const companyInvitations = generateCompanyInvitations(companies, members, 10);

  // 13. 문서 결재/서명/알림 생성
  const documentApprovals = generateDocumentApprovals(safetySystemDocuments, members, 30);
  const documentSignatures = generateDocumentSignatures(safetySystemDocuments, members, 30);
  const documentNotifications = generateDocumentNotifications(safetySystemDocuments, members, 50);

  // 14. 채팅방 공유 문서 생성
  const chatRoomSharedDocuments = generateChatRoomSharedDocuments(
    chatRooms,
    sharedDocuments,
    members,
    20
  );

  return {
    SuperAdmin: superAdmins,
    Company: companies,
    CompanyBranch: branches,
    Member: members,
    EducationReport: educationReports,
    EducationRecord: educationRecords,
    EducationStandard: educationStandards,
    SafetySystem: safetySystems,
    SafetySystemItem: safetySystemItems,
    SafetySystemDocument: safetySystemDocuments,
    ChatRoom: chatRooms,
    ChatMessage: chatMessages,
    ChatParticipant: chatParticipants,
    Checklist: checklists,
    DisasterFactor: disasterFactors,
    CodeSetting: codeSettings,
    ServiceSetting: serviceSettings,
    ApiSetting: apiSettings,
    LibraryReport: libraryReports,
    LibraryCategory: libraryCategories,
    RiskReport: riskReports,
    SafetyReport: safetyReports,
    SharedDocument: sharedDocuments,
    PrioritySetting: prioritySettings,
    CompanySubscription: companySubscriptions,
    CompanyInvitation: companyInvitations,
    DocumentApproval: documentApprovals,
    DocumentSignature: documentSignatures,
    DocumentNotification: documentNotifications,
    ChatRoomSharedDocument: chatRoomSharedDocuments,
  };
}
