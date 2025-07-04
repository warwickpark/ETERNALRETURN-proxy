#!/bin/bash

# 특정 기능 테스트 스크립트
# 실제 BSER API 키가 필요한 테스트들

BASE_URL=${1:-"http://localhost:3000"}

echo "🔍 BSER API 특정 기능 테스트"
echo "Base URL: $BASE_URL"
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# JSON 응답 확인 함수
check_json_response() {
    local name="$1"
    local url="$2"
    
    echo -e "\n${BLUE}🔍 $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s "$url")
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 유효한 JSON 응답${NC}"
        
        # 공통 필드 확인
        code=$(echo "$response" | jq -r '.code // empty')
        message=$(echo "$response" | jq -r '.message // empty')
        
        if [ -n "$code" ]; then
            echo "상태 코드: $code"
        fi
        if [ -n "$message" ]; then
            echo "메시지: $message"
        fi
        
        # 응답 크기 확인
        size=$(echo "$response" | wc -c)
        echo "응답 크기: ${size}바이트"
        
        # 첫 몇 줄만 표시
        echo "응답 미리보기:"
        echo "$response" | jq . | head -10
        
        if [ "$(echo "$response" | jq . | wc -l)" -gt 10 ]; then
            echo "..."
        fi
    else
        echo -e "${RED}❌ 잘못된 JSON 응답${NC}"
        echo "응답: $response"
    fi
}

# 캐시 테스트 함수
test_cache_performance() {
    local name="$1"
    local url="$2"
    
    echo -e "\n${YELLOW}⚡ 캐시 성능 테스트: $name${NC}"
    
    # 첫 번째 요청 (캐시 미스)
    echo "첫 번째 요청 (캐시 미스):"
    time1=$(date +%s%N)
    curl -s "$url" > /dev/null
    time2=$(date +%s%N)
    duration1=$(((time2 - time1) / 1000000))
    echo "소요 시간: ${duration1}ms"
    
    sleep 1
    
    # 두 번째 요청 (캐시 히트)
    echo "두 번째 요청 (캐시 히트):"
    time1=$(date +%s%N)
    curl -s "$url" > /dev/null
    time2=$(date +%s%N)
    duration2=$(((time2 - time1) / 1000000))
    echo "소요 시간: ${duration2}ms"
    
    if [ $duration2 -lt $duration1 ]; then
        improvement=$((duration1 - duration2))
        echo -e "${GREEN}✅ 캐시 효과: ${improvement}ms 개선${NC}"
    else
        echo -e "${YELLOW}⚠️  캐시 효과 미미 또는 측정 오차${NC}"
    fi
}

# 1. 기본 기능 테스트
echo -e "${YELLOW}📋 기본 API 테스트${NC}"
check_json_response "헬스 체크" "$BASE_URL/health"
check_json_response "서비스 통계" "$BASE_URL/stats"

# 2. 게임 데이터 테스트
echo -e "\n${YELLOW}🎮 게임 데이터 테스트${NC}"
check_json_response "데이터 해시" "$BASE_URL/v2/data/hash"
check_json_response "캐릭터 데이터" "$BASE_URL/v2/data/Character"
check_json_response "아이템 데이터" "$BASE_URL/v2/data/Item"

# 3. 언어 데이터 테스트
echo -e "\n${YELLOW}🌐 언어 데이터 테스트${NC}"
check_json_response "한국어 데이터" "$BASE_URL/v1/l10n/Korean"
check_json_response "영어 데이터" "$BASE_URL/v1/l10n/English"

# 4. 캐시 성능 테스트
echo -e "\n${YELLOW}⚡ 캐시 성능 테스트${NC}"
test_cache_performance "데이터 해시" "$BASE_URL/v2/data/hash"
test_cache_performance "캐릭터 데이터" "$BASE_URL/v2/data/Character"

# 5. 동시 요청 테스트
echo -e "\n${YELLOW}🚀 동시 요청 테스트${NC}"
echo "동시에 5개 요청 전송..."

pids=()
for i in {1..5}; do
    (
        time1=$(date +%s%N)
        curl -s "$BASE_URL/v2/data/hash" > /dev/null
        time2=$(date +%s%N)
        duration=$(((time2 - time1) / 1000000))
        echo "요청 $i: ${duration}ms"
    ) &
    pids+=($!)
done

# 모든 백그라운드 프로세스 대기
for pid in "${pids[@]}"; do
    wait $pid
done

echo -e "\n${GREEN}🎉 특정 기능 테스트 완료!${NC}"
echo "=================================="
echo "💡 추가 테스트:"
echo "  - 실제 유저 데이터: curl '$BASE_URL/user/nickname?nickname=실제닉네임'"
echo "  - 최신 시즌 랭킹: curl '$BASE_URL/v1/rank/top/최신시즌/1'"
echo "  - 로그 모니터링: docker compose logs -f bser-cache-proxy"