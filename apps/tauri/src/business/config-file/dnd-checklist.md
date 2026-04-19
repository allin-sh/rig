# Config File Sidebar DnD 체크리스트

## 1. 데이터 모델

- `StorageGroup` 에 `order: number` 추가
- `StorageConfigFile` 에 `order: number` 추가
- `file.order` 는 같은 `groupId` 범위 안에서의 순서로 정의
- `ungrouped` 는 persisted entity 가 아니라 `groupId === null` 로 정의
- 잘못된 `groupId` 를 가진 파일을 UI 에서만 `ungrouped` 로 보정할지, 저장 시 정리할지 결정
- 기존 데이터의 `order` 초기값은 현재 fetch 순서를 기준으로 backfill 할지 확정

## 2. Rust 저장소

- `apps/tauri/src-tauri/src/storage/entities.rs` 의 `ConfigFile`, `Group` 에 `order` 필드 추가
- `get_config_files()` 정렬 기준을 `order ASC` 로 변경
- `get_groups()` 정렬 기준을 `order ASC` 로 변경
- `order` 가 없는 기존 데이터의 read/write 처리 방식 결정
- 그룹 reorder 와 파일 move/reorder 를 위한 batch 저장 메서드 추가
- 파일이 그룹 간 이동할 때도 `group_id` 검증이 유지되도록 처리

## 3. Tauri Command 와 Gateway

- 그룹 reorder 와 파일 move/reorder 용 batch command 추가
- 그룹 reorder payload 형태 확정
- 파일 move/reorder payload 형태 확정
- `apps/tauri/src/lib/gateway/config-file/configFileGateway.ts` 에 새 gateway 메서드 추가
- `apps/tauri/src-tauri/src/lib.rs` 에 command 등록

## 4. 프론트엔드 상태 소유권

- `useUserFile()` 와 `useGroup()` 의 분리된 상태 소유권 위에 그대로 DnD 를 쌓지 않기
- 사이드바 DnD 액션을 `ConfigFileManager` 중심으로 이동
- 파일, 그룹, reorder, move 액션을 한 흐름에서 다룰 수 있게 정리
- optimistic 상태를 어디서 관리할지 정의
- rollback 용 snapshot 을 어디에 둘지 정의

## 5. 사이드바 View Model

- 렌더링용 파생 sidebar view model 추가
- `ungrouped` 는 고정 위치로 유지
- 그룹은 `group.order ASC` 기준으로 정렬
- 각 container 내부 파일은 `file.order ASC` 기준으로 정렬
- 잘못된 `groupId` 에 대한 fallback 처리 정의
- View 는 이 파생 sidebar model 만 소비하도록 제한

## 6. DnD 식별자 규칙

- draggable group, droppable container, draggable file 의 id 를 각각 분리
- 그룹 draggable id 는 `group-item:${groupId}` 사용
- 그룹 container droppable id 는 `container:group:${groupId}` 사용
- 고정 `ungrouped` droppable id 는 `container:ungrouped` 사용
- 파일 draggable id 는 `file-item:${fileId}` 사용
- drag metadata 에 필요에 따라 `kind`, `groupId`, `containerId`, `fileId` 포함

## 7. 렌더링 구조

- `UserFileListView` 는 orchestrator 역할만 담당
- 사이드바 전체를 하나의 `DndContext` 로 감싸기
- 그룹 전용 top-level `SortableContext` 추가
- 각 파일 container 마다 `SortableContext` 추가
- 빈 그룹과 빈 ungrouped 영역도 droppable 처리
- 가능한 범위에서 기존 file row 렌더링 재사용
- directory entry 는 DnD 대상에서 제외

## 8. 드래그 규칙

- `group over group` 은 top-level 그룹 순서 변경
- `file over file` 은 같은 container 내 reorder 또는 다른 container 로 이동
- `file over container` 는 해당 container 끝으로 append
- 그룹 drop 규칙이 파일 규칙과 섞이지 않도록 분리
- directory row 와 관련된 drag interaction 은 무시
- 유효하지 않은 target 은 no-op 처리

## 9. Optimistic UI 와 Rollback

- drag end 시 로컬 reorder 를 즉시 반영
- optimistic update 전에 이전 snapshot 저장
- 변경 사항은 한 번의 batch 요청으로 저장
- 성공 시 persisted state 와 다시 동기화
- 실패 시 이전 snapshot 으로 rollback
- 저장 실패 시 toast 표시
- 동시에 여러 drag 저장 요청이 겹칠 때 처리 방식 결정

## 10. 예외 케이스

- 빈 그룹에 drop
- 빈 ungrouped 영역에 drop
- 삭제된 그룹을 참조하는 파일 처리
- 파일 이동 후에도 현재 selection 유지
- 같은 위치에 drop 한 경우 persistence 생략
- 이후 collapse UI 가 생길 때 drop target 계산 영향 검토

## 11. 변경 가능성이 높은 파일

- `apps/tauri/src/lib/gateway/config-file/types.ts`
- `apps/tauri/src/lib/gateway/config-file/configFileGateway.ts`
- `apps/tauri/src/business/config-file/ConfigFileManager.ts`
- `apps/tauri/src/business/config-file/useConfigFile.ts`
- `apps/tauri/src/business/config-file/sidebar/UserFileListView.tsx`
- `apps/tauri/src/business/config-file/sidebar/EntryItemView.tsx`
- 필요 시 새로운 sidebar DnD view 파일들
- `apps/tauri/src-tauri/src/storage/entities.rs`
- `apps/tauri/src-tauri/src/storage/config_file.rs`
- `apps/tauri/src-tauri/src/storage/commands.rs`
- `apps/tauri/src-tauri/src/lib.rs`

## 12. 구현 전 최종 결정 사항

- `ungrouped` 를 상단 고정으로 둘지 하단 고정으로 둘지 결정
- 파일 이동용 batch payload 형식 확정
- 그룹 reorder 용 batch payload 형식 확정
- 기존 데이터에 `order` 를 어떤 방식으로 부여할지 확정
- 에러 UX 를 toast 만으로 충분히 처리할지 확정
