# API 통합 TODO 목록

이 문서는 프로젝트 내 모든 API 통합이 필요한 부분을 정리한 문서입니다. 모든 API 호출은 TanStack Query를 사용하여 구현됩니다.

## 목차

1. [Organization (조직 관리)](#organization-조직-관리)
2. [Chat (채팅)](#chat-채팅)
3. [Operation (현장 운영 관리)](#operation-현장-운영-관리)
4. [EducationReport (교육 이수 현황)](#educationreport-교육-이수-현황)
5. [LibraryReport (라이브러리 리포트)](#libraryreport-라이브러리-리포트)
6. [ServiceSetting (서비스 관리)](#servicesetting-서비스-관리)
7. [CodeSetting (코드 관리)](#codesetting-코드-관리)
8. [ApiSetting (API 관리)](#apisetting-api-관리)
9. [Checklist (업종별 체크리스트)](#checklist-업종별-체크리스트)
10. [DashBoard (대시보드)](#dashboard-대시보드)
11. [Risk_2200 (위험요인 제거·대체 및 통제 등록)](#risk_2200-위험요인-제거대체-및-통제-등록)

---

## Organization (조직 관리)

### 기능 설명

조직(회사) 정보를 관리하고, 조직원을 관리하며, 구독 서비스를 관리하는 섹션입니다.

### API 목록

#### 1. 조직 목록 조회

- **위치**: `src/sections/Organization/view.tsx:32`
- **기능**: 조직 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 필터, 검색 조건, 페이지 정보

#### 2. 조직 등록

- **위치**: `src/sections/Organization/view.tsx:119`
- **기능**: 새로운 조직을 등록합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 정보 (구분, 조직명, 사업자 정보, 담당자 정보 등)

#### 3. 조직 비활성화

- **위치**: `src/sections/Organization/view.tsx:66`
- **기능**: 조직을 비활성화합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 ID

#### 4. 조직 삭제

- **위치**: `src/sections/Organization/view.tsx:77`
- **기능**: 조직을 삭제합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 ID

#### 5. 조직 정보 및 멤버 목록 조회

- **위치**: `src/sections/Organization/Detail/view.tsx:34`
- **기능**: 특정 조직의 상세 정보와 멤버 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 조직 ID

#### 6. 서비스 업그레이드

- **위치**: `src/sections/Organization/Detail/components/OrganizationInfo.tsx:198`
- **기능**: 조직의 구독 서비스를 업그레이드합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 ID, 서비스 플랜 ID

#### 7. 서비스 취소

- **위치**: `src/sections/Organization/Detail/components/OrganizationInfo.tsx:209`
- **기능**: 조직의 구독 서비스를 취소합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 ID, 서비스 플랜 ID

#### 8. 카드 액션 처리 (대표 카드 설정, 수정, 삭제)

- **위치**: `src/sections/Organization/Detail/components/OrganizationInfo.tsx:230`
- **기능**: 결제 카드의 대표 카드 설정, 수정, 삭제를 처리합니다.
- **타입**: `useMutation`
- **파라미터**: 카드 ID, 액션 타입, 카드 정보

#### 9. 조직원 초대 (이메일 링크)

- **위치**: `src/sections/Organization/Detail/view.tsx` (조직원 초대)
- **기능**: 조직원을 이메일 링크로 초대합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 ID, 초대 이메일

#### 10. 조직원 초대 링크 수락

- **위치**: `src/sections/Organization/Detail/view.tsx` (초대 링크 수락)
- **기능**: 초대 링크를 통해 조직원 가입을 완료합니다.
- **타입**: `useMutation`
- **파라미터**: 초대 토큰, 회원 정보

#### 11. 무재해 사업장 승인/반려 (슈퍼어드민만)

- **위치**: `src/sections/Organization/view.tsx` (조직 목록)
- **기능**: 조직의 무재해 사업장 인증을 승인하거나 반려합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 ID, 승인/반려 여부

#### 12. 무재해 사업장 인증 업데이트

- **위치**: `src/sections/Organization/Detail/view.tsx` (무재해 사업장 탭)
- **기능**: 조직의 무재해 사업장 인증 정보를 업데이트합니다.
- **타입**: `useMutation`
- **파라미터**: 조직 ID, 인증 정보 (인증일, 만료일 등)

#### 13. 구독 서비스 목록 조회

- **위치**: `src/sections/Organization/Detail/view.tsx` (구독 서비스 탭)
- **기능**: 조직의 구독 서비스 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 조직 ID

#### 14. 구독 서비스 구독

- **위치**: `src/sections/Organization/Detail/view.tsx` (구독 서비스 탭)
- **기능**: 조직이 서비스를 구독합니다 (빌링키 등록).
- **타입**: `useMutation`
- **파라미터**: 조직 ID, 서비스 ID, 빌링키

#### 15. 구독 서비스 취소

- **위치**: `src/sections/Organization/Detail/view.tsx` (구독 서비스 탭)
- **기능**: 조직의 구독 서비스를 취소합니다.
- **타입**: `useMutation`
- **파라미터**: 구독 ID

#### 16. 대표 카드 설정

- **위치**: `src/sections/Organization/Detail/view.tsx` (구독 서비스 탭)
- **기능**: 구독 서비스의 대표 카드를 설정합니다.
- **타입**: `useMutation`
- **파라미터**: 구독 ID, 빌링키

---

## Chat (채팅)

### 기능 설명

일반 채팅, 그룹 채팅, 챗봇, 응급 채팅 기능을 제공하는 섹션입니다.

### API 목록

#### 1. 채팅방 목록 조회

- **위치**: `src/sections/Chat/view.tsx:45`
- **기능**: 사용자가 참여한 채팅방 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 사용자 ID

#### 2. 메시지 목록 조회

- **위치**: `src/sections/Chat/view.tsx:116`
- **기능**: 특정 채팅방의 메시지 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 채팅방 ID, 페이지 정보

#### 3. 참가자 목록 조회

- **위치**: `src/sections/Chat/view.tsx:145`
- **기능**: 특정 채팅방의 참가자 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 채팅방 ID

#### 4. 메시지 전송

- **위치**: `src/sections/Chat/view.tsx:167`
- **기능**: 채팅방에 메시지를 전송합니다.
- **타입**: `useMutation`
- **파라미터**: 채팅방 ID, 메시지 내용, 첨부 파일

#### 5. 참가자 초대

- **위치**: `src/sections/Chat/view.tsx:182`
- **기능**: 채팅방에 참가자를 초대합니다.
- **타입**: `useMutation`
- **파라미터**: 채팅방 ID, 참가자 ID 목록

#### 6. 참가자 내보내기

- **위치**: `src/sections/Chat/view.tsx:195`
- **기능**: 채팅방에서 참가자를 내보냅니다.
- **타입**: `useMutation`
- **파라미터**: 채팅방 ID, 참가자 ID 목록

#### 7. 응급 통계 조회

- **위치**: `src/sections/Chat/view.tsx:288`
- **기능**: 응급 채팅방의 통계 정보를 조회합니다 (예: n월 발생 건수 n).
- **타입**: `useQuery`
- **파라미터**: 채팅방 ID

#### 8. 첨부 파일 목록 조회

- **위치**: `src/sections/Chat/view.tsx:305`
- **기능**: 특정 채팅방의 첨부 파일 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 채팅방 ID

#### 9. 이미지 파일 업로드

- **위치**: `src/sections/Chat/components/ui/ChatInput.tsx:31`
- **기능**: 채팅에 이미지 파일을 업로드합니다.
- **타입**: `useMutation`
- **파라미터**: 파일, 채팅방 ID

#### 10. 음성 파일 업로드

- **위치**: `src/sections/Chat/components/ui/ChatInput.tsx:46`
- **기능**: 채팅에 음성 파일을 업로드합니다.
- **타입**: `useMutation`
- **파라미터**: 파일, 채팅방 ID

#### 11. 위험 보고/구조 신호/대피 신호 전송

- **위치**: `src/sections/Chat/view.tsx` (사고 발생 현황 채팅방)
- **기능**: 사고 발생 현황 채팅방에서 위험 보고/구조 신호/대피 신호를 전송합니다 (대시보드 카운트 증가).
- **타입**: `useMutation`
- **파라미터**: 채팅방 ID, 신호 타입 ('risk' | 'rescue' | 'evacuation'), 메시지 내용

#### 12. 채팅방 이름 변경

- **위치**: `src/sections/Chat/view.tsx` (채팅방 설정)
- **기능**: 채팅방 이름을 변경합니다.
- **타입**: `useMutation`
- **파라미터**: 채팅방 ID, 새로운 이름

#### 13. 공유 문서 채팅방 공유

- **위치**: `src/sections/Chat/view.tsx` (공유 문서 공유)
- **기능**: 공유 문서를 채팅방에 공유합니다 (푸시 알림 발송).
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 채팅방 ID

#### 14. 사고 발생 현황 채팅방 자동 생성/참가

- **위치**: `src/sections/Chat/view.tsx` (조직원 초대 시)
- **기능**: 조직원 초대로 회원가입 시 자동으로 사고 발생 현황 채팅방에 참가합니다.
- **타입**: `useMutation` (자동 호출)
- **파라미터**: 조직 ID, 멤버 ID

---

## Operation (현장 운영 관리)

### 기능 설명

위험 보고서를 작성하고 관리하는 섹션입니다.

### API 목록

#### 1. 위험 보고 목록 조회

- **위치**: `src/sections/Operation/view.tsx:27`
- **기능**: 위험 보고 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 필터, 검색 조건, 페이지 정보

#### 2. 위험 보고 등록

- **위치**: `src/sections/Operation/create/view.tsx:26`
- **기능**: 새로운 위험 보고를 등록합니다.
- **타입**: `useMutation`
- **파라미터**: 위험 보고 정보 (제목, 내용, 위치, 첨부 이미지 등)

#### 3. 위험 보고 비활성화

- **위치**: `src/sections/Operation/view.tsx:76`
- **기능**: 위험 보고를 비활성화합니다.
- **타입**: `useMutation`
- **파라미터**: 위험 보고 ID

#### 4. 위험 보고 삭제

- **위치**: `src/sections/Operation/view.tsx:87`
- **기능**: 위험 보고를 삭제합니다.
- **타입**: `useMutation`
- **파라미터**: 위험 보고 ID

#### 5. 채팅방에서 위험 보고 생성

- **위치**: `src/sections/Chat/view.tsx` (사고 발생 현황 채팅방)
- **기능**: 채팅방에서 위험 보고를 생성합니다 (대시보드 카운트 증가).
- **타입**: `useMutation`
- **파라미터**: 채팅방 ID, 위험 보고 정보

---

## EducationReport (교육 이수 현황)

### 기능 설명

교육 이수 현황을 조회하고, 교육을 추가하고, 교육 상세 정보를 관리하는 섹션입니다.

### API 목록

#### 1. 교육 이수 현황 목록 조회

- **위치**: `src/sections/EducationReport/view.tsx:32`
- **기능**: 교육 이수 현황 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 필터, 검색 조건, 페이지 정보

#### 2. 교육 상세 정보 조회

- **위치**: `src/sections/EducationReport/view.tsx:82`
- **기능**: 특정 교육의 상세 정보를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 교육 ID

#### 3. 교육 추가

- **위치**: `src/sections/EducationReport/view.tsx:141`
- **기능**: 새로운 교육을 추가합니다.
- **타입**: `useMutation`
- **파라미터**: 교육 정보 (교육명, 교육 일자, 교육 내용 등)

#### 4. 교육 상세 정보 저장

- **위치**: `src/sections/EducationReport/view.tsx:161`
- **기능**: 교육 상세 정보를 저장합니다 (이수자 정보 포함).
- **타입**: `useMutation`
- **파라미터**: 교육 ID, 교육 상세 정보

#### 5. 교육 등록 (증빙자료 포함)

- **위치**: `src/sections/EducationReport/view.tsx` (교육 등록)
- **기능**: 교육을 등록합니다 (증빙자료 파일 포함, 교육 타입: mandatory/regular).
- **타입**: `useMutation`
- **파라미터**: 교육 정보 (교육명, 교육 일자, 교육 시간, 교육 타입, 증빙자료 파일)

#### 6. 교육 상세 현황 조회

- **위치**: `src/sections/EducationReport/view.tsx` (교육 상세 현황)
- **기능**: 사용자의 교육 상세 현황을 조회합니다 (타입별 기록, 이수율 포함).
- **타입**: `useQuery`
- **파라미터**: 사용자 ID

#### 7. 역할별 교육 이수 기준 시간 조회

- **위치**: `src/sections/EducationReport/view.tsx` (교육 기준 설정)
- **기능**: 역할별 교육 이수 기준 시간을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음

#### 8. 역할별 교육 이수 기준 시간 수정

- **위치**: `src/sections/EducationReport/view.tsx` (교육 기준 설정)
- **기능**: 역할별 교육 이수 기준 시간을 수정합니다.
- **타입**: `useMutation`
- **파라미터**: 기준 시간 정보 (역할, 직종, 기준 시간, 기간, 무재해 감면 여부 등)

---

## LibraryReport (라이브러리 리포트)

### 기능 설명

VOD 컨텐츠를 관리하고, 카테고리를 설정하며, 컨텐츠를 업로드/수정/삭제하는 섹션입니다.

### API 목록

#### 1. 라이브러리 리포트 목록 조회

- **위치**: `src/sections/LibraryReport/view.tsx:43`
- **기능**: 라이브러리 리포트 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 필터, 검색 조건, 페이지 정보

#### 2. 카테고리 목록 조회

- **위치**: `src/sections/LibraryReport/view.tsx:51`
- **기능**: VOD 카테고리 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음

#### 3. 카테고리 설정 저장

- **위치**: `src/sections/LibraryReport/view.tsx:171`
- **기능**: VOD 카테고리 설정을 저장합니다.
- **타입**: `useMutation`
- **파라미터**: 카테고리 목록

#### 4. VOD 업로드

- **위치**: `src/sections/LibraryReport/view.tsx:190`
- **기능**: VOD 컨텐츠를 업로드합니다 (비디오 파일, 자막 파일, 썸네일 포함).
- **타입**: `useMutation`
- **파라미터**: VOD 정보 (제목, 설명, 카테고리, 파일들)

#### 5. 컨텐츠 수정

- **위치**: `src/sections/LibraryReport/view.tsx:211`
- **기능**: VOD 컨텐츠를 수정합니다.
- **타입**: `useMutation`
- **파라미터**: 컨텐츠 ID, 수정 정보

#### 6. 컨텐츠 삭제

- **위치**: `src/sections/LibraryReport/view.tsx:224`
- **기능**: VOD 컨텐츠를 삭제합니다.
- **타입**: `useMutation`
- **파라미터**: 컨텐츠 ID

#### 7. 비디오 파일 미리보기 URL 가져오기

- **위치**: `src/sections/LibraryReport/components/EditContentModal.tsx:81`
- **기능**: 수정 모달에서 비디오 파일의 미리보기 URL을 가져옵니다.
- **타입**: `useQuery`
- **파라미터**: 컨텐츠 ID

#### 8. 수정일 가져오기

- **위치**: `src/sections/LibraryReport/components/EditContentModal.tsx:198`
- **기능**: 컨텐츠의 수정일을 가져옵니다.
- **타입**: `useQuery`
- **파라미터**: 컨텐츠 ID

#### 9. VOD 목록 조회 (권한별 필터링)

- **위치**: `src/sections/LibraryReport/view.tsx:43` (수정)
- **기능**: VOD 목록을 조회합니다 (슈퍼어드민: 전체, 일반 사용자: 본인 조직 + 슈퍼어드민 VOD).
- **타입**: `useQuery`
- **파라미터**: 필터, 검색 조건, 페이지 정보

#### 10. VOD 숨김 처리 (조직별)

- **위치**: `src/sections/LibraryReport/view.tsx` (VOD 숨김 처리)
- **기능**: 조직 관리자가 슈퍼어드민이 올린 특정 VOD를 숨김 처리합니다.
- **타입**: `useMutation`
- **파라미터**: VOD ID, 조직 ID

#### 11. VOD 숨김 해제

- **위치**: `src/sections/LibraryReport/view.tsx` (VOD 숨김 해제)
- **기능**: 숨김 처리된 VOD를 다시 표시합니다.
- **타입**: `useMutation`
- **파라미터**: VOD ID, 조직 ID

---

## ServiceSetting (서비스 관리)

### 기능 설명

서비스 플랜을 관리하고, 서비스를 등록/수정/삭제하는 섹션입니다.

### API 목록

#### 1. 서비스 목록 조회

- **위치**: `src/sections/ServiceSetting/view.tsx:27`
- **기능**: 서비스 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 필터, 검색 조건, 페이지 정보

#### 2. 서비스 상세 정보 조회

- **위치**: `src/sections/ServiceSetting/view.tsx:83`
- **기능**: 특정 서비스의 상세 정보를 조회합니다 (수정 모달용).
- **타입**: `useQuery`
- **파라미터**: 서비스 ID

#### 3. 서비스 등록

- **위치**: `src/sections/ServiceSetting/view.tsx:136`
- **기능**: 새로운 서비스를 등록합니다.
- **타입**: `useMutation`
- **파라미터**: 서비스 정보 (서비스명, 서비스 기간, 멤버 수, 월 요금)

#### 4. 서비스 수정

- **위치**: `src/sections/ServiceSetting/view.tsx:156`
- **기능**: 서비스 정보를 수정합니다.
- **타입**: `useMutation`
- **파라미터**: 서비스 ID, 수정 정보

#### 5. 서비스 비활성화

- **위치**: `src/sections/ServiceSetting/view.tsx:90`
- **기능**: 서비스를 비활성화합니다.
- **타입**: `useMutation`
- **파라미터**: 서비스 ID

#### 6. 서비스 삭제

- **위치**: `src/sections/ServiceSetting/view.tsx:101`
- **기능**: 서비스를 삭제합니다.
- **타입**: `useMutation`
- **파라미터**: 서비스 ID

---

## CodeSetting (코드 관리)

### 기능 설명

기계·설비 코드와 유해인자 코드를 관리하는 섹션입니다.

### API 목록

#### 1. 코드 목록 조회

- **위치**: `src/sections/CodeSetting/view.tsx:31`
- **기능**: 코드 목록을 조회합니다 (기계·설비 또는 유해인자). 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 카테고리 타입, 필터, 검색 조건, 페이지 정보

#### 2. 코드 상세 정보 조회

- **위치**: `src/sections/CodeSetting/view.tsx:111`
- **기능**: 특정 코드의 상세 정보를 조회합니다 (수정 모달용).
- **타입**: `useQuery`
- **파라미터**: 코드 ID

#### 3. 기계·설비 등록

- **위치**: `src/sections/CodeSetting/view.tsx:147`
- **기능**: 새로운 기계·설비 코드를 등록합니다.
- **타입**: `useMutation`
- **파라미터**: 기계·설비 정보 (코드, 명칭, 점검 주기, 보호 장치, 위험 유형)

#### 4. 기계·설비 수정

- **위치**: `src/sections/CodeSetting/view.tsx:168`
- **기능**: 기계·설비 코드를 수정합니다.
- **타입**: `useMutation`
- **파라미터**: 코드 ID, 수정 정보

#### 5. 유해인자 등록

- **위치**: `src/sections/CodeSetting/view.tsx:217`
- **기능**: 새로운 유해인자 코드를 등록합니다.
- **타입**: `useMutation`
- **파라미터**: 유해인자 정보 (카테고리, 코드, 명칭, 형태 및 유형, 위치, 노출위험, 관리기준, 관리대책)

#### 6. 유해인자 수정

- **위치**: `src/sections/CodeSetting/view.tsx:192`
- **기능**: 유해인자 코드를 수정합니다.
- **타입**: `useMutation`
- **파라미터**: 코드 ID, 수정 정보

#### 7. 카테고리 목록 조회

- **위치**: `src/sections/CodeSetting/components/CategorySettingsModal.tsx:47`
- **기능**: 유해인자 카테고리 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음

#### 8. 카테고리 목록 저장

- **위치**: `src/sections/CodeSetting/view.tsx:300`
- **기능**: 유해인자 카테고리 목록을 저장합니다.
- **타입**: `useMutation`
- **파라미터**: 카테고리 목록

#### 9. 등록일/수정일 정보 가져오기

- **위치**: `src/sections/CodeSetting/components/EditMachineModal.tsx:142`
- **기능**: 기계·설비 코드의 등록일/수정일 정보를 가져옵니다.
- **타입**: `useQuery`
- **파라미터**: 코드 ID

#### 10. 관리기준/관리대책 가져오기

- **위치**: `src/sections/CodeSetting/components/EditHazardModal.tsx:103-104`
- **기능**: 유해인자의 관리기준과 관리대책을 가져옵니다.
- **타입**: `useQuery`
- **파라미터**: 코드 ID

---

## ApiSetting (API 관리)

### 기능 설명

외부 API 연동을 관리하는 섹션입니다.

### API 목록

#### 1. API 목록 조회

- **위치**: `src/sections/ApiSetting/view.tsx:26`
- **기능**: API 목록을 조회합니다. 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 페이지 정보

#### 2. API 상세 정보 조회

- **위치**: `src/sections/ApiSetting/view.tsx:53`
- **기능**: 특정 API의 상세 정보를 조회합니다 (수정 모달용).
- **타입**: `useQuery`
- **파라미터**: API ID

#### 3. API 등록

- **위치**: `src/sections/ApiSetting/view.tsx:84`
- **기능**: 새로운 API를 등록합니다.
- **타입**: `useMutation`
- **파라미터**: API 정보 (이름, 제공자, API URL, API Key, 만료일)

#### 4. API 수정

- **위치**: `src/sections/ApiSetting/view.tsx:105`
- **기능**: API 정보를 수정합니다.
- **타입**: `useMutation`
- **파라미터**: API ID, 수정 정보

#### 5. API URL 가져오기

- **위치**: `src/sections/ApiSetting/components/EditApiModal.tsx:68`
- **기능**: 수정 모달에서 API URL을 가져옵니다.
- **타입**: `useQuery`
- **파라미터**: API ID

#### 6. 새 Key 생성

- **위치**: `src/sections/ApiSetting/components/EditApiModal.tsx:92`
- **기능**: API Key를 새로 생성하거나 입력 모드로 전환합니다.
- **타입**: `useMutation`
- **파라미터**: API ID

#### 7. 수정일 가져오기

- **위치**: `src/sections/ApiSetting/components/EditApiModal.tsx:159`
- **기능**: API의 수정일을 가져옵니다.
- **타입**: `useQuery`
- **파라미터**: API ID

---

## Checklist (업종별 체크리스트)

### 기능 설명

업종별 체크리스트를 관리하고, 고위험작업/상황을 등록하며, 재해유발요인을 관리하는 섹션입니다.

### API 목록

#### 1. 체크리스트 목록 조회

- **위치**: `src/sections/ChackList/view.tsx:29`
- **기능**: 체크리스트 목록을 조회합니다. 업종별 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: 업종, 필터, 검색 조건, 페이지 정보

#### 2. 고위험작업/상황 업데이트

- **위치**: `src/sections/ChackList/view.tsx:99`
- **기능**: 체크리스트의 고위험작업/상황을 업데이트합니다 (인라인 편집).
- **타입**: `useMutation`
- **파라미터**: 체크리스트 ID, 새로운 값

#### 3. 재해유발요인 목록 조회

- **위치**: `src/sections/ChackList/view.tsx:113`
- **기능**: 특정 체크리스트의 재해유발요인 목록을 조회합니다 (모달용).
- **타입**: `useQuery`
- **파라미터**: 체크리스트 ID

#### 4. 업종 목록 조회

- **위치**: `src/sections/ChackList/components/IndustrySettingsModal.tsx:56`
- **기능**: 업종 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음

#### 5. 업종 목록 저장

- **위치**: `src/sections/ChackList/view.tsx:144`
- **기능**: 업종 목록을 저장합니다.
- **타입**: `useMutation`
- **파라미터**: 업종 목록

#### 6. 위험작업/상황 등록

- **위치**: `src/sections/ChackList/view.tsx:161`
- **기능**: 새로운 위험작업/상황을 등록합니다.
- **타입**: `useMutation`
- **파라미터**: 위험작업/상황 정보 (업종, 고위험작업/상황)

#### 7. 재해유발요인 목록 저장

- **위치**: `src/sections/ChackList/view.tsx:179`
- **기능**: 재해유발요인 목록을 저장합니다.
- **타입**: `useMutation`
- **파라미터**: 체크리스트 ID, 재해유발요인 목록, 활성화 상태

---

## DashBoard (대시보드)

### 기능 설명

대시보드 메인 페이지로, 서명 대기 문서, 공유된 문서, 사고·위험 보고 현황, 사용자 프로필, 교육 이수율 등을 표시합니다.

### API 목록

#### 1. 서명 대기 문서 목록 조회

- **위치**: `src/sections/DashBoard/view.tsx:75`
- **기능**: 서명 대기 중인 문서 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음 (또는 페이지 정보)

#### 2. 공유된 문서 목록 조회

- **위치**: `src/sections/DashBoard/view.tsx:86`
- **기능**: 공유된 문서 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음 (또는 페이지 정보)

#### 3. 사고·위험 보고 현황 통계 조회

- **위치**: `src/sections/DashBoard/view.tsx:113`
- **기능**: 사고 및 위험 보고 현황 통계를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음 (또는 날짜 범위)

#### 4. 사용자 프로필 정보 조회

- **위치**: `src/sections/DashBoard/view.tsx:122`
- **기능**: 현재 사용자의 프로필 정보를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 사용자 ID (또는 토큰에서 추출)

#### 5. 교육 이수율 조회

- **위치**: `src/sections/DashBoard/view.tsx:132`
- **기능**: 사용자의 교육 이수율을 조회합니다 (입사일 기준, 무재해 감면 적용).
- **타입**: `useQuery`
- **파라미터**: 사용자 ID (또는 토큰에서 추출)

#### 6. 공유 문서 업로드

- **위치**: `src/sections/DashBoard/view.tsx` (공유 문서 섹션)
- **기능**: 공유 문서를 업로드합니다 (중요도 설정 포함).
- **타입**: `useMutation`
- **파라미터**: 문서 정보 (문서명, 파일, 중요도, 공개 여부)

#### 7. 공유 문서 수정

- **위치**: `src/sections/DashBoard/view.tsx` (공유 문서 섹션)
- **기능**: 공유 문서를 수정합니다.
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 수정 정보

#### 8. 공유 문서 삭제

- **위치**: `src/sections/DashBoard/view.tsx` (공유 문서 섹션)
- **기능**: 공유 문서를 삭제합니다.
- **타입**: `useMutation`
- **파라미터**: 문서 ID

#### 9. 공유 문서 채팅방 공유

- **위치**: `src/sections/DashBoard/view.tsx` (공유 문서 섹션)
- **기능**: 공유 문서를 채팅방에 공유합니다 (푸시 알림 발송).
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 채팅방 ID 목록

#### 10. 중요도 설정 목록 조회

- **위치**: `src/sections/DashBoard/view.tsx` (공유 문서 섹션)
- **기능**: 중요도 설정 목록을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 없음

#### 11. 중요도 설정 관리 (등록/수정/삭제)

- **위치**: `src/sections/DashBoard/view.tsx` (공유 문서 섹션)
- **기능**: 중요도 설정을 등록/수정/삭제합니다.
- **타입**: `useMutation`
- **파라미터**: 중요도 설정 정보

---

## 구현 가이드

### 1. 서비스 파일 구조

각 섹션별로 `src/services/{section-name}/` 폴더에 다음 파일들을 생성합니다:

- `{section-name}.service.ts`: API 호출 함수
- `{section-name}.types.ts`: TypeScript 타입 정의
- `README.md`: API 문서

### 2. Hook 파일 위치

각 섹션의 `hooks/` 폴더에 `use-{section-name}.ts` 파일을 생성합니다.

### 3. TanStack Query 사용 패턴

```typescript
// useQuery 예시
const { data, isLoading, error } = useQuery({
  queryKey: ['resourceName', params],
  queryFn: () => getResource(params),
  staleTime: 5 * 60 * 1000, // 5분
});

// useMutation 예시
const mutation = useMutation({
  mutationFn: (data) => createResource(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resourceName'] });
  },
});
```

### 4. 자동 새로고침

필터, 검색, 페이지 변경 시 `queryClient.invalidateQueries`를 사용하여 자동으로 데이터를 새로고침합니다.

---

## Risk_2200 (위험요인 제거·대체 및 통제 등록)

### 기능 설명

안전보건체계 문서를 작성하고 관리하는 섹션입니다. 문서 타입별로 다른 폼을 제공하며 (1300, 1400, 1500, 2100, 2200, 2300번대), 문서 등록, 임시 저장, 상세 조회, PDF 다운로드, 결재 관리 등의 기능을 제공합니다.

### API 목록

#### 1. 문서 목록 조회

- **위치**: `src/sections/PDF/Risk_2200/view.tsx:36`
- **기능**: 문서 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.
- **타입**: `useQuery`
- **파라미터**: safetyIdx, itemNumber, filterType, searchField, searchValue, page, pageSize

#### 2. 문서 상세 정보 조회

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx:112`
- **기능**: 특정 문서의 상세 정보를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 문서 ID (riskId)

#### 3. 문서 등록

- **위치**: `src/sections/PDF/Risk_2200/create/view.tsx:402`
- **기능**: 새로운 문서를 등록합니다. 문서 타입별로 다른 데이터 구조를 가집니다.
- **타입**: `useMutation`
- **파라미터**: 문서 정보 (documentDate, approvalDeadline, 테이블 데이터, safetyIdx, itemNumber)

#### 4. 문서 임시 저장

- **위치**: `src/sections/PDF/Risk_2200/create/view.tsx:459`
- **기능**: 문서를 임시 저장합니다.
- **타입**: `useMutation`
- **파라미터**: 문서 정보 (documentDate, approvalDeadline, 테이블 데이터, safetyIdx, itemNumber)

#### 5. 임시 저장된 문서 불러오기

- **위치**: `src/sections/PDF/Risk_2200/create/view.tsx:130`
- **기능**: 임시 저장된 문서를 불러옵니다 (수정 모드 또는 임시 저장 불러오기).
- **타입**: `useQuery`
- **파라미터**: 문서 ID (documentId)

#### 6. 문서 삭제

- **위치**: `src/sections/PDF/Risk_2200/view.tsx:102`
- **기능**: 문서를 삭제합니다.
- **타입**: `useMutation`
- **파라미터**: 문서 ID

#### 7. 알림 발송

- **위치**: `src/sections/PDF/Risk_2200/view.tsx:130`
- **기능**: 문서에 대한 알림을 발송합니다.
- **타입**: `useMutation`
- **파라미터**: 문서 ID

#### 8. 액션 처리 (엑셀 내보내기, 인쇄 등)

- **위치**: `src/sections/PDF/Risk_2200/view.tsx:142`
- **기능**: 문서에 대한 액션을 처리합니다 (엑셀 내보내기, 인쇄 등).
- **타입**: `useMutation`
- **파라미터**: 액션 타입, 선택된 문서 ID 목록

#### 9. PDF 다운로드용 문서 정보 조회

- **위치**: `src/sections/PDF/Risk_2200/view.tsx:114`, `src/sections/PDF/Risk_2200/[risk_id]/view.tsx:54`, `src/sections/PDF/Risk_2200/utils/download-pdf.tsx:27`
- **기능**: PDF 다운로드를 위한 문서 정보를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 문서 ID

#### 10. 샘플 문서 조회

- **위치**: `src/sections/PDF/Risk_2200/create/view.tsx:525`, `src/sections/PDF/Risk_2200/[risk_id]/view.tsx:93`
- **기능**: 샘플 문서를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: safetyIdx, itemNumber

#### 11. 테이블 데이터 조회 (기본값용)

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx:137`
- **기능**: 문서 타입별 기본 테이블 데이터를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: safetyIdx, itemNumber

#### 12. Item 정보 조회

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx:159`
- **기능**: 문서 타입 정보를 조회합니다.
- **타입**: `useQuery`
- **파라미터**: safetyIdx, itemNumber

#### 13. 결재 정보 조회

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/components/ApprovalSection.tsx:18`
- **기능**: 문서의 결재 정보를 조회합니다 (작성자, 검토자, 승인자 정보 포함).
- **타입**: `useQuery`
- **파라미터**: 문서 ID (riskId)

#### 14. 서명 추가

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx:109`, `src/sections/PDF/Risk_2200/[risk_id]/components/ApprovalSection.tsx:182, 335`
- **기능**: 문서에 서명을 추가합니다.
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 서명 타입 (writer, reviewer, approver), 서명 정보

#### 15. 화학물질 목록 조회

- **위치**: `src/sections/PDF/Risk_2200/create/tables/Table1400Form.tsx:368`, `src/sections/PDF/Risk_2200/create/tables/Table1500Form.tsx:288`
- **기능**: 화학물질 목록을 조회합니다 (Autocomplete 옵션용).
- **타입**: `useQuery`
- **파라미터**: 없음 (또는 검색어)

#### 16. CAS No 목록 조회

- **위치**: `src/sections/PDF/Risk_2200/create/tables/Table1500Form.tsx:329`
- **기능**: CAS 번호 목록을 조회합니다 (Autocomplete 옵션용).
- **타입**: `useQuery`
- **파라미터**: 없음 (또는 검색어)

#### 17. 필터/검색/페이지 변경 시 자동 새로고침

- **위치**: `src/sections/PDF/Risk_2200/view.tsx:154, 160, 166, 189, 194`
- **기능**: 필터 타입, 검색 필드, 검색 값, 페이지, 페이지 크기 변경 시 문서 목록을 자동으로 새로고침합니다.
- **타입**: `queryClient.invalidateQueries`
- **파라미터**: queryKey: ['risk2200Documents']

#### 18. 문서 결재 대상자 등록

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx` (문서 수정 - 결재란)
- **기능**: 문서의 결재 대상자를 등록합니다 (순차/동시 결재 타입 설정).
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 결재 타입, 대상자 목록, 결재 순서

#### 19. 문서 서명 대상자 등록 (TBM 일지)

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx` (TBM 일지 등록)
- **기능**: TBM 일지의 서명 대상자를 등록합니다 (대시보드 서명 대기 문서에 추가).
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 대상자 목록

#### 20. 결재/서명 진행률 조회

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx` (진행률 표시)
- **기능**: 문서의 결재/서명 진행률을 조회합니다.
- **타입**: `useQuery`
- **파라미터**: 문서 ID

#### 21. 서명 상태 조회

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/components/ProgressModal.tsx`
- **기능**: 문서의 서명 상태를 조회합니다 (서명 완료일, 서명 데이터 포함).
- **타입**: `useQuery`
- **파라미터**: 문서 ID

#### 22. 서명 추가

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx` (서명 추가)
- **기능**: 문서에 서명을 추가합니다 (PDF에 반영, 푸시 알림 발송).
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 서명 타입, 서명 데이터

#### 23. 알림 발송 (수동/자동)

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx` (알림 발송)
- **기능**: 문서에 대한 알림을 발송합니다 (결재 요청, 서명 요청, 마감일 알림).
- **타입**: `useMutation`
- **파라미터**: 문서 ID, 알림 타입, 대상자 ID 목록

#### 24. 문서 게시 (공유 문서함 연동)

- **위치**: `src/sections/PDF/Risk_2200/[risk_id]/view.tsx` (게시 버튼)
- **기능**: 문서를 게시하여 공유 문서함에 추가합니다.
- **타입**: `useMutation`
- **파라미터**: 문서 ID

#### 25. 문서 목록 조회 (권한별 필터링)

- **위치**: `src/sections/PDF/Risk_2200/view.tsx:36` (수정)
- **기능**: 문서 목록을 조회합니다 (슈퍼어드민: 전체, 일반 사용자: 본인 조직 + 슈퍼어드민 문서).
- **타입**: `useQuery`
- **파라미터**: safetyIdx, itemNumber, filterType, searchField, searchValue, page, pageSize

---

## 참고사항

- 모든 API는 `src/lib/axios.ts`의 `axiosInstance`를 사용합니다.
- 엔드포인트는 `src/lib/axios.ts`의 `endpoints` 객체에 정의합니다.
- 응답 타입은 백엔드의 `BaseResponseDto` 구조를 따릅니다.
- 에러 처리는 React Query의 `isError`와 `error`를 사용합니다.
