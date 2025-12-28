#!/bin/bash

# BSER API 검증 스크립트
# .env 파일의 API 키를 사용하여 원본 서버 테스트

source .env

API_KEY="$BSER_API_KEY"
BASE_URL="$BSER_API_BASE_URL"

echo "🔍 BSER API 검증 시작"
echo "Base URL: $BASE_URL"
echo "API Key: ${API_KEY:0:10}..."
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 테스트 함수
test_api() {
    local name="$1"
    local endpoint="$2"
    local expected_status="${3:-200}"
    
    echo -e "\n${BLUE}🔍 테스트: $name${NC}"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -w "\nHTTPSTATUS:%{http_code}" \
        -H "x-api-key: $API_KEY" \
        "$BASE_URL/$endpoint")
    
    http_status=$(echo "$response" | grep "HTTPSTATUS:" | sed 's/HTTPSTATUS://')
    body=$(echo "$response" | sed '/HTTPSTATUS:/d')
    
    if [ "$http_status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ 성공 (HTTP $http_status)${NC}"
        echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ 실패 (HTTP $http_status, 예상: $expected_status)${NC}"
        echo "응답: $body"
    fi
    
    sleep 1
}

# 1. 기본 API 확인 (메타데이터 - 항상 동작해야 함)
echo -e "\n${YELLOW}📦 기본 데이터 테스트${NC}"
test_api "게임 데이터 해시" "v2/data/hash"

# 2. 유저 닉네임 조회로 실제 userNum 얻기
echo -e "\n${YELLOW}👤 유저 정보 테스트${NC}"
test_api "유저 닉네임 조회 (kimint)" "v1/user/nickname?query=kimint"

# 3. 현재 방식 테스트 (v1/rank/{userNum}/...)
echo -e "\n${YELLOW}📊 현재 엔드포인트 방식 테스트 (v1/rank/{userNum}/...)${NC}"
test_api "유저 랭크 조회 (현재)" "v1/rank/431380/3/1"
test_api "유저 통계 조회 (현재)" "v1/user/stats/431380/3"
test_api "유저 게임 기록 (현재)" "v1/user/games/431380"
test_api "유니온 팀 정보 (현재)" "v1/unionTeam/431380/3"

# 4. 새로운 방식 테스트 (v1/rank/uid/{userId}/...)
echo -e "\n${YELLOW}🆕 새로운 엔드포인트 방식 테스트 (v1/rank/uid/{userId}/...)${NC}"
test_api "유저 랭크 조회 (신규)" "v1/rank/uid/431380/3/1"
test_api "유저 통계 조회 (신규)" "v1/user/stats/uid/431380/3"
test_api "유저 게임 기록 (신규)" "v1/user/games/uid/431380"
test_api "유니온 팀 정보 (신규)" "v1/unionTeam/uid/431380/3"

echo -e "\n${GREEN}🎉 검증 완료!${NC}"
echo "=================================="
