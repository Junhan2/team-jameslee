---
title: Project Deep Review
description: |
  딥 리서치 기반 프로젝트 총체적 분석 스킬.
  코드 품질, 성능, UX/UI, 디자인, 도메인 해자, 서비스 품질을
  최신 공식문서와 업계 베스트 프랙티스 기반으로 평가합니다.
  "개선해야 한다"가 아니라 "이것이 실효성 있는 개선인가?"를 판단합니다.

triggers:
  - "프로젝트 리뷰"
  - "프로젝트 점검"
  - "딥 리뷰"
  - "총체적 분석"
  - "코드 품질 점검"
  - "서비스 품질 분석"
  - "정기 점검"
  - "개선안 분석"
  - "project review"
  - "deep review"
  - "audit"
  - "health check"
---

# Project Deep Review Skill

이 스킬은 프로젝트를 5개 전문 영역에서 딥 리서치 기반으로 총체적 분석합니다.

## 사용 방법

### 전체 분석
```bash
# 현재 프로젝트 전체 분석
/deep-review

# 특정 경로
/deep-review /path/to/project

# 파일로 출력
/deep-review --output=file
```

### 특정 영역 분석
```bash
# 기술스택만
/deep-review --focus=tech

# UX/디자인만
/deep-review --focus=ux

# 성능만
/deep-review --focus=perf

# 도메인 해자만
/deep-review --focus=moat

# 코드 품질만
/deep-review --focus=code
```

### 빠른 점검
```bash
# MUST 이슈만 빠르게 스캔
/deep-review-quick
```

## 핵심 철학

### Impact Scoring System

모든 발견 사항은 4단계로 분류됩니다:

| 등급 | 의미 | 포함 여부 |
|------|------|----------|
| 🔴 **MUST** | 안 하면 실질적 손해 | ✅ 항상 포함 |
| 🟠 **SHOULD** | 체감 가능한 개선 | ✅ 항상 포함 |
| ⚪ **COULD** | 이론적 개선 | ❌ 보고 안 함 |
| 💪 **STRENGTH** | 잘 되고 있는 점 | ✅ 항상 포함 |

### 편향 방지 원칙

1. **강점 먼저**: 모든 영역에서 강점을 3개 이상 반드시 포함
2. **규모 적합성**: 프로젝트 규모/단계에 맞는 제안만
3. **ROI 중심**: 구현 비용 대비 효과 불분명하면 제안 안 함
4. **근거 필수**: 모든 제안에 공식문서/데이터/사례 필수
5. **COULD 배제**: "할 수 있다"가 아니라 "해야 한다"만

## 5개 분석 영역

### 🔵 기술스택 & 아키텍처
- 프레임워크 버전, 의존성 건강도
- 아키텍처 패턴, 인프라 구성
- 딥 리서치: 최신 공식문서, 마이그레이션 가이드

### 🟣 UX/UI & 디자인
- 사용자 플로우, 디자인 일관성
- 접근성, 반응형, 인터랙션
- 딥 리서치: 도메인별 UX 트렌드, 경쟁사 분석

### 🔴 성능
- Core Web Vitals (LCP, INP, CLS)
- 번들 크기, 코드 스플리팅, 캐싱
- 딥 리서치: 프레임워크별 최적화 가이드

### 🟢 도메인 해자 & 서비스 품질
- 비즈니스 로직, 경쟁 우위
- 고객 편의, 데이터 모델
- 딥 리서치: 경쟁사 분석, 업계 트렌드

### 🔷 코드 품질 & DX
- 코드 구조, 테스트 전략
- 기술 부채, 유지보수성
- 딥 리서치: 언어/프레임워크 코드 품질 가이드

## 참조 문서

- [Impact Scoring Guide](./references/impact-scoring.md) - 등급 분류 기준
- [Anti-Bias Framework](./references/anti-bias.md) - 편향 방지 프레임워크
