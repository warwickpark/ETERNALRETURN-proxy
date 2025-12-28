# BSER API 엔드포인트 변경 검증 보고서

**검증 일시**: 2025-12-29
**대상**: BSER Open API (https://open-api.bser.io)

---

## 📊 검증 결과 요약

### ✅ 확인된 사항

1. **원본 API가 변경되었습니다**
   - 기존 방식 (`v1/rank/{userNum}/...`) → **401 Unauthorized**
   - 새로운 방식 (`v1/rank/uid/{userId}/...`) → **200 Success**

2. **변경 범위**
   - 유저 ID 파라미터: `userNum` (숫자) → `userId` (문자열)
   - 엔드포인트 경로: 직접 사용 → `uid/` 프리픽스 추가
   - userId 형식: Base64 인코딩 문자열 (약 55자)

---

## 🔍 상세 검증 내용

### 1. 유저 정보 조회 API (변경 없음)

**엔드포인트**: `GET /v1/user/nickname?query={nickname}`

**응답 예시**:
```json
{
  "code": 200,
  "message": "Success",
  "user": {
    "nickname": "kimint",
    "userId": "w8UmiFdu3UO7cKWMWEJGUhUzBay2O3R53qS1bdlAmc5lLR__nkYwoVU"
  }
}
```

**특징**:
- `userNum` 필드가 **제거**되고 `userId` 필드로 **대체**됨
- userId는 문자열 형식 (Base64 인코딩으로 추정)

---

### 2. 기존 방식 (더 이상 작동 안 함)

**테스트 엔드포인트**:
- `GET /v1/rank/431380/3/1`
- `GET /v1/user/stats/431380/3`
- `GET /v1/user/games/431380`
- `GET /v1/unionTeam/431380/3`

**결과**: 모두 **401 Unauthorized**

```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

---

### 3. 새로운 방식 (정상 작동)

**테스트 엔드포인트**:
- `GET /v1/rank/uid/{userId}/3/1`
- `GET /v1/user/stats/uid/{userId}/3`
- `GET /v1/user/games/uid/{userId}`
- `GET /v1/unionTeam/uid/{userId}/3`

**userId 예시**: `w8UmiFdu3UO7cKWMWEJGUhUzBay2O3R53qS1bdlAmc5lLR__nkYwoVU`

**결과**: 모두 **200 Success**

**응답 예시 (유저 랭크)**:
```json
{
  "code": 200,
  "message": "Success",
  "userRank": {
    "nickname": "kimint",
    "serverCode": 10,
    "mmr": 817,
    "rank": 42979,
    "serverRank": 0
  }
}
```

**응답 예시 (유저 게임 기록)**:
```json
{
  "code": 200,
  "message": "Success",
  "userGames": [
    {
      "nickname": "kimint",
      "gameId": 55590928,
      "seasonId": 0,
      "matchingMode": 2,
      "characterNum": 31,
      "gameRank": 6,
      "playerKill": 4,
      ...
    }
  ]
}
```

---

## 📝 주요 발견 사항

### userId 형식 분석

```
예시 1: w8UmiFdu3UO7cKWMWEJGUhUzBay2O3R53qS1bdlAmc5lLR__nkYwoVU
예시 2: ZHhjDXsJHMzWayEkGUqcSRxqg69NBhg44gIBFGsPZLHROBDDr1TUEnk
예시 3: te0I42cL1tvzeoLriyWkJdrC8ONc976Fq9pxSSRDfbh1NsRLmabTI3o
```

**특징**:
- 길이: 약 55-60자
- 문자: 영문 대소문자 + 숫자 + `_` (Base64 URL-safe 인코딩)
- 유저별로 고유하며 매 호출 시 동일하게 유지됨 (일관성 확인)

### 응답 데이터 구조 변경

**중요**: 응답 JSON 내부의 `userNum` 필드는 **여전히 존재**합니다!

예시:
```json
{
  "killerUserNum": 665772,    // ← 여전히 userNum 사용
  "killerUserNum2": 229796    // ← 여전히 userNum 사용
}
```

**결론**:
- **URL 경로**에서만 `userNum` → `userId` 변경
- **응답 데이터**의 필드명은 그대로 유지

---

## 🚨 영향받는 엔드포인트

현재 프록시 서버에서 수정이 필요한 API:

| 엔드포인트 | 기존 | 신규 | 영향도 |
|-----------|------|------|--------|
| 유저 랭크 | `/rank/{userNum}/...` | `/rank/uid/{userId}/...` | 🔴 HIGH |
| 유저 통계 | `/user/stats/{userNum}/...` | `/user/stats/uid/{userId}/...` | 🔴 HIGH |
| 유저 게임 | `/user/games/{userNum}` | `/user/games/uid/{userId}` | 🔴 HIGH |
| 유니온 팀 | `/unionTeam/{userNum}/...` | `/unionTeam/uid/{userId}/...` | 🔴 HIGH |

**변경 불필요**:
- `/v1/user/nickname` ✅ (정상 작동, 그대로 사용)
- `/v1/rank/top/...` ✅ (userNum 파라미터 없음)
- `/v2/data/...` ✅ (메타데이터 API)
- `/v1/l10n/...` ✅ (언어 데이터)

---

## 💡 마이그레이션 전략 제안

### 옵션 1: 완전 교체 (권장)

모든 엔드포인트를 새로운 형식으로 변경

**장점**:
- 원본 API와 완전 호환
- 향후 유지보수 간편

**단점**:
- 기존 클라이언트에서 호환성 깨짐

### 옵션 2: 하이브리드 방식

userId와 userNum 모두 지원 (자동 변환)

**구현 방법**:
1. `/rank/{identifier}/...` 형식 유지
2. `identifier`가 숫자면 → `/v1/user/nickname`으로 userId 조회 후 변환
3. `identifier`가 문자열이면 → 그대로 `uid/{userId}` 형식으로 요청

**장점**:
- 기존 클라이언트 호환성 유지
- 점진적 마이그레이션 가능

**단점**:
- 추가 API 호출로 인한 레이턴시 증가
- 코드 복잡도 증가

---

## 🔧 필요한 변경 사항

### 1. 파라미터 검증 (validation.js)

```javascript
// 기존
const validateUserNum = (req, res, next) => {
  const { userNum } = req.params;
  if (!userNum || isNaN(userNum)) { ... }
};

// 변경 후
const validateUserId = (req, res, next) => {
  const { userId } = req.params;
  if (!userId || userId.length < 10 || userId.length > 100) {
    return res.status(400).json({
      code: 400,
      message: 'Valid user ID is required',
      error: 'VALIDATION_ERROR'
    });
  }
  next();
};
```

### 2. 라우트 정의 (routes/index.js)

```javascript
// 기존
router.get('/rank/:userNum/:seasonId/:matchingTeamMode', ...)

// 변경 후
router.get('/rank/uid/:userId/:seasonId/:matchingTeamMode', ...)
```

### 3. API 서비스 (services/bserApi.js)

```javascript
// 기존
async getUserRank(userNum, seasonId, matchingTeamMode) {
  return this.makeRequest(`v1/rank/${userNum}/${seasonId}/${matchingTeamMode}`);
}

// 변경 후
async getUserRank(userId, seasonId, matchingTeamMode) {
  return this.makeRequest(`v1/rank/uid/${userId}/${seasonId}/${matchingTeamMode}`);
}
```

---

## ✅ 검증 완료 체크리스트

- [x] 원본 API에서 기존 방식 테스트 (401 확인)
- [x] 원본 API에서 새로운 방식 테스트 (200 확인)
- [x] userId 형식 분석
- [x] 응답 데이터 구조 확인
- [x] 영향받는 엔드포인트 식별
- [x] 변경 범위 문서화

---

## 📌 다음 단계

1. **옵션 선택**: 완전 교체 vs 하이브리드
2. **코드 수정**: routes, services, validation
3. **문서 업데이트**: README, API_REFERENCE
4. **테스트**: 단위 테스트 + 통합 테스트
5. **배포**: 프로덕션 환경 적용

---

**보고서 작성**: Claude Code
**검증 스크립트**: `test_validation.sh`, `test_validation2.sh`, `test_comparison.sh`
