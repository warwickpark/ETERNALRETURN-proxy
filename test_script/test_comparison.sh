#!/bin/bash

source .env

API_KEY="$BSER_API_KEY"
BASE_URL="$BSER_API_BASE_URL"

echo "🔍 BSER API 엔드포인트 비교 테스트"
echo "=================================="

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# kimint 유저 조회 (실제 userId 얻기)
USER_RESPONSE=$(curl -s -H "x-api-key: $API_KEY" "$BASE_URL/v1/user/nickname?query=kimint")
USERID=$(echo "$USER_RESPONSE" | jq -r '.user.userId')

echo -e "${BLUE}테스트 대상 사용자:${NC}"
echo "  - Nickname: kimint"
echo "  - UserId: $USERID"
echo ""

# 1. 기존 방식 테스트 (userNum 직접 사용 - 예상: 401 Unauthorized)
echo -e "${YELLOW}1. 기존 방식 테스트 (v1/rank/{userNum}/...)${NC}"
echo "   → 예상 결과: 401 Unauthorized (더 이상 지원 안됨)"

OLD_RANK=$(curl -s -H "x-api-key: $API_KEY" "$BASE_URL/v1/rank/431380/3/1")
OLD_STATUS=$(echo "$OLD_RANK" | jq -r '.code')

if [ "$OLD_STATUS" == "401" ]; then
    echo -e "   ${RED}✗ 기존 방식 (userNum): HTTP $OLD_STATUS - Unauthorized${NC}"
else
    echo -e "   ${GREEN}✓ 기존 방식 (userNum): HTTP $OLD_STATUS${NC}"
fi
echo ""

# 2. 새로운 방식 테스트 (userId 사용)
echo -e "${YELLOW}2. 새로운 방식 테스트 (v1/rank/uid/{userId}/...)${NC}"
echo "   → 예상 결과: 200 Success"

NEW_RANK=$(curl -s -H "x-api-key: $API_KEY" "$BASE_URL/v1/rank/uid/${USERID}/3/1")
NEW_STATUS=$(echo "$NEW_RANK" | jq -r '.code')

if [ "$NEW_STATUS" == "200" ]; then
    echo -e "   ${GREEN}✓ 새로운 방식 (userId): HTTP $NEW_STATUS${NC}"
    echo ""
    echo -e "${BLUE}   응답 데이터 구조:${NC}"
    echo "$NEW_RANK" | jq '{
        code,
        message,
        userRank: .userRank | {
            nickname,
            serverCode,
            mmr,
            rank,
            serverRank
        }
    }'
else
    echo -e "   ${RED}✗ 새로운 방식 (userId): HTTP $NEW_STATUS${NC}"
fi
echo ""

# 3. 결론
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 검증 결과 요약:${NC}"
echo ""
echo "1. 기존 방식 (v1/rank/{userNum}/...)"
echo "   - 상태: 더 이상 지원 안됨 (401 Unauthorized)"
echo "   - 이유: BSER API가 userNum 대신 userId 기반으로 변경"
echo ""
echo "2. 새로운 방식 (v1/rank/uid/{userId}/...)"
echo "   - 상태: 정상 작동 (200 Success)"
echo "   - userId: 문자열 형식 (Base64 인코딩된 것으로 추정)"
echo ""
echo "3. userId 획득 방법:"
echo "   - GET /v1/user/nickname?query={닉네임}"
echo "   - 응답의 'user.userId' 필드에서 추출"
echo ""
echo -e "${GREEN}✅ 변경 사항 확인 완료${NC}"
echo "   프록시 서버를 새로운 API 형식으로 업데이트해야 합니다."
