#!/bin/bash

# 새로운 엔드포인트 테스트 스크립트
BASE_URL=${1:-"http://localhost:3000"}

echo "🧪 BSER Cache Proxy - 신규 API 테스트"
echo "Base URL: $BASE_URL"
echo "========================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 테스트 함수
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"

    echo -e "\n${BLUE}🔍 테스트: $name${NC}"
    echo "URL: $url"

    response=$(curl -s -w "\nHTTPSTATUS:%{http_code}" "$url")
    http_status=$(echo "$response" | grep "HTTPSTATUS:" | sed 's/HTTPSTATUS://')
    body=$(echo "$response" | sed '/HTTPSTATUS:/d')

    if [ "$http_status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ 성공 (HTTP $http_status)${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        fi
    else
        echo -e "${RED}❌ 실패 (HTTP $http_status, 예상: $expected_status)${NC}"
        echo "응답: $body"
    fi

    sleep 0.5
}

# 1. 헬스 체크
echo -e "\n${YELLOW}━━━ 기본 엔드포인트 테스트 ━━━${NC}"
test_endpoint "헬스 체크" "$BASE_URL/health"

# 2. 유저 닉네임 조회 (userId 획득)
echo -e "\n${YELLOW}━━━ 유저 정보 조회 (userId 획득) ━━━${NC}"
USER_RESPONSE=$(curl -s "$BASE_URL/user/nickname?nickname=kimint")
test_endpoint "유저 닉네임 조회" "$BASE_URL/user/nickname?nickname=kimint"

# userId 추출
USERID=$(echo "$USER_RESPONSE" | jq -r '.user.userId' 2>/dev/null)
echo -e "${BLUE}→ 획득한 userId: $USERID${NC}"

# 3. 새로운 엔드포인트 테스트 (/uid/ 프리픽스)
if [ -n "$USERID" ] && [ "$USERID" != "null" ]; then
    echo -e "\n${YELLOW}━━━ 신규 API 테스트 (/uid/ 경로) ━━━${NC}"

    test_endpoint "유저 랭크 조회 (신규)" "$BASE_URL/rank/uid/$USERID/3/1"
    test_endpoint "유저 통계 조회 (신규)" "$BASE_URL/user/stats/uid/$USERID/3"
    test_endpoint "유저 게임 기록 (신규)" "$BASE_URL/user/games/uid/$USERID"
    test_endpoint "유니온 팀 정보 (신규)" "$BASE_URL/unionTeam/uid/$USERID/3"
else
    echo -e "${RED}❌ userId를 획득하지 못했습니다.${NC}"
fi

# 4. 기존 엔드포인트 테스트 (DEPRECATED - 400 예상)
echo -e "\n${YELLOW}━━━ 기존 API 테스트 (DEPRECATED - 400 예상) ━━━${NC}"
test_endpoint "유저 랭크 조회 (기존)" "$BASE_URL/rank/431380/3/1" 400
test_endpoint "유저 통계 조회 (기존)" "$BASE_URL/user/stats/431380/3" 400
test_endpoint "유저 게임 기록 (기존)" "$BASE_URL/user/games/431380" 400
test_endpoint "유니온 팀 정보 (기존)" "$BASE_URL/unionTeam/431380/3" 400

# 5. 데이터 API (변경 없음)
echo -e "\n${YELLOW}━━━ 데이터 API 테스트 (변경 없음) ━━━${NC}"
test_endpoint "상위 랭커 조회" "$BASE_URL/v1/rank/top/3/1"
test_endpoint "게임 메타데이터" "$BASE_URL/v2/data/hash"
test_endpoint "언어 데이터" "$BASE_URL/v1/l10n/Korean"

# 6. 서비스 통계
echo -e "\n${YELLOW}━━━ 모니터링 API ━━━${NC}"
test_endpoint "서비스 통계" "$BASE_URL/stats"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 테스트 완료!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}📊 요약:${NC}"
echo "  ✅ 신규 API (/uid/ 경로) → 200 OK 예상"
echo "  ⚠️  기존 API (userNum 기반) → 400 Bad Request + 마이그레이션 가이드"
echo "  ✅ 기타 API → 정상 작동"
