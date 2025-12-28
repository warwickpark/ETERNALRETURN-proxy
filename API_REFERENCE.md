# BSER Cache Proxy API Reference

고성능 BSER(Black Survival: Eternal Return) API 캐시 프록시 서버의 사용자 가이드입니다.

> ⚠️ **중요 변경 사항 (2025-12-29)**
> BSER API가 `userNum` → `userId` 기반으로 변경되었습니다.
> 기존 엔드포인트는 400 에러를 반환하며, 새로운 `/uid/` 경로를 사용해야 합니다.
> 자세한 내용은 [마이그레이션 가이드](#-마이그레이션-가이드-v20)를 참조하세요.

## 🚀 서비스 개요

- **기본 URL**: `http://your-domain.com` 또는 `http://localhost:3000`
- **프로토콜**: HTTP/HTTPS
- **응답 형식**: JSON
- **인증**: 불필요 (프록시 서버가 처리)
- **Rate Limiting**: 분당 300 요청 (전적검색 사이트 최적화)
- **버전**: 2.0.0 (userId 기반 시스템)

## 📋 지원 API 목록

### ✅ 활성 API (v2.0 - userId 기반)

| 분류 | 엔드포인트 | 상태 | 설명 |
|------|------------|------|------|
| 🔍 유저 조회 | `GET /user/nickname` | ✅ | 닉네임으로 userId 획득 |
| 📊 랭킹 정보 | `GET /v1/rank/top/{seasonId}/{teamMode}` | ✅ | 상위 랭커 목록 |
| 👤 유저 랭킹 | `GET /rank/uid/{userId}/{seasonId}/{teamMode}` | ✅ | 특정 유저 랭킹 (신규) |
| 📈 유저 통계 | `GET /user/stats/uid/{userId}/{seasonId}` | ✅ | 유저 시즌 통계 (신규) |
| 📈 유저 통계 V2 | `GET /user/stats/uid/{userId}/{seasonId}/{mode}` | ✅ | 모드별 통계 (신규) |
| 🎮 게임 기록 | `GET /user/games/uid/{userId}` | ✅ | 최근 90일 게임 기록 (신규) |
| 🛡️ 유니온 팀 | `GET /unionTeam/uid/{userId}/{seasonId}` | ✅ | 유니온 팀 정보 (신규) |
| 🏆 게임 결과 | `GET /games/{gameId}` | ✅ | 특정 게임 상세 결과 |
| 🗃️ 게임 데이터 | `GET /v2/data/{metaType}` | ✅ | 게임 메타 데이터 |
| 🌐 언어 데이터 | `GET /v1/l10n/{language}` | ✅ | 다국어 지원 데이터 |
| 🗡️ 추천 루트 | `GET /v1/weaponRoutes/recommend` | ✅ | 무기 루트 추천 |

### ⚠️ DEPRECATED API (userNum 기반 - 더 이상 작동 안 함)

| 엔드포인트 | 상태 | 대체 엔드포인트 |
|------------|------|------------------|
| `GET /rank/{userNum}/{seasonId}/{teamMode}` | ❌ | `GET /rank/uid/{userId}/{seasonId}/{teamMode}` |
| `GET /user/stats/{userNum}/{seasonId}` | ❌ | `GET /user/stats/uid/{userId}/{seasonId}` |
| `GET /user/games/{userNum}` | ❌ | `GET /user/games/uid/{userId}` |
| `GET /unionTeam/{userNum}/{seasonId}` | ❌ | `GET /unionTeam/uid/{userId}/{seasonId}` |

**Note**: Deprecated 엔드포인트는 400 Bad Request와 함께 마이그레이션 가이드를 반환합니다.

## 🔍 API 상세 가이드

### 1. 유저 닉네임 조회 (userId 획득)

**설명**: 닉네임으로 유저를 검색하고 `userId`를 획득합니다. 이 `userId`는 다른 모든 유저 관련 API에서 사용됩니다.

**요청**
```http
GET /user/nickname?nickname={nickname}
```

**예시**
```bash
curl "http://your-domain.com/user/nickname?nickname=kimint"
```

**응답 (v2.0 - userId 포함)**
```json
{
  "code": 200,
  "message": "Success",
  "user": {
    "nickname": "kimint",
    "userId": "zp9grpLa6Zb20f0K_zopz0uvlkQdzhziLEz5BhnQF7X5omdVUqNJiX0"
  }
}
```

> **중요**: 응답에서 `userId` (문자열)를 저장하여 다른 API 호출에 사용하세요.

### 2. 상위 랭커 조회

**요청**
```http
GET /v1/rank/top/{seasonId}/{matchingTeamMode}
```

**매개변수**
- `seasonId`: 시즌 번호 (1~N)
- `matchingTeamMode`: 1(솔로), 2(듀오), 3(스쿼드)

**예시**
```bash
curl "http://your-domain.com/v1/rank/top/3/1"
```

**응답**
```json
{
  "code": 200,
  "message": "Success",
  "topRanks": [
    {
      "userNum": 824539,
      "nickname": "Twitch사텐",
      "rank": 1,
      "mmr": 4360
    }
  ]
}
```

### 3. 유저 랭킹 조회 (신규 - userId 기반)

**요청**
```http
GET /rank/uid/{userId}/{seasonId}/{matchingTeamMode}
```

**매개변수**
- `userId`: 유저 ID (문자열, `/user/nickname`에서 획득)
- `seasonId`: 시즌 번호 (1~N)
- `matchingTeamMode`: 1(솔로), 2(듀오), 3(스쿼드)

**예시**
```bash
# 1단계: userId 획득
USERID=$(curl -s "http://your-domain.com/user/nickname?nickname=kimint" | jq -r '.user.userId')

# 2단계: 랭킹 조회
curl "http://your-domain.com/rank/uid/${USERID}/3/1"
```

**응답**
```json
{
  "code": 200,
  "message": "Success",
  "userRank": {
    "serverCode": 10,
    "mmr": 817,
    "serverRank": 0,
    "nickname": "kimint",
    "rank": 42979
  }
}
```

### 4. 유저 통계 조회 (신규 - userId 기반)

**요청**
```http
GET /user/stats/uid/{userId}/{seasonId}
GET /user/stats/uid/{userId}/{seasonId}/{matchingMode}
```

**매개변수**
- `userId`: 유저 ID (문자열)
- `seasonId`: 시즌 번호
- `matchingMode`: 2(일반), 3(랭크) - 선택사항

**예시**
```bash
curl "http://your-domain.com/user/stats/uid/${USERID}/3"
curl "http://your-domain.com/user/stats/uid/${USERID}/3/2"
```

### 5. 유저 게임 기록 (신규 - userId 기반)

**요청**
```http
GET /user/games/uid/{userId}
```

**매개변수**
- `userId`: 유저 ID (문자열)

**예시**
```bash
curl "http://your-domain.com/user/games/uid/${USERID}"
```

**응답**: 최근 90일간의 게임 기록 배열 반환

### 6. 유니온 팀 정보 (신규 - userId 기반)

**요청**
```http
GET /unionTeam/uid/{userId}/{seasonId}
```

**매개변수**
- `userId`: 유저 ID (문자열)
- `seasonId`: 시즌 번호

**예시**
```bash
curl "http://your-domain.com/unionTeam/uid/${USERID}/3"
```

### 7. 게임 메타 데이터

**요청**
```http
GET /v2/data/{metaType}
```

**주요 metaType**
- `hash`: 모든 데이터 해시
- `Character`: 캐릭터 정보
- `Item`: 아이템 정보
- `Monster`: 몬스터 정보

**예시**
```bash
curl "http://your-domain.com/v2/data/hash"
curl "http://your-domain.com/v2/data/Character"
```

### 8. 언어 데이터

**요청**
```http
GET /v1/l10n/{language}
```

**지원 언어**
- `Korean`, `English`, `Japanese`
- `ChineseSimplified`, `ChineseTraditional`
- `French`, `Spanish`, `German`, `Russian` 등

**예시**
```bash
curl "http://your-domain.com/v1/l10n/Korean"
```

## 🛠️ 시스템 모니터링 API

### 헬스 체크

**요청**
```http
GET /health
```

**응답**
```json
{
  "status": "ok",
  "timestamp": 1751573870463
}
```

### 서비스 통계

**요청**
```http
GET /stats
```

**응답**
```json
{
  "cache": {
    "memory": {
      "hits": 4,
      "misses": 7,
      "keys": 6,
      "ksize": 160,
      "vsize": 1440
    },
    "redis": {}
  },
  "queue": {
    "waiting": 0,
    "active": 0,
    "completed": 26,
    "failed": 30,
    "pending": 0
  },
  "circuitBreaker": {
    "bser-api": {
      "name": "bser-api",
      "state": "CLOSED",
      "failureCount": 0,
      "lastFailureTime": null,
      "totalRequests": 6,
      "successfulRequests": 5,
      "failedRequests": 1,
      "successRate": 83.33333333333334,
      "nextRetryTime": null
    }
  },
  "timestamp": 1751573927717
}
```

## ⚡ 성능 및 제한사항

### Rate Limiting

- **제한**: 분당 300 요청 (전적검색 사이트 최적화)
- **초과 시 응답**:
```json
{
  "code": 429,
  "message": "Too many requests from this IP",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

**응답 헤더**
```http
RateLimit-Policy: 300;w=60
RateLimit-Limit: 300
RateLimit-Remaining: 287
RateLimit-Reset: 48
```

### 캐시 정책 (전적검색 최적화 - 실시간성 강화)

| 데이터 타입 | 캐시 유지 시간 | 설명 |
|-------------|----------------|------|
| 게임 기록 | 3분 | 게임 직후 + API 반영 시간 고려 |
| 유저 통계 | 5분 | 시즌별 통계 데이터 |
| 유저 정보 | 5분 | 닉네임, 유니온 팀 정보 |
| 랭킹 정보 | 5분 | 상위 랭커, 개인 랭킹 |
| 메타 데이터 | 30분 | 캐릭터, 아이템, 언어 |
| 추천 루트 | 10분 | 커뮤니티 빌드 정보 |

## 🛡️ 보안 헤더

모든 응답에 포함되는 보안 헤더:

```http
Content-Security-Policy: default-src 'self';...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
```

## ❌ 에러 응답

### 400 Bad Request - 유효성 검사 실패
```json
{
  "code": 400,
  "message": "Nickname is required",
  "error": "VALIDATION_ERROR"
}
```

### 404 Not Found - 리소스 없음
```json
{
  "code": 404,
  "message": "Not Found"
}
```

### 429 Too Many Requests - Rate Limit 초과
```json
{
  "code": 429,
  "message": "Too many requests from this IP",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

### 503 Service Unavailable - 서비스 일시 중단
```json
{
  "code": 503,
  "message": "Service temporarily unavailable",
  "error": "CIRCUIT_BREAKER_OPEN"
}
```

## 📊 매개변수 참고

### 시즌 ID (seasonId)
- **0**: 일반 대전 (더 이상 지원하지 않음)
- **1~N**: 각 시즌 번호 (현재 시즌: 3)

### 매칭 팀 모드 (matchingTeamMode)
- **1**: 솔로
- **2**: 듀오  
- **3**: 스쿼드
- **8**: 유니온

### 매칭 모드 (matchingMode)
- **2**: 일반 모드
- **3**: 랭크 모드

### 서버 코드 (serverCode)
- **10**: Asia
- **17**: Asia2
- **12**: NorthAmerica
- **13**: Europe
- **14**: SouthAmerica

## 🔧 클라이언트 구현 예시

### JavaScript (Fetch) - v2.0 userId 기반

```javascript
class BSERClient {
  constructor(baseUrl = 'http://your-domain.com') {
    this.baseUrl = baseUrl;
  }

  // 1단계: 닉네임으로 userId 획득
  async getUserByNickname(nickname) {
    const response = await fetch(
      `${this.baseUrl}/user/nickname?nickname=${encodeURIComponent(nickname)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.user; // { nickname, userId }
  }

  // 2단계: userId로 유저 랭킹 조회
  async getUserRank(userId, seasonId = 3, teamMode = 1) {
    const response = await fetch(
      `${this.baseUrl}/rank/uid/${userId}/${seasonId}/${teamMode}`
    );
    return await response.json();
  }

  // 통합: 닉네임으로 랭킹 조회
  async getRankByNickname(nickname, seasonId = 3, teamMode = 1) {
    const user = await this.getUserByNickname(nickname);
    return await this.getUserRank(user.userId, seasonId, teamMode);
  }
}

// 사용 예시
const client = new BSERClient();
const rank = await client.getRankByNickname('kimint', 3, 1);
```

### Python (requests) - v2.0 userId 기반

```python
import requests

class BSERClient:
    def __init__(self, base_url="http://your-domain.com"):
        self.base_url = base_url

    def get_user_by_nickname(self, nickname):
        """닉네임으로 userId 획득"""
        response = requests.get(
            f"{self.base_url}/user/nickname",
            params={"nickname": nickname}
        )
        response.raise_for_status()
        return response.json()["user"]

    def get_user_rank(self, user_id, season_id=3, team_mode=1):
        """userId로 유저 랭킹 조회"""
        response = requests.get(
            f"{self.base_url}/rank/uid/{user_id}/{season_id}/{team_mode}"
        )
        response.raise_for_status()
        return response.json()

    def get_rank_by_nickname(self, nickname, season_id=3, team_mode=1):
        """통합: 닉네임으로 랭킹 조회"""
        user = self.get_user_by_nickname(nickname)
        return self.get_user_rank(user["userId"], season_id, team_mode)

# 사용 예시
client = BSERClient()
rank = client.get_rank_by_nickname("kimint", 3, 1)
```

### cURL
```bash
# 유저 조회
curl "http://your-domain.com/user/nickname?nickname=kimint"

# 랭킹 조회
curl "http://your-domain.com/v1/rank/top/3/1"

# 서비스 상태 확인
curl "http://your-domain.com/health"
```

## 🎯 베스트 프랙티스

1. **에러 처리**: 모든 요청에 대해 적절한 에러 처리 구현
2. **Rate Limit 준수**: 응답 헤더를 확인하여 요청 속도 조절
3. **캐시 활용**: 동일한 데이터 반복 요청 최소화
4. **타임아웃 설정**: 클라이언트 측에서 적절한 타임아웃 설정 (30초 권장)
5. **헬스 체크**: 정기적으로 `/health` 엔드포인트로 서비스 상태 확인

## 🆘 문제 해결

### 503 에러가 지속되는 경우
- 원본 BSER API 서버 문제일 가능성
- Circuit Breaker가 작동 중 (최대 5분 후 자동 복구)
- `/health` 엔드포인트로 서비스 상태 확인

### 429 에러 발생 시
- 1분 대기 후 재시도
- 요청 빈도 줄이기
- 배치 처리 고려

### 404 에러 응답
- 닉네임/ID 정확성 확인
- 시즌 번호 유효성 확인
- API 문서의 올바른 엔드포인트 확인

## 🔄 마이그레이션 가이드 (v2.0)

### BSER API userId 변경 사항

2025년 12월 29일부터 BSER Open API가 `userNum` (숫자)에서 `userId` (Base64 문자열)로 변경되었습니다.

### 주요 변경 사항

| 항목 | 기존 (v1.x) | 신규 (v2.0) |
|------|-------------|-------------|
| 유저 식별자 | `userNum` (숫자) | `userId` (문자열 ~55자) |
| 엔드포인트 | `/rank/{userNum}/...` | `/rank/uid/{userId}/...` |
| 획득 방법 | `/user/nickname` 응답 | `/user/nickname` 응답 |
| 형식 | 정수 (예: 431380) | Base64 URL-safe (예: `zp9grp...`) |

### 마이그레이션 단계

#### 1단계: userId 획득 로직 추가

**Before (v1.x)**
```javascript
const response = await fetch('/user/nickname?nickname=kimint');
const { userNum } = response.user;  // 숫자
```

**After (v2.0)**
```javascript
const response = await fetch('/user/nickname?nickname=kimint');
const { userId } = response.user;  // 문자열
```

#### 2단계: 엔드포인트 경로 변경

**Before (v1.x) - 더 이상 작동 안 함**
```bash
curl "/user/stats/431380/3"
# 응답: 400 Bad Request
```

**After (v2.0)**
```bash
# 1. userId 획득
USERID=$(curl -s "/user/nickname?nickname=kimint" | jq -r '.user.userId')

# 2. 새 엔드포인트 사용
curl "/user/stats/uid/${USERID}/3"
# 응답: 200 OK
```

#### 3단계: 저장된 데이터 마이그레이션

기존에 `userNum`을 저장하고 있었다면:
1. **옵션 A**: `userNum`을 삭제하고 `userId`만 저장
2. **옵션 B**: `/user/nickname`으로 다시 조회하여 `userId` 획득

**권장**: 데이터베이스/캐시에서 `userNum` 필드를 `userId`로 교체

### Deprecated 엔드포인트 응답

기존 엔드포인트 호출 시 다음과 같은 응답을 받습니다:

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

### 영향받는 엔드포인트

✅ **변경 필요**:
- `GET /rank/{userNum}/{seasonId}/{mode}` → `GET /rank/uid/{userId}/{seasonId}/{mode}`
- `GET /user/stats/{userNum}/{seasonId}` → `GET /user/stats/uid/{userId}/{seasonId}`
- `GET /user/games/{userNum}` → `GET /user/games/uid/{userId}`
- `GET /unionTeam/{userNum}/{seasonId}` → `GET /unionTeam/uid/{userId}/{seasonId}`

✅ **변경 불필요** (정상 작동):
- `GET /user/nickname`
- `GET /v1/rank/top/{seasonId}/{mode}`
- `GET /v2/data/{metaType}`
- `GET /v1/l10n/{language}`
- `GET /games/{gameId}`

### 완전한 마이그레이션 예시

**JavaScript**
```javascript
// Before (v1.x)
async function getUserStats(userNum, seasonId) {
  const response = await fetch(`/user/stats/${userNum}/${seasonId}`);
  return await response.json();
}

// After (v2.0)
async function getUserStats(nickname, seasonId) {
  // 1. userId 획득
  const userResponse = await fetch(`/user/nickname?nickname=${nickname}`);
  const { userId } = (await userResponse.json()).user;

  // 2. 새 엔드포인트 사용
  const statsResponse = await fetch(`/user/stats/uid/${userId}/${seasonId}`);
  return await statsResponse.json();
}
```

**Python**
```python
# Before (v1.x)
def get_user_stats(user_num, season_id):
    return requests.get(f"/user/stats/{user_num}/{season_id}").json()

# After (v2.0)
def get_user_stats(nickname, season_id):
    # 1. userId 획득
    user_data = requests.get("/user/nickname", params={"nickname": nickname}).json()
    user_id = user_data["user"]["userId"]

    # 2. 새 엔드포인트 사용
    return requests.get(f"/user/stats/uid/{user_id}/{season_id}").json()
```

### 테스트 스크립트

프로젝트에 포함된 테스트 스크립트로 마이그레이션을 검증할 수 있습니다:

```bash
# 신규 API 테스트
./test_script/test_new_endpoints.sh

# 기존 API와 신규 API 비교
./test_script/test_comparison.sh
```

---

**📞 지원**: [GitHub Issues](https://github.com/your-repo/issues) 또는 관리자 문의

**📚 추가 문서**:
- [VALIDATION_REPORT.md](./VALIDATION_REPORT.md) - BSER API 검증 보고서
- [CHANGELOG.md](./CHANGELOG.md) - 버전 2.0.0 변경 사항
- [README.md](./README.md) - 프로젝트 개요