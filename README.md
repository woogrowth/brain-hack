# 🧠 BRAINHACK - Quiz RPG Platform

GitHub Pages로 즉시 실행되는 퀴즈 RPG 플랫폼

## 🚀 GitHub Pages 배포 방법

1. 이 폴더 전체를 GitHub 리포지토리에 업로드
2. Settings → Pages → Source: `main` 브랜치, `/ (root)` 선택
3. `https://[username].github.io/[repo-name]/` 으로 접속

## 📁 파일 구조

```
brainhack/
├── index.html              # 메인 진입점 (GitHub Pages 시작)
├── README.md
├── css/
│   ├── fonts.css           # 내장 폰트 (base64, ~3.8MB)
│   └── style.css           # 메인 스타일 (~7KB)
└── js/
    ├── 01_constants.js     # 상수 (랭크, 직업, 아이템, 프로모코드)
    ├── 02_helpers.js       # LocalStorage 헬퍼, 랭크 계산
    ├── 03_state.js         # 전역 상태, setState, updateUser
    ├── 04_quiz_logic.js    # 퀴즈 로직 (시작/다음/제출/출석)
    ├── 05_render_helpers.js # h(), xpBar, rankBadge 등
    ├── 06_render_nav_home_quiz.js  # 네비게이션, 홈, 퀴즈, 모드선택
    ├── 07_render_leaderboard_shop_chat.js  # 랭킹, 상점, 채팅
    ├── 08_render_profile.js        # 프로필 화면
    ├── 09_render_clubs.js          # 클럽 시스템
    ├── 10_render_modals.js         # 로그인/회원가입 모달
    ├── 11_render_submit_problem.js # 문제 제출 모달
    ├── 12_render_admin.js          # 관리자 패널
    └── 13_render_main.js           # render(), 설정모달, 소셜
```

## ✨ 주요 기능

### 게임
- 🎲 **4가지 퀴즈 모드**: 15문제 / 무한 / 인기문제 / 오답노트
- 💗 **하트 투표**: 문제 결과 화면에서 1회 투표, 인기문제 모드 반영
- 📝 **오답 자동 기록**: 틀리면 추가, 맞추면 자동 삭제
- 🔒 **오답노트**: 에메랄드(7,000 XP) 이상만 이용 가능
- 📝 **이의신청**: 오답 처리 후 사유 입력 → 관리자 검토
- 🧪 **포션 시스템**: 시간포션, XP물약, 코인물약, 힌트포션

### 유저
- 👤 **성별 선택**: 남/여 선택 시 캐릭터 이모지 즉시 변경
- 🔐 **아이디 검증**: 중복 불가 + admin 금지 (3단계에서 즉시 체크)
- 🎁 **휴면 복귀 보상**: 7일(+50), 14일(+200), 30일(+500) 코인
- ⏰ **장시간 이용 알림**: 60분 이용 시 휴식 권고

### 상점
- 🛒 **아이템**: 프레임/모자/배경/액세서리/칭호 + 포션 4종
- 💳 **코인구매**: 스타터/기본/인기/프리미엄 패키지
- 🎫 **프로모코드**: BRAINHACK, WELCOME, HACKER99, FRIEND10, QUIZ2024
- 🦊 **이모지샵**: 40종, 개당 10,000코인

### 소통
- 💬 **채팅 4서버**: 🌐글로벌 / 🇰🇷한국 / 🇯🇵일본 / 🌏영어권
- 👥 **소셜**: 유저 검색, 친구 요청/수락/거절, 온라인 표시
- 🏟️ **클럽**: 생성/가입/탈퇴, 클럽 채팅, 랭킹

### 관리자
- 💾 **활동 로그**: 전체 JSON 다운로드, 파일 업로드로 복구
- 📊 **실시간 통계**: KPI 카드, 카테고리 분포, 최근 활동
- ⚖️ **이의신청 관리**: 수용/기각, 정답 직접 수정
- 🎛️ **XP/코인/랭크 부여**: 유저 상세 모달에서 즉시 처리

### 설정
- 🌙 **다크/라이트 모드**: localStorage에 영구 저장
- 🔤 **글씨 크기**: 소/중/대 선택
- 👤 **회원정보**: 닉네임 변경, 비밀번호 변경, 계정 탈퇴
- 💬 **고객센터**: FAQ 6개, 문의 제출
- 💾 **백업/복구**: JSON 다운로드/업로드

## 🔑 기본 계정
- 관리자: `admin` / `admin1234!`
- 기본 유저: `woogrowth` / `woogrowth1`

## 📝 Claude로 수정하는 방법

각 파일은 독립적인 기능 담당:
- **새 퀴즈 로직** → `js/04_quiz_logic.js`
- **UI 화면 추가** → 해당 `js/06~12` 파일
- **새 아이템/상수** → `js/01_constants.js`
- **상태 필드 추가** → `js/03_state.js`
- **스타일 변경** → `css/style.css`
