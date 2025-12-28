# 배포 전 체크리스트

## ✅ 완료된 작업

### 1. 코드 변경
- [x] userId 기반 엔드포인트 추가 (`/uid/` 경로)
- [x] userNum 기반 엔드포인트 deprecation 처리
- [x] userId 검증 미들웨어 추가
- [x] userIdResolver 서비스 구현
- [x] bserApi 서비스 업데이트 (원본 API `/uid/` 경로 사용)
- [x] 에러 응답에 마이그레이션 가이드 포함

### 2. 테스트
- [x] 신규 API 테스트 (16/16 통과)
- [x] 기존 API deprecated 동작 확인 (400 에러 반환)
- [x] Docker 환경 테스트
- [x] 캐싱 동작 확인

### 3. 문서화
- [x] README.md 업데이트
  - API 변경 알림 추가
  - 엔드포인트 상태 ✅ 정상으로 업데이트
  - FAQ에 마이그레이션 가이드 추가
- [x] API_REFERENCE.md 업데이트
  - 신규 엔드포인트 문서화
  - Deprecated 엔드포인트 표시
  - 마이그레이션 가이드 추가
  - 코드 예시 업데이트 (JavaScript, Python)
- [x] CHANGELOG.md 작성 (v2.0.0)
  - Breaking Changes 상세 기록
  - 마이그레이션 가이드 포함
- [x] VALIDATION_REPORT.md 작성
  - 원본 BSER API 변경 사항 검증

### 4. 테스트 스크립트
- [x] 테스트 스크립트 정리 (test_script/ 폴더로 이동)
  - test_new_endpoints.sh
  - test_comparison.sh
  - test_validation.sh
  - test_validation2.sh
- [x] 임시 파일 제거 (server.log 등)

## 📋 배포 전 최종 확인사항

### 환경 변수
```bash
# .env 파일 확인
- BSER_API_KEY 설정 확인
- REDIS_URL 설정 확인
- PORT 설정 확인 (기본: 3000)
```

### Docker 이미지
```bash
# 이미지 빌드 테스트
docker compose build

# 컨테이너 실행 테스트
docker compose up -d

# 헬스 체크
curl http://localhost:3000/health
```

### API 엔드포인트 테스트
```bash
# 신규 엔드포인트 테스트
./test_script/test_new_endpoints.sh http://localhost:3000

# 기존 엔드포인트 deprecation 확인
curl http://localhost:3000/rank/431380/3/1
# 예상: 400 Bad Request with migration guide
```

## 🚀 배포 단계

### 1. 프로덕션 빌드
```bash
# Docker 이미지 빌드
docker compose build

# 또는 프로덕션 설정 사용
docker compose -f docker-compose.prod.yml build
```

### 2. 기존 서비스 백업
```bash
# 기존 컨테이너 백업 (선택사항)
docker commit bser-cache-proxy bser-cache-proxy:v1-backup
```

### 3. 배포
```bash
# 기존 컨테이너 중지
docker compose down

# 새 버전 시작
docker compose up -d

# 로그 확인
docker compose logs -f bser-cache-proxy
```

### 4. 배포 후 검증
```bash
# 헬스 체크
curl https://your-domain.com/health

# 신규 API 테스트
./test_script/test_new_endpoints.sh https://your-domain.com

# 서비스 통계 확인
curl https://your-domain.com/stats
```

## ⚠️ 롤백 계획

문제 발생 시 롤백 절차:

```bash
# 1. 현재 컨테이너 중지
docker compose down

# 2. 백업 이미지로 복원 (v1 백업이 있는 경우)
docker tag bser-cache-proxy:v1-backup bser-cache-proxy:latest
docker compose up -d

# 3. 또는 이전 Git 커밋으로 롤백
git checkout <previous-commit>
docker compose up -d --build
```

## 📞 모니터링

배포 후 모니터링 항목:

1. **에러 로그 확인**
   ```bash
   docker compose logs -f bser-cache-proxy | grep -i error
   ```

2. **캐시 히트율 확인**
   ```bash
   curl https://your-domain.com/stats | jq '.cache'
   ```

3. **Circuit Breaker 상태**
   ```bash
   curl https://your-domain.com/stats | jq '.circuitBreaker'
   ```

4. **Queue 상태**
   ```bash
   curl https://your-domain.com/stats | jq '.queue'
   ```

## 📝 클라이언트 공지사항

배포 전 사용자에게 공지할 내용:

```
📢 BSER Cache Proxy v2.0.0 업데이트 안내

2025년 12월 29일부터 BSER Open API가 변경되어 프록시도 업데이트됩니다.

주요 변경사항:
- userNum → userId 기반 시스템으로 변경
- 엔드포인트에 /uid/ 경로 추가

마이그레이션 필요:
- /rank/{userNum}/... → /rank/uid/{userId}/...
- /user/stats/{userNum}/... → /user/stats/uid/{userId}/...
- /user/games/{userNum} → /user/games/uid/{userId}
- /unionTeam/{userNum}/... → /unionTeam/uid/{userId}/...

자세한 내용: https://your-domain.com/API_REFERENCE.md#마이그레이션-가이드-v20
```

## ✅ 배포 완료 확인

- [ ] 헬스 체크 통과
- [ ] 신규 엔드포인트 정상 작동
- [ ] Deprecated 엔드포인트 400 반환
- [ ] 캐시 정상 작동
- [ ] Circuit Breaker CLOSED 상태
- [ ] Queue 정상 처리
- [ ] 에러 로그 없음
- [ ] 클라이언트 공지 완료

---

**마지막 업데이트**: 2025-12-29
**버전**: 2.0.0
**담당자**: 프록시 관리팀
