#!/bin/bash

# 부하 테스트 스크립트
# Apache Bench (ab) 또는 curl을 사용한 간단한 부하 테스트

BASE_URL=${1:-"http://localhost:3000"}
REQUESTS=${2:-100}
CONCURRENCY=${3:-10}

echo "🔥 BSER Cache Proxy 부하 테스트"
echo "Base URL: $BASE_URL"
echo "총 요청 수: $REQUESTS"
echo "동시 연결 수: $CONCURRENCY"
echo "=================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Apache Bench 설치 확인
if command -v ab >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Apache Bench 사용${NC}"
    USE_AB=true
else
    echo -e "${YELLOW}⚠️  Apache Bench 없음, curl 사용${NC}"
    echo "설치: sudo apt-get install apache2-utils"
    USE_AB=false
fi

# 테스트 엔드포인트들
endpoints=(
    "/health:헬스 체크"
    "/stats:서비스 통계"
    "/v2/data/hash:데이터 해시"
    "/v1/l10n/Korean:언어 데이터"
)

# Apache Bench 테스트
test_with_ab() {
    local endpoint="$1"
    local name="$2"
    
    echo -e "\n${BLUE}🚀 테스트: $name${NC}"
    echo "엔드포인트: $endpoint"
    
    ab -n $REQUESTS -c $CONCURRENCY -q "$BASE_URL$endpoint" | grep -E "(Requests per second|Time per request|Transfer rate|Failed requests)"
}

# curl 기반 간단 테스트
test_with_curl() {
    local endpoint="$1"
    local name="$2"
    
    echo -e "\n${BLUE}🚀 테스트: $name${NC}"
    echo "엔드포인트: $endpoint"
    
    success=0
    failed=0
    total_time=0
    
    echo "진행률: "
    for i in $(seq 1 $REQUESTS); do
        if [ $((i % 10)) -eq 0 ]; then
            echo -n "."
        fi
        
        start_time=$(date +%s%N)
        if curl -s -f "$BASE_URL$endpoint" > /dev/null 2>&1; then
            success=$((success + 1))
        else
            failed=$((failed + 1))
        fi
        end_time=$(date +%s%N)
        
        duration=$(((end_time - start_time) / 1000000))
        total_time=$((total_time + duration))
        
        # 간단한 동시성 시뮬레이션
        if [ $((i % CONCURRENCY)) -eq 0 ]; then
            sleep 0.1
        fi
    done
    
    echo ""
    echo "성공: $success"
    echo "실패: $failed"
    echo "평균 응답 시간: $((total_time / REQUESTS))ms"
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ 모든 요청 성공${NC}"
    else
        fail_rate=$((failed * 100 / REQUESTS))
        echo -e "${RED}❌ 실패율: ${fail_rate}%${NC}"
    fi
}

# 서비스 상태 확인
echo -e "${YELLOW}📊 테스트 전 서비스 상태 확인${NC}"
if curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ 서비스 정상${NC}"
else
    echo -e "${RED}❌ 서비스 응답 없음${NC}"
    exit 1
fi

# 각 엔드포인트 테스트
for endpoint_info in "${endpoints[@]}"; do
    endpoint=$(echo "$endpoint_info" | cut -d: -f1)
    name=$(echo "$endpoint_info" | cut -d: -f2)
    
    if [ "$USE_AB" = true ]; then
        test_with_ab "$endpoint" "$name"
    else
        test_with_curl "$endpoint" "$name"
    fi
    
    sleep 1
done

# 캐시 효과 테스트
echo -e "\n${YELLOW}⚡ 캐시 효과 테스트${NC}"
echo "동일한 엔드포인트에 연속 요청..."

if [ "$USE_AB" = true ]; then
    echo "첫 번째 배치 (캐시 미스):"
    ab -n 50 -c 5 -q "$BASE_URL/v2/data/hash" | grep "Requests per second"
    
    sleep 2
    
    echo "두 번째 배치 (캐시 히트):"
    ab -n 50 -c 5 -q "$BASE_URL/v2/data/hash" | grep "Requests per second"
else
    echo "첫 번째 배치 (캐시 미스):"
    start_time=$(date +%s%N)
    for i in {1..20}; do
        curl -s "$BASE_URL/v2/data/hash" > /dev/null
    done
    end_time=$(date +%s%N)
    duration1=$(((end_time - start_time) / 1000000))
    echo "20개 요청 소요 시간: ${duration1}ms"
    
    sleep 2
    
    echo "두 번째 배치 (캐시 히트):"
    start_time=$(date +%s%N)
    for i in {1..20}; do
        curl -s "$BASE_URL/v2/data/hash" > /dev/null
    done
    end_time=$(date +%s%N)
    duration2=$(((end_time - start_time) / 1000000))
    echo "20개 요청 소요 시간: ${duration2}ms"
    
    if [ $duration2 -lt $duration1 ]; then
        improvement=$(((duration1 - duration2) * 100 / duration1))
        echo -e "${GREEN}✅ 캐시로 인한 성능 향상: ${improvement}%${NC}"
    fi
fi

# 리소스 사용량 확인
echo -e "\n${YELLOW}📈 리소스 사용량 확인${NC}"
if command -v docker >/dev/null 2>&1; then
    echo "Docker 컨테이너 상태:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep eternalreturn-proxy
fi

echo -e "\n${GREEN}🎉 부하 테스트 완료!${NC}"
echo "=================================="
echo "💡 추가 분석:"
echo "  - 로그 확인: docker compose logs bser-cache-proxy"
echo "  - 메트릭 확인: curl $BASE_URL/stats"
echo "  - 더 강한 부하 테스트: ./test-load.sh $BASE_URL 1000 20"

if [ "$USE_AB" = false ]; then
    echo "  - Apache Bench 설치 권장: sudo apt-get install apache2-utils"
fi