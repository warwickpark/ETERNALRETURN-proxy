#!/bin/bash

# BSER Cache Proxy API 테스트 스크립트
# 사용법: ./test-api.sh [BASE_URL]

BASE_URL=${1:-"http://localhost:3000"}
DELAY=1

echo "🚀 BSER Cache Proxy API 테스트 시작"
echo "Base URL: $BASE_URL"
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 함수
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -e "\n${BLUE}🔍 테스트: $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//')
    
    if [ "$http_status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ 성공 (HTTP $http_status)${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "$body" | jq . 2>/dev/null || echo "$body"
        fi
    else
        echo -e "${RED}❌ 실패 (HTTP $http_status, 예상: $expected_status)${NC}"
        echo "응답: $body"
    fi
    
    sleep $DELAY
}

# 1. 헬스 체크
test_endpoint "헬스 체크" "$BASE_URL/health"

# 2. 루트 엔드포인트
test_endpoint "루트 엔드포인트" "$BASE_URL/"

# 3. 서비스 통계
test_endpoint "서비스 통계" "$BASE_URL/stats"

# 4. 유저 닉네임 조회 (샘플)
echo -e "\n${YELLOW}📝 유저 정보 테스트${NC}"
test_endpoint "유저 닉네임 조회" "$BASE_URL/user/nickname?nickname=TestUser"

# 5. 상위 랭커 조회 (V1)
echo -e "\n${YELLOW}🏆 랭킹 정보 테스트${NC}"
test_endpoint "상위 랭커 조회 (V1)" "$BASE_URL/v1/rank/top/3/1"

# 6. 상위 랭커 조회 (V2)
test_endpoint "상위 랭커 조회 (V2)" "$BASE_URL/v2/rank/top/3/10/1"

# 7. 유저 랭크 조회
test_endpoint "유저 랭크 조회" "$BASE_URL/rank/1234567/3/1"

# 8. 게임 데이터 조회
echo -e "\n${YELLOW}🎮 게임 데이터 테스트${NC}"
test_endpoint "게임 데이터 해시 조회" "$BASE_URL/v2/data/hash"

# 9. 언어 데이터 조회
test_endpoint "언어 데이터 조회" "$BASE_URL/v1/l10n/Korean"

# 10. 추천 루트 조회
test_endpoint "추천 루트 조회" "$BASE_URL/v1/weaponRoutes/recommend"

# 11. 에러 테스트
echo -e "\n${YELLOW}⚠️  에러 처리 테스트${NC}"
test_endpoint "잘못된 엔드포인트" "$BASE_URL/invalid/endpoint" 404
test_endpoint "잘못된 닉네임 파라미터" "$BASE_URL/user/nickname" 400
test_endpoint "잘못된 시즌 ID" "$BASE_URL/v1/rank/top/999/1" 200

# 12. Rate Limiting 테스트
echo -e "\n${YELLOW}🚦 Rate Limiting 테스트${NC}"
echo "연속 요청 5회 전송..."
for i in {1..5}; do
    echo -n "요청 $i: "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
    if [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ ($status)${NC}"
    fi
    sleep 0.2
done

echo -e "\n${GREEN}🎉 테스트 완료!${NC}"
echo "=================================="
echo "💡 팁:"
echo "  - 실제 닉네임으로 테스트하려면: ./test-api.sh"
echo "  - 다른 서버로 테스트하려면: ./test-api.sh https://your-domain.com"
echo "  - 로그 확인: docker compose logs bser-cache-proxy"
echo "  - 서비스 상태: docker compose ps"