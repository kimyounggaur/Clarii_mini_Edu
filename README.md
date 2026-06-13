# 🎷 클라리 운지 마스터 (clarii-master)

Robkoo **Clarii mini(클라리 미니)** 의 색소폰 운지(출고 기본 모드)를 누구나 직관적으로 배우는
교육 웹앱. 공식 사용자 매뉴얼 EN V2.2(ClariiOS 2.2)의 운지표를 근거로 한 **비공식 학습 도구**입니다.

| 탭 | 기능 |
|---|---|
| 🎵 운지표 | 음 하나 = 한 화면 (앞면+뒷면+악보+소리), 옥타브 엘리베이터, 역방향 탐구 모드 |
| 📚 배우기 | 잡는 법부터 교차운지까지 12개 레슨 + 동요(비행기·학교종) 따라 연주 |
| 🎮 연습 | 운지 만들기 · 4지선다 · 귀 트기 · 60초 타임어택, 기록/스트릭 저장 |
| ⚙️ 설정 | 표기 방식 · 음색 · 운지 노출 토글 · **Web MIDI 실기 연결**(크롬/엣지) |

- 스택: Vite + React 18 + TypeScript + Tailwind CSS + zustand
- 오디오/악보/MIDI 전부 직접 구현 (외부 라이브러리 없음), PWA 오프라인 지원
- 운지 데이터 SSOT: [src/data/fingerings.json](src/data/fingerings.json) — 기기와 다르면 이 파일만 수정

## 로컬 실행

```bash
npm install
npm run dev   # http://localhost:5173
```

## 빌드 (Windows 주의)

이 프로젝트가 **한글 경로**에 있을 때, Windows + Node 25에서는 `npm run build`가
산출물을 다 만들고도 종료 단계에서 0xC0000409로 실패할 수 있습니다
(Node 25의 `fs.rmSync` 한글 경로 버그 + cmd 조상 프로세스 문제).

- **가장 쉬운 방법**: 탐색기에서 [빌드.cmd](빌드.cmd) 더블클릭 → `dist\` 생성
- 또는 PowerShell에서 직접:

```powershell
node node_modules\typescript\bin\tsc -b
node node_modules\vite\bin\vite.js build      # 산출물: %TEMP%\clarii-master-dist
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Copy-Item -Recurse "$env:TEMP\clarii-master-dist" dist
```

Linux/CI(Vercel 등)에서는 `npm run build`가 그대로 동작합니다.

## Vercel 배포 (처음이라면)

1. [vercel.com](https://vercel.com) 가입 → **Add New… → Project**
2. GitHub에 이 폴더를 푸시했다면 그 저장소 선택 (또는 `npx vercel` CLI로 폴더째 업로드)
3. Framework Preset: **Vite** (자동 감지) — Build `npm run build`, Output `dist` 그대로 두고 **Deploy**
4. 1~2분 뒤 `https://….vercel.app` 주소가 나옵니다

> CLI 사용 시: `npm i -g vercel` → 프로젝트 폴더에서 `vercel` → 안내를 따라 Enter 몇 번 → `vercel --prod`

### 배포 후 휴대폰 실기기 체크리스트

- [ ] 첫 탭 후 소리가 난다 (iOS는 무음 스위치 해제 확인)
- [ ] 운지표에서 음 이동 시 바뀐 키만 깜빡인다
- [ ] 홈 화면에 추가(안드로이드: 설치 배너 / iOS: 공유 → 홈 화면에 추가) 후 오프라인에서도 열린다
- [ ] (크롬/엣지 + USB) 설정 → 실기 연결 → 보정 → 연결 테스트에서 키가 실시간 반응한다

## 데이터가 내 기기와 다를 때

운지 한 음이 다르면 `src/data/fingerings.json`의 해당 항목만 고치세요. 컴포넌트/로직 수정은
불필요하며, 앱 시작 시 `validateFingerings()`가 무결성을 검사합니다. (기기 운지 모드가
**Saxophone**인지 먼저 확인 — EVI+/Whistle+면 차트가 전혀 다릅니다.)
