# LOCKDOWN CITY — Tactical OPS HUD

봉쇄된 뉴욕 브루클린 LOCKDOWN CITY에 잠입한 카일 로크의 5단계 작전. 같은 스토리를 군 작전 HUD 톤으로 풀어낸, 한 문제씩 풀고 다음 페이지로 넘어가는 정적 웹 퀴즈.

> 자매 시안 `apocalypse-quiz/`는 같은 스토리를 라디오 방송/타자기 톤으로 풀어낸 v1입니다. 본 프로젝트는 v2 — HUD 시안.

## 라이브 / 레포

| | URL |
| --- | --- |
| 🌐 Live | https://lockdown-hud.vercel.app |
| 📦 GitHub | https://github.com/fantastrickga4-cmyk/lockdown-city |
| 🔍 Vercel | https://vercel.com/fantastrickga4-9692s-projects/lockdown-hud |

## 스토리

2030년. 정체불명의 바이러스가 세계를 잠식했다. 가장 먼저 무너진 곳은 뉴욕 브루클린, 그 중심부는 외부 유출 차단을 위해 완전히 봉쇄되었고 사람들은 그곳을 **LOCKDOWN CITY**라 부른다.

주인공 **카일 로크(Kyle Locke / 콜사인 BLACKBIRD-7)** 는 3개월 전 도시 안에서 실종된 친형을 찾기 위해 봉쇄선을 넘어 그 안으로 파견된다. 다섯 개의 관문, 다섯 번의 선택.

## 구성

```
lockdown-hud/
├── index.html         래퍼 (iframe + ambient.js, 절대 reload 안 됨)
├── start.html         인트로 — 작전 브리핑
├── q1.html ~ q5.html  5개 작전 단계 (객관식/주관식 혼합)
├── hint1.html ~ hint5.html  각 단계의 힌트 페이지 (앰버 톤)
├── end.html           디브리핑 — 임무 완료
├── ambient.js         절차적 BGM (부모 페이지 전용)
├── child-bridge.js    iframe 자식이 부모로 사용자 제스처 전달
└── style.css          공용 스타일
```

| 페이지 | 역할 | 형식 |
| --- | --- | --- |
| start | 인트로 / 작전 브리핑 (OPERATIVE/CALLSIGN/SECTOR…) | — |
| q1 | OBJ 01 — 봉쇄선 진입 | 객관식 |
| q2 | OBJ 02 — 형의 거처 / 일기 빈칸 | 주관식 |
| q3 | OBJ 03 — 감염 구역 / 배낭 한 개 | 객관식 |
| q4 | OBJ 04 — 형의 무전기 PIN 잠금 해제 | 주관식 (숫자) |
| q5 | OBJ 05 — 형과의 재회 / 결정의 순간 | 객관식 |
| end | 디브리핑 — 백신을 들고 봉쇄선 탈출 | — |

## 정답

| 페이지 | 정답 |
| --- | --- |
| q1 | C — 브루클린 다리 보급 게이트 |
| q2 | 기억 / 영혼 / 마음 / 인간성 (모두 정답 처리) |
| q3 | B — 방독면과 항바이러스제 |
| q4 | `0314` (또는 `314`) |
| q5 | B — 형이 건네는 것을 받는다 |

각 페이지의 `<script>` 블록 내부 `correct` / `accepted` 변수 수정으로 쉽게 변경 가능.

## 디자인 (Tactical HUD)

작전 HUD 톤. 풀스크린 그리드 레이아웃 + 사이드바(VITALS/장비/위협 정보) + 메인 OBJECTIVE 패널 + 상하단 상태바.

- **컬러** — 다크 배경(`#050807`) + 야시경 그린(`#00ff9c`) + 앰버 경고(`#ffb020`) + 크림슨 위험(`#ff3344`) + 잿빛 텍스트(`#c8e6cd`)
- **폰트** — Google Fonts: `Rajdhani` (본문/타이틀, 테크 산세리프), `Share Tech Mono` (라벨/메타, 모노)
- **이펙트**
  - 그리드 격자 + 비네팅
  - 패널 모서리 HUD 브래킷 (`::before`/`::after`)
  - REC 깜빡임, ECG 심전도 애니메이션
  - 진행에 따라 vitals 악화 (정상 → 경고 노란색 → 크리티컬 빨강)
  - 정답 시 화면 그린 플래시, 오답 시 적색 플래시 + shake
- **인터랙션** — 키보드 단축키 `[1]~[4]` 선택 + `Enter` 제출, 마우스 클릭 모두 지원
- **모바일** — 사이드바가 위로 스택, actions가 세로 정렬

## 힌트 시스템

각 문제 페이지에는 좌측 하단에 앰버색 `? HINT` 버튼이 있어 대응하는 힌트 페이지(`hint1.html` ~ `hint5.html`)로 이동.

힌트 페이지 톤은 본 작전(녹색)과 구분되게 **앰버 톤**으로 통일:
- 사이드바: `ANALYST` (SOURCE/CHANNEL/CONFIDENCE), `PROTOCOL` (UNLIMITED, NO PENALTY)
- 메인: `CLUE` / `NOTE` / `KEYWORD` 3단 구조 — 정답을 직접 알려주지 않고 유추 가능하게
- 하단: 녹색 `◂ RETURN TO OBJECTIVE` 버튼으로 원래 작전으로 복귀

## 사운드 시스템

외부 음원 파일 없이 **Web Audio API로 절차적 합성**. 100 BPM 4/4, D 마이너 진행(Dm → Bb → F → Am, i-VI-III-v) 4마디 루프.

**악기 구성**
- **Kick** (사인파 60→40Hz 피치 envelop) — 매 박
- **Snare** (밴드패스 노이즈 + 트라이앵글 보디) — 2, 4박 백비트
- **Hi-hat** (하이패스 노이즈 8.5kHz) — 8분음표
- **Arp** (사우 + 로우패스 Q=7, 컷오프 envelop) — 8분음표, 닷티드 8th 딜레이 send
- **Pad** (디튠 사우 두 개 → 로우패스) — 마디 단위 fade
- **Sub bass** (사인파) — 마디 첫 8박 펄스
- **Master** — 컴프레서로 글루

**볼륨 조정**: `ambient.js`의 `VOLUME = 0.18` 변경.

## iframe 래퍼 아키텍처

페이지 전환 시 음악이 끊기지 않도록 **부모 + iframe** 구조 채택. 부모 `index.html`은 절대 새로 로드되지 않고 음악만 재생, 실제 콘텐츠는 iframe 내부에서만 바뀜.

```
index.html (래퍼, 항상 살아있음)
├─ ambient.js               ← 음악 재생 (한 번만 로드)
└─ <iframe src="..."/>      ← 안의 페이지만 갈아끼움
       ├─ start.html  → DEPLOY → q1.html (iframe만 갱신)
       ├─ q1~q5.html  → CONFIRM/HINT 등으로 다음 페이지
       ├─ hint1~5.html → RETURN 으로 원위치
       └─ end.html    → REDEPLOY → start.html
```

**자동재생 정책 우회**
- 첫 방문 시 우측 하단 토글이 앰버 `▶ ENABLE SOUND`로 표시 — 클릭 시 즉시 시작
- 토글 안 누르고 iframe 내부 클릭 시 → `child-bridge.js`가 `postMessage`로 부모에 알리고 부모가 `audioContext.resume()` 시도

**토글 라벨은 액션 기준** (현재 상태가 아님)
- 음악 꺼짐 → `◆ SOUND ON` (그린, 클릭하면 켜짐)
- 음악 켜짐 → `◇ SOUND OFF` (그레이, 클릭하면 꺼짐)
- 시작 안 됨 → `▶ ENABLE SOUND` (앰버)

## 실행

### 로컬
서버 필요 없음. `index.html`을 브라우저로 열면 됨. 직접 `q1.html` 등을 열면 단독 페이지로 음악 없이 작동 (디버깅용).

### 배포
```bash
vercel deploy --prod --cwd D:/test/lockdown-hud --yes
```

⚠️ 현재 Vercel ↔ GitHub 자동 연동은 미설정 (Vercel 계정에 GitHub Login Connection 필요). 그 전엔 위 명령어로 수동 배포.

## 작업 이력

1. **v1 빌드** — `apocalypse-quiz/`에 라디오 방송/CRT 톤으로 5문제 + 가상 스토리 작성, 이후 사용자가 진짜 스토리(2030 펜데믹/카일 로크/LOCKDOWN CITY) 제공해 전면 재작성
2. **v2 시안 분기** — 같은 스토리·정답을 유지하면서 디자인/UI를 정반대 톤(군 작전 HUD)으로 다시 만든 샘플로 본 프로젝트 시작
3. **힌트 페이지 추가** — 5개 힌트 페이지 + 각 문제 페이지에 앰버 `? HINT` 버튼
4. **절차적 BGM 1차** — Web Audio API로 저음 드론/디튠 패드/잡음/소나 핑 합성 → "노이즈 느낌"이라 피드백
5. **BGM 재작업** — 100 BPM 4/4 + Dm-Bb-F-Am 진행 + 풀 드럼킷 + 아르페지오로 음악적 톤 전환
6. **iframe 래퍼 도입** — 페이지 전환 시 음악 끊김 해결, `child-bridge.js`로 자동재생 정책 우회
7. **토글 라벨 액션 기준** — 음악 켜짐 → "OFF" 버튼, 꺼짐 → "ON" 버튼으로 라벨 의미 정정
8. **GitHub 푸시 + Vercel 배포** — 신규 레포 `lockdown-city` 생성, https://lockdown-hud.vercel.app 라이브
