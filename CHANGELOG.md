# Changelog

## [2.0.0] - 2025-12-29

### 🔄 Breaking Changes - BSER API userId Migration

#### API 엔드포인트 변경

**원본 BSER API가 `userNum` 기반에서 `userId` 기반으로 전환되었습니다.**

#### 새로운 엔드포인트 (✅ 권장)

| 기존 (DEPRECATED) | 신규 (권장) |
|-------------------|-------------|
| `GET /rank/{userNum}/{season}/{mode}` | `GET /rank/uid/{userId}/{season}/{mode}` |
| `GET /user/stats/{userNum}/{season}` | `GET /user/stats/uid/{userId}/{season}` |
| `GET /user/games/{userNum}` | `GET /user/games/uid/{userId}` |
| `GET /unionTeam/{userNum}/{season}` | `GET /unionTeam/uid/{userId}/{season}` |

#### 기존 엔드포인트 동작 변경

**기존 `/rank/{userNum}/...` 형식의 엔드포인트:**
- ⚠️ **400 Bad Request** 응답 반환
- Deprecation 헤더 포함
- 마이그레이션 가이드 제공

**응답 예시:**
```json
{
  "code": 400,
  "message": "userNum-based API is no longer supported by BSER. Please use /user/nickname to get userId first, then use /rank/uid/{userId} endpoint.",
  "error": "DEPRECATED_ENDPOINT",
  "migration": {
    "step1": "GET /user/nickname?nickname={nickname} to get userId",
    "step2": "Use userId in /rank/uid/{userId}/{seasonId}/{matchingTeamMode}"
  }
}
```

### Added

- **새로운 라우트 추가**
  - `GET /rank/uid/:userId/:seasonId/:matchingTeamMode`
  - `GET /user/stats/uid/:userId/:seasonId`
  - `GET /user/stats/uid/:userId/:seasonId/:matchingMode`
  - `GET /user/games/uid/:userId`
  - `GET /unionTeam/uid/:userId/:seasonId`

- **userId 검증 미들웨어** (`validateUserId`)
  - 길이 검증 (20-100자)
  - 형식 검증 (Base64 URL-safe 문자만 허용)

- **UserID Resolver 서비스** (`src/services/userIdResolver.js`)
  - userId 캐싱 기능 (30분 TTL)
  - 닉네임 기반 userId 조회

- **응답 헤더**
  - `X-API-Deprecated: true` - 기존 엔드포인트 사용 시
  - `X-API-Deprecation-Message` - 마이그레이션 안내

### Changed

- **bserApi 서비스 업데이트**
  - 모든 API 메서드가 이제 `userId`를 파라미터로 받음
  - 원본 BSER API의 `/uid/` 경로 사용

- **응답 데이터 구조**
  - `/user/nickname` API 응답에서 `userNum` 제거, `userId` 추가
  ```json
  {
    "user": {
      "nickname": "kimint",
      "userId": "w8UmiFdu3UO7cKWMWEJGUhUzBay2O3R53qS1bdlAmc5lLR__nkYwoVU"
    }
  }
  ```

### Deprecated

- **기존 userNum 기반 엔드포인트**
  - `GET /rank/{userNum}/...` → 400 에러 반환
  - `GET /user/stats/{userNum}/...` → 400 에러 반환
  - `GET /user/games/{userNum}` → 400 에러 반환
  - `GET /unionTeam/{userNum}/...` → 400 에러 반환

### Documentation

- **[VALIDATION_REPORT.md](./VALIDATION_REPORT.md)** - 원본 API 검증 보고서
- **[README.md](./README.md)** - 업데이트된 사용 가이드
- **[API_REFERENCE.md](./API_REFERENCE.md)** - 새로운 API 문서

### Migration Guide

#### 1. userId 획득

```bash
# 1단계: 닉네임으로 userId 조회
curl "/user/nickname?nickname=kimint"

# 응답
{
  "code": 200,
  "message": "Success",
  "user": {
    "nickname": "kimint",
    "userId": "w8UmiFdu3UO7cKWMWEJGUhUzBay2O3R53qS1bdlAmc5lLR__nkYwoVU"
  }
}
```

#### 2. 새로운 엔드포인트 사용

```bash
# 2단계: userId로 API 호출
curl "/rank/uid/w8UmiFdu3UO7cKWMWEJGUhUzBay2O3R53qS1bdlAmc5lLR__nkYwoVU/3/1"
```

#### 3. 코드 마이그레이션 예시

**Before (더 이상 작동 안 함):**
```javascript
// ❌ 기존 방식
fetch(`/user/stats/${userNum}/3`)
```

**After (권장):**
```javascript
// ✅ 새로운 방식
// 1. userId 획득
const userResponse = await fetch(`/user/nickname?nickname=${nickname}`);
const { userId } = (await userResponse.json()).user;

// 2. userId 사용
const statsResponse = await fetch(`/user/stats/uid/${userId}/3`);
```

### Technical Details

#### 파일 변경 사항

1. **src/routes/index.js**
   - 신규 라우트 4개 추가 (uid 기반)
   - 기존 라우트 4개 deprecation 처리

2. **src/services/bserApi.js**
   - `getUserRank()`, `getUnionTeam()`, `getUserStats()`, `getUserGames()` 메서드 업데이트
   - 모든 메서드가 `/uid/` 경로 사용

3. **src/middleware/validation.js**
   - `validateUserId()` 추가
   - userId 형식 검증 로직

4. **src/services/userIdResolver.js** (신규)
   - userId 캐싱 서비스
   - 닉네임 → userId 변환 기능

### Testing

테스트 스크립트 제공:
- `./test_validation.sh` - BSER API 검증
- `./test_validation2.sh` - userId 테스트
- `./test_comparison.sh` - 구/신 방식 비교

---

## [1.0.0] - 2025-07-04

### Initial Release

- BSER API 캐시 프록시 서버 최초 릴리스
- Redis + Memory 다단계 캐싱
- Circuit Breaker 패턴
- Bull Queue 요청 관리
- Rate Limiting (분당 300 요청)
