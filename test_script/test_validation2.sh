#!/bin/bash

source .env

API_KEY="$BSER_API_KEY"
BASE_URL="$BSER_API_BASE_URL"

echo "🔍 BSER API 검증 (실제 userId 사용)"
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
    
    echo -e "\n${BLUE}🔍 테스트: $name${NC}"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -w "\nHTTPSTATUS:%{http_code}" \
        -H "x-api-key: $API_KEY" \
        "$BASE_URL/$endpoint")
    
    http_status=$(echo "$response" | grep "HTTPSTATUS:" | sed 's/HTTPSTATUS://')
    body=$(echo "$response" | sed '/HTTPSTATUS:/d')
    
    echo -e "Status: ${http_status}"
    echo "$body" | jq -C '.' 2>/dev/null || echo "$body"
    
    sleep 1
}

# 실제 userId 얻기
echo -e "${YELLOW}1. 실제 userId 얻기${NC}"
test_api "유저 조회 (kimint)" "v1/user/nickname?query=kimint"

# 위 응답에서 얻은 userId
USERID="te0I42cL1tvzeoLriyWkJdrC8ONc976Fq9pxSSRDfbh1NsRLmabTI3o"

echo -e "\n${YELLOW}2. 새로운 방식 (userId 사용)${NC}"
test_api "유저 랭크 (신규 방식)" "v1/rank/uid/${USERID}/3/1"
test_api "유저 통계 (신규 방식)" "v1/user/stats/uid/${USERID}/3"
test_api "유저 게임 기록 (신규 방식)" "v1/user/games/uid/${USERID}"
test_api "유니온 팀 (신규 방식)" "v1/unionTeam/uid/${USERID}/3"

echo -e "\n${YELLOW}3. 기존 방식 (userNum 431380 사용 - 비교용)${NC}"
test_api "유저 랭크 (기존 방식)" "v1/rank/431380/3/1"
test_api "유저 통계 (기존 방식)" "v1/user/stats/431380/3"

echo -e "\n${GREEN}🎉 검증 완료!${NC}"
