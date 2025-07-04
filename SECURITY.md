# 보안 가이드

## 프로덕션 환경 보안 설정

### 1. 필수 보안 설정

#### Redis 보안
```bash
# 강력한 비밀번호 설정 (최소 32자)
REDIS_PASSWORD=your_very_secure_password_minimum_32_characters
```

#### API 키 보안
```bash
# BSER API 키 안전 보관
BSER_API_KEY=your_secure_api_key
```

### 2. 네트워크 보안

#### 포트 격리
- Redis: 외부 포트 노출 안 함
- 애플리케이션: localhost만 바인딩
- Nginx: 리버스 프록시로 보호

#### 방화벽 설정
```bash
# UFW 설정 예시
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. Docker 보안

#### 컨테이너 보안
- `no-new-privileges`: 권한 상승 방지
- `cap_drop: ALL`: 모든 권한 제거
- `read_only`: 읽기 전용 파일시스템
- 비루트 사용자 실행

#### 볼륨 보안
```yaml
volumes:
  - ./logs:/app/logs:ro  # 읽기 전용
tmpfs:
  - /tmp:noexec,nosuid,size=100m  # 실행 권한 없음
```

### 4. 애플리케이션 보안

#### 환경 변수
```bash
# 프로덕션용 설정
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=50  # 더 엄격한 제한
```

#### CORS 설정
```javascript
// 허용된 도메인만 접근
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

### 5. 로깅 보안

#### 민감 정보 마스킹
- API 키, 비밀번호 자동 마스킹
- 구조화된 로그 포맷
- 로그 회전 및 보관

### 6. SSL/TLS 설정

#### Nginx SSL 설정
```nginx
# 최신 TLS 프로토콜만 사용
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

# HSTS 헤더
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
```

### 7. 모니터링 및 알림

#### 보안 이벤트 모니터링
- 비정상적인 API 호출 패턴
- Rate limit 초과
- Circuit breaker 동작
- 인증 실패

### 8. 정기 보안 점검

#### 매주 확인 사항
- [ ] 의존성 보안 업데이트
- [ ] 로그 파일 검토
- [ ] 디스크 사용량 확인
- [ ] 성능 지표 검토

#### 매월 확인 사항
- [ ] SSL 인증서 만료일
- [ ] 비밀번호 변경
- [ ] 백업 무결성 검증
- [ ] 보안 패치 적용

### 9. 사고 대응

#### 보안 사고 발생 시
1. 서비스 격리
2. 로그 분석
3. 영향 범위 파악
4. 복구 계획 수립
5. 재발 방지 대책

### 10. 보안 체크리스트

#### 배포 전 확인
- [ ] 환경 변수 설정 완료
- [ ] 비밀번호 복잡도 확인
- [ ] 방화벽 규칙 적용
- [ ] SSL 인증서 설치
- [ ] 로깅 설정 확인
- [ ] 모니터링 알람 설정

#### 운영 중 확인
- [ ] 보안 로그 모니터링
- [ ] 성능 지표 확인
- [ ] 디스크 용량 모니터링
- [ ] 백업 상태 확인

## 보안 연락처

보안 관련 이슈 발견 시:
- 이메일: security@yourdomain.com
- 긴급: +82-xx-xxxx-xxxx

## 참고 문서

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)