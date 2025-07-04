# BSER Cache Proxy API Reference

고성능 BSER(Black Survival: Eternal Return) API 캐시 프록시 서버의 사용자 가이드입니다.

## 🚀 서비스 개요

- **기본 URL**: `http://your-domain.com` 또는 `http://localhost:3000`
- **프로토콜**: HTTP/HTTPS
- **응답 형식**: JSON
- **인증**: 불필요 (프록시 서버가 처리)
- **Rate Limiting**: 분당 300 요청 (전적검색 사이트 최적화)

## 📋 지원 API 목록

### ✅ 완전 지원 API

| 분류 | 엔드포인트 | 상태 | 설명 |
|------|------------|------|------|
| 🔍 유저 조회 | `GET /user/nickname` | ✅ | 닉네임으로 유저 정보 조회 |
| 📊 랭킹 정보 | `GET /v1/rank/top/{seasonId}/{teamMode}` | ✅ | 상위 랭커 목록 |
| 👤 유저 랭킹 | `GET /rank/{userNum}/{seasonId}/{teamMode}` | ✅ | 특정 유저 랭킹 |
| 📈 유저 통계 | `GET /user/stats/{userNum}/{seasonId}` | ✅ | 유저 시즌 통계 |
| 🎮 게임 기록 | `GET /user/games/{userNum}` | ✅ | 유저 최근 90일 게임 기록 |
| 🏆 게임 결과 | `GET /games/{gameId}` | ✅ | 특정 게임 상세 결과 |
| 🛡️ 유니온 팀 | `GET /unionTeam/{userNum}/{seasonId}` | ✅ | 유니온 팀 정보 |
| 🗃️ 게임 데이터 | `GET /v2/data/{metaType}` | ✅ | 게임 메타 데이터 |
| 🌐 언어 데이터 | `GET /v1/l10n/{language}` | ✅ | 다국어 지원 데이터 |
| 🗡️ 추천 루트 | `GET /v1/weaponRoutes/recommend` | ✅ | 무기 루트 추천 |

### ❌ 제한된 API

| 엔드포인트 | 상태 | 이유 |
|------------|------|------|
| `GET /v2/rank/top/{seasonId}/{serverCode}/{teamMode}` | ❌ | 서버별 랭킹 - 권한 제한 |

## 🔍 API 상세 가이드

### 1. 유저 닉네임 조회

**요청**
```http
GET /user/nickname?nickname={nickname}
```

**예시**
```bash
curl "http://your-domain.com/user/nickname?nickname=kimint"
```

**응답**
```json
{
  "code": 200,
  "message": "Success",
  "user": {
    "userNum": 431380,
    "nickname": "kimint"
  }
}
```

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

### 3. 유저 랭킹 조회

**요청**
```http
GET /rank/{userNum}/{seasonId}/{matchingTeamMode}
```

**예시**
```bash
curl "http://your-domain.com/rank/431380/3/1"
```

**응답**
```json
{
  "code": 200,
  "message": "Success",
  "userRank": {
    "userNum": 431380,
    "serverCode": 10,
    "mmr": 817,
    "serverRank": 0,
    "nickname": "kimint",
    "rank": 42979
  }
}
```

### 4. 유저 통계 조회

**요청**
```http
GET /user/stats/{userNum}/{seasonId}
GET /user/stats/{userNum}/{seasonId}/{matchingMode}
```

**매개변수**
- `matchingMode`: 2(일반), 3(랭크) - 선택사항

**예시**
```bash
curl "http://your-domain.com/user/stats/431380/3"
```

### 5. 유저 게임 기록

**요청**
```http
GET /user/games/{userNum}
```

**예시**
```bash
curl "http://your-domain.com/user/games/431380"
```

### 6. 게임 메타 데이터

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

### 7. 언어 데이터

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

### JavaScript (Fetch)
```javascript
async function getUserByNickname(nickname) {
  const response = await fetch(`/user/nickname?nickname=${encodeURIComponent(nickname)}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

async function getTopRankers(seasonId = 3, teamMode = 1) {
  const response = await fetch(`/v1/rank/top/${seasonId}/${teamMode}`);
  return await response.json();
}
```

### Python (requests)
```python
import requests

def get_user_by_nickname(nickname, base_url="http://your-domain.com"):
    response = requests.get(f"{base_url}/user/nickname", params={"nickname": nickname})
    response.raise_for_status()
    return response.json()

def get_top_rankers(season_id=3, team_mode=1, base_url="http://your-domain.com"):
    response = requests.get(f"{base_url}/v1/rank/top/{season_id}/{team_mode}")
    return response.json()
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

---

**📞 지원**: [GitHub Issues](https://github.com/your-repo/issues) 또는 관리자 문의