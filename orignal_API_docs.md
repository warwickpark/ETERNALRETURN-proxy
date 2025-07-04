# BSER OPEN API Models

다음과 같은 모델을 통해 API를 이용하실 수 있습니다.

## Get User Number

유저의 ID를 획득합니다.

### Model URL
```
user/nickname?query={nickname}
```

### Required Field
- **Nickname**: 유저의 현재 게임 닉네임을 입력 받습니다.

### Data Example
```json
{
  "code": 200,
  "message": "Success",
  "user": {
    "userNum": 1234567,
    "nickname": "ANONYMOUS"
  }
}
```

## Top Rankers

각 시즌 별 1000위 이내의 랭커 정보를 획득합니다.
일부 동일 점수로 인해 더 많은 유저들이 검색될 수 있습니다.

※ 추후 v2 모델이 지원됩니다. 해당 모델에서는 귀속 서버를 함께 명시하여 요청을 넣어야 합니다. V1 모델은 전체 랭킹 정보로 지속적으로 지원합니다. (2025년 1월 2일부터 지원합니다.)

### V1 Model URL
```
v1/rank/top/{seasonId}/{matchingTeamMode}
```

### Required Field
- **Season ID**
  - 0: 일반 대전 (더 이상 지원하지 않음)
  - 1 ~ N: 각 시즌 번호

- **Matching Team Mode**
  - 1: 솔로
  - 2: 듀오
  - 3: 스쿼드

### Data Example
```json
{
  "code": 200,
  "message": "Success",
  "topRanks": [
    {
      "userNum": 1234567,
      "nickname": "ANONYMOUS",
      "rank": 1,
      "mmr": 5176
    }
  ]
}
```

### V2 Model URL
```
v2/rank/top/{seasonId}/{server_code}/{matchingTeamMode}
```

### Required Field
- **Season ID**
  - 0: 일반 대전 (더 이상 지원하지 않음)
  - 1 ~ N: 각 시즌 번호

- **Server Code**
  - 10: Asia
  - 17: Asia2
  - 12: NorthAmerica
  - 13: Europe
  - 14: SouthAmerica

- **Matching Team Mode**
  - 1: 솔로
  - 2: 듀오
  - 3: 스쿼드

### Data Example
```json
{
  "code": 200,
  "message": "Success",
  "topRanks": [
    {
      "userNum": 1234567,
      "nickname": "ANONYMOUS",
      "rank": 1,
      "mmr": 5176
    }
  ]
}
```

## User Rank

특정 유저의 시즌 랭크를 획득합니다.

### Model URL
```
rank/{userNum}/{seasonId}/{matchingTeamMode}
```

### Required Field
- **User Number**: 유저의 ID입니다.
- **Season ID**
  - 0: 일반 대전 (더 이상 지원하지 않음)
  - 1 ~ N: 각 시즌 번호

- **Matching Team Mode**
  - 1: 솔로
  - 2: 듀오
  - 3: 스쿼드

### Data Example
다음 형태의 데이터를 획득합니다.
serverCode 및 serverRank는 2024년 11월 21일부터 지원합니다.

**serverCode**
- 10: Asia
- 17: Asia2
- 12: NorthAmerica
- 13: Europe
- 14: SouthAmerica

```json
{
  "code": 200,
  "message": "Success",
  "userRank": {
    "userNum": 1234567,
    "mmr": 3933,
    "nickname": "ANONYMOUS",
    "rank": 11,
    "serverCode": 10,
    "serverRank": 10
  }
}
```

## Union Team

특정 유저의 현재 유니온 팀의 정보를 확인합니다.

### Model URL
```
unionTeam/{userNum}/{seasonId}
```

### Required Field
- **User Number**: 유저의 ID입니다.
- **Season ID**: 1 ~ N: 각 시즌 번호

### Data Example
```json
{
  "code": 200,
  "message": "Success",
  "teams": [
    {
      "tnm": "team_name_01",
      "ti": 70,
      "stt": 2,
      "sstt": 0,
      "ssstt": 0,
      "ssti": 90,
      "ssstw": 0,
      "sstw": 1,
      "stw": 3,
      "atw": 0,
      "btw": 1,
      "ctw": 0,
      "dtw": 0,
      "etw": 0,
      "ftw": 0,
      "cdt": 1735034124000,
      "udt": 1737013242000
    }
  ]
}
```

### Data Definitions - Teams

| Key | DataType | Description |
|-----|----------|-------------|
| tnm | str | 팀의 이름 |
| ti | int | 현재 팀의 티어 |
| stt | int | S 티어 참여 티켓 |
| sstt | int | SS 티어 참여 티켓 |
| ssstt | int | SSS 티어 참여 티켓 |
| ssti | int | 현재 시즌에서 가장 높게 기록한 티어 |
| ssstw | int | SSS 티어 우승 횟수 |
| sstw | int | SS 티어 우승 횟수 |
| stw | int | S 티어 우승 횟수 |
| atw | int | A 티어 우승 횟수 |
| btw | int | B 티어 우승 횟수 |
| ctw | int | C 티어 우승 횟수 |
| dtw | int | D 티어 우승 횟수 |
| etw | int | E 티어 우승 횟수 |
| ftw | int | F 티어 우승 횟수 |
| cdt | int | 팀 생성 일자. Epoch time. |
| udt | int | 팀 정보 최종 업데이트 일자. Epoch time. |

## User Stats

유저의 통계를 획득합니다.

V1 모델은 추후 지원 종료될 예정입니다.
확장성을 위해 V2 모델이 추가됩니다.

### Model URL
```
user/stats/{userNum}/{seasonId}
```

### Required Field
- **User Number**: 유저의 ID 입니다.
- **Season ID**
  - 0: 일반 대전 (더 이상 지원하지 않음)
  - 1 ~ N: 각 시즌 번호

### Data Example
다음 형태의 데이터를 획득합니다.
신규 매칭 모드의 정보는 2025년 1월 16일, 컨텐츠 활성화 시점부터 추가됩니다.

```json
{
  "code": 200,
  "message": "Success",
  "userStats": [
    {
      "seasonId": 3,
      "userNum": 1234567,
      "matchingMode": 3,
      "matchingTeamMode": 1,
      "mmr": 2431,
      "nickname": "ANONYMOUS",
      "rank": 311,
      "rankSize": 47830,
      "totalGames": 146,
      "totalWins": 10,
      "totalTeamKills": 203,
      "rankPercent": 0.01,
      "averageRank": 9.36,
      "averageKills": 1.4,
      "averageAssistants": 0,
      "averageHunts": 17.28,
      "top1": 0.07,
      "top2": 0.12,
      "top3": 0.16,
      "top5": 0.28,
      "top7": 0.39,
      "characterStats": [
        {
          "characterCode": 3,
          "totalGames": 145,
          "usages": 145,
          "maxKillings": 8,
          "top3": 24,
          "wins": 10,
          "top3Rate": 0,
          "averageRank": 9
        }
      ]
    }
  ]
}
```

### Model URL (V2)
```
user/stats/{userNum}/{seasonId}/{matchingMode}
```

### Required Field
- **User Number**: 유저의 ID 입니다.
- **Season ID**
  - 0: 일반 대전 기록입니다.
  - 1 ~ N: 시즌 구분자입니다.

- **Matching Mode**
  - 2: Normal
  - 3: Ranked

### Data Definitions - userStats

각 시즌 / 모드 별 유저의 통계입니다.

| Key | DataType | Description |
|-----|----------|-------------|
| seasonId | int | 시즌 번호 – 1 ~ N |
| userNum | int | 유저마다 지급되는 고유 번호 |
| matchingMode | int | 2: 일반, 3: 랭크 |
| matchingTeamMode | int | 1: 솔로 모드, 2: 듀오 모드, 3: 스쿼드 모드, 8: 유니온 모드 |
| mmr | int | 유저의 RP (혹은 mmr) |
| nickname | string | Nickname of the user. |
| rank | int | User ranking. |
| rankSize | int | Total pool of users in the current rank. |
| totalGames | long | Total played games. |
| totalWins | long | Total games ended in 1st place. |
| totalTeamKills | int | Total kills scored by the team. (Regardless of the team mode) |
| rankPercent | float | Ranking percentile. |
| averageRank | float | Average rank of all matches in the season. |
| averageKills | float | Average kills of all matches in the season. |
| averageAssistants | float | Average assists of all matches in the season. (Misnamed variable.) |
| averageHunts | float | Average hunt count of all matches in the season. |
| top1 | float | Percentile for achieving Top 1. |
| top2 | float | Percentile for achieving Top 2. (or above) |
| top3 | float | Percentile for achieving Top 3. (or above) |
| top5 | float | Percentile for achieving Top 5. (or above) |
| top7 | float | Percentile for achieving Top 7. (or above) |
| characterStats | characterStat | Array of character statistics. |
| seasonId | int | Season Id. |

### characterStat

캐릭터 별 통계입니다.

| Key | DataType | Description |
|-----|----------|-------------|
| characterCode | int | Character code. |
| usage | long | Number of matches played as the character. |
| maxKillings | int | Max kill streak in a single match this season. |
| top3 | int | Number of matches that ended in Top 3. (or above) |
| wins | int | Number of matches that ended in Top 1. |
| top3Rate | float | Top 3 rate this season. |
| averageRank | float | Average rank this season. |

## User Matches

유저의 최근 90일간 모든 전투 기록을 획득합니다.

### Model URL
```
user/games/{userNum}
```

### Required Field
- **User Number**: 유저의 ID 입니다.

### Data Example
```json
{
  "code": 200,
  "message": "Success",
  "userGames": [
    {BattleUserResult}
  ]
}
```

### Data Definitions
See Definitions.

## Match Results

하나의 매치에 대한 결과를 획득합니다.
해당 매치에 참여한 모든 유저의 결과를 출력합니다.

### Model URL
```
games/{gameId}
```

### Required Field
- **Game ID**: 게임 ID는 User Matches 모델을 통해 사용할 수 있습니다

### Data Example
```json
{
  "code": 200,
  "message": "Success",
  "userGames": [
    {BattleGameResults}
  ]
}
```

### Data Definitions - Battle Game Results

| Key | DataType | Description |
|-----|----------|-------------|
| userNum | int | 유저마다 지급되는 고유 번호. |
| nickname | string | 유저가 설정한 닉네임. |
| gameId | int | 게임에 지급된 고유 번호. |
| matchingMode | int | 2: 일반, 3: 랭크 |
| matchingTeamMode | int | 1: 솔로, 2: 듀오, 3: 스쿼드 |
| seasonId | int | 랭크 게임의 시즌 번호. |
| characterNum | int | 실험체의 번호. |
| skinCode | int | 유저가 사용한 스킨. |
| characterLevel | int | 사망/승리 시점의 캐릭터 레벨. |
| gameRank | int | 유저의 최종 등수. |
| playerKill | int | 게임 진행 중 유저의 킬 수. |
| playerAssistant | int | 게임 진행 중 유저의 어시스트 수. |
| monsterKill | int | 게임 진행 중 유저의 사냥 수. |
| bestWeapon | int | 게임 종료 시 유저의 가장 높은 무기 숙련도의 번호. |
| bestWeaponLevel | int | 게임 종료 시 유저의 가장 높은 무기 숙련도의 레벨. |
| masteryLevel | <int, int> | 숙련도별 레벨. <숙련도 번호, 숙련도 레벨>. |
| equipment | <int, int> | 부위별 장착 아이템. <위치, 아이템 번호>. |
| versionMajor | int | 메인 수정 버전. |
| versionMinor | int | 마이너 수정 버전. |
| language | string | 유저의 언어 설정. |
| skillLevelInfo | <int, int> | 스킬별 레벨. <스킬 번호, 스킬 레벨>. |
| skillOrderInfo | <int, int> | 스킬 레벨 업 순서. <순서, 스킬 번호>. |
| serverName | string | 배틀 서버의 지역 이름. |

**Stats 관련 필드들:**
- maxHp (int): 최대 체력
- maxSp (int): 최대 스태미나
- attackPower (int): 공격력
- moveSpeed (float): 이동 속도
- defense (int): 방어력
- hpRegen (float): 체력 재생
- spRegen (float): 스태미나 재생
- attackSpeed (float): 공격 속도
- outOfCombatMoveSpeed (float): 비 전투 이동속도
- sightRange (float): 시야
- attackRange (float): 기본 공격 사거리
- criticalStrikeChance (float): 치명타 확률
- criticalStrikeDamage (float): 치명타 피해량
- coolDownReduction (float): 쿨다운 감소
- lifeSteal (float): 모든 피해 흡혈
- normalLifeSteal (float): 기본 공격 피해 흡혈
- skillLifeSteal (float): 스킬 공격 피해 흡혈
- amplifierToMonster (float): 야생 동물에게 주는 피해 증폭
- trapDamage (float): 함정 피해 증폭

**게임 정보 관련 필드들:**
- gainExp (int): 게임 종료 후 획득 경험치
- startDtm (DateTime): 서버의 게임 시작 시간
- duration (int): 서버의 프레임 타임
- mmrBefore (int): 유저의 기존 MMR
- mmrGain (int): 유저의 MMR 변동량
- mmrAfter (int): 유저의 신규 MMR
- playTime (int): 유저의 플레이 시간 (초)
- watchTime (int): 유저의 관전 시간 (초)
- totalTime (int): 유저의 플레이 및 관전 시간 (초)

**기타 다양한 게임 통계 필드들이 포함됩니다.**

## Get Game Data Table

게임 내부의 테이블 정보를 가져옵니다.

신규 데이터는 모두 v2 모델에서만 지원합니다.
기존 v1 모델은 더 이상 업데이트되지 않습니다.

### Model URL
```
/v1/data/{metaType} : deprecated
/v2/data/{metaType}
```

### Required Field
- **metaType**: 모든 메타 타입을 획득하고자 한다면, 'hash'를 입력하면 됩니다.

### Data Example
해당 모델은 별도의 예시를 제공하지 않습니다.

## Get Language Data

게임 내부의 언어 정보를 획득합니다.

### Model URL
```
v1/l10n/{language}
```

### Required Field
- **Language**

**완전 제공 언어:**
- Korean
- English
- Japanese
- ChineseSimplified
- ChineseTraditional

**부분 제공 언어:**
- French
- Spanish
- SpanishLatin
- Portuguese
- PortugueseLatin
- Indonesian
- German
- Russian
- Thai
- Vietnamese

### Data Example
The model will provide a text file link.

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "l10Path": "https://d1wkxvul68bth9.cloudfront.net/l10n/l10n-Korean-20211117071605.txt"
  }
}
```

## Get Latest Route Data

게임 내부 전략 루트의 데이터를 가져옵니다.

90일 이내 수정된 루트(추천 및 정부 수정)를 최신 순으로 최대 100개까지 전달합니다.

### Model URL
```
v1/weaponRoutes/recommend
v1/weaponRoutes/recommend/{routeId}
```

### Required Field
- **RouteId**: 각 루트에 포함된 "id"의 값을 사용합니다.

### Data Example
```json
{
  "code": 200,
  "message": "Success",
  "result": [
    {
      "recommendWeaponRoute": {
        "id": 99999,
        "title": "SampleRoute",
        "userNum": 1,
        "userNickname": "Example",
        "characterCode": 1,
        "slotId": 0,
        "weaponType": 24,
        "weaponCodes": "[130403,202104,203411,201407,204303]",
        "tacticalSkillGroupCode": 0,
        "paths": "[110,160,180]",
        "count": 0,
        "version": "1.36.0",
        "teamMode": 0,
        "languageCode": "en",
        "routeVersion": 5,
        "share": true,
        "updateDtm": 1734498108000,
        "v2Like": 0,
        "v2WinRate": 0,
        "v2SeasonId": 0,
        "v2AccumulateLike": 0,
        "v2AccumulateWinRate": 0,
        "v2AccumulateSeasonId": 0
      },
      "recommendWeaponRouteDesc": {
        "recommendWeaponRouteId": 35176,
        "skillPath": "q,e,w,w,w,r,w,t,w,t,r,q,q,q,q,r,e,e,e,e",
        "desc": ""
      }
    }
  ]
}
```

### Data Definitions - RecommendWeaponRoute

| Key | DataType | Description |
|-----|----------|-------------|
| id | int | 루트에 지급되는 고유 번호. |
| title | string | 유저가 설정한 루트 이름. |
| userNum | int | 유저에게 지급된 고유 번호. |
| userNickname | str | 수정한 유저의 닉네임 |
| characterCode | int | 지정된 루트의 캐릭터 번호 |
| slotId | int | 제작자의 슬롯 번호 |
| weaponType | int | 무기의 마스터리 번호. |
| weaponCodes | str | 루트에 지정된 초기 목표 아이템 정보. |
| tacticalSkillGroupCode | int | 루트에 지정된 전술 스킬. |
| paths | str | 루트에 지정된 지역. |
| count | int | 루트가 공유된 횟수 |
| version | str | 클라이언트의 버전 |
| teamMode | int | 솔로, 듀오, 스쿼드 구분. 현재는 0으로 고정. |
| languageCode | str | 제작자의 언어 코드. |
| routeVersion | int | 루트의 버전 정보. |
| share | bool | 루트의 공유 여부. |
| updateDtm | int | 최종 업데이트 일자. Epoch Time. |
| v2Like | int | 현재 시즌에 받은 추천 수 |
| v2WinRate | int | 현재 시즌에 기록된 승률 |
| v2SeasonId | int | 현재 시즌 번호 |
| v2AccumulateLike | int | 누적 추천 수 |
| v2AccumulateWinRate | int | 누적 승률 |
| v2AccumulateSeasonId | int | 미사용 데이터. |

### RecommendWeaponRouteDesc

| Key | DataType | Description |
|-----|----------|-------------|
| recommendedWeaponRouteId | int | 루트에 지급되는 고유 번호. |
| skillPath | string | 루트에 지정된 스킬을 순서대로 csv로 나열한 값. |
| desc | string | *이 키 값은 값이 존재할 때에만 추가됩니다. |

## Additional Data

일부 접근하기 어려운 데이터입니다.
(Last updated : 2023/07/20)

### Mastery

각 숙련도의 코드입니다.
L10N의 다음 키를 통해 해독할 수 있습니다.
MasteryType/{Name}

- 0: None
- 1: Glove
- 2: Tonfa
- 3: Bat
- 4: Whip
- 5: HighAngleFire
- 6: DirectFire
- 7: Bow
- 8: CrossBow
- 9: Pistol
- 10: AssaultRifle
- 11: SniperRifle
- 13: Hammer
- 14: Axe
- 15: OneHandSword
- 16: TwoHandSword
- 17: Polearm
- 18: DualSword
- 19: Spear
- 20: Nunchaku
- 21: Rapier
- 22: Guitar
- 23: Camera
- 24: Arcana
- 25: VFArm
- 101: Craft
- 102: Search
- 103: Move
- 201: Defense
- 202: Hunt

### Area

각 지역에 대한 코드는 아래와 같으며, 옆에는 지역의 이름을 찾기 위한 L10N Key 입니다.

| AreaKey | L10N Key |
|---------|----------|
| 10 | Area/Name/Harbor |
| 20 | Area/Name/Warehouse |
| 30 | Area/Name/Pond |
| 40 | Area/Name/Stream |
| 50 | Area/Name/SandyBeach |
| 60 | Area/Name/Uptown |
| 70 | Area/Name/Alley |
| 80 | Area/Name/GasStation |
| 90 | Area/Name/Hotel |
| 100 | Area/Name/PoliceStation |
| 110 | Area/Name/FireStation |
| 120 | Area/Name/Hospital |
| 130 | Area/Name/Temple |
| 140 | Area/Name/Archery |
| 150 | Area/Name/Cemetery |
| 160 | Area/Name/Forest |
| 170 | Area/Name/Factory |
| 180 | Area/Name/Church |
| 190 | Area/Name/School |

### Skill

스킬 이름은 L10N 파일에서 다음 경로로 찾을 수 있습니다.
```
Skill/Group/Name/{SkillGroup}
```

### Equipment

장비 슬롯의 구분은 다음과 같습니다.
- 0: 무기
- 1: 옷
- 2: 머리
- 3: 팔
- 4: 다리
- 5: 장신구 (정식 출시 이후 더 이상 장신구는 사용하지 않습니다.)

### Monster

야생 동물의 고유 번호는 L10N의 다음 키를 통해서 해독할 수 있습니다.
```
Monster/Name/{고유 번호}
```

### Killer

킬러 필드에는 다음과 같은 값이 들어올 수 있습니다.
- player: 다른 유저
- wildAnimal: 위클라인 등을 포함한 야생 동물
- restrictedArea: 금지 구역 타이머 폭파

킬러 필드는 총 3번까지만 지원합니다.

### Cause Of Death

사망 요인은 기본 공격인 경우 'basicAttack'을 출력합니다.
그 외에는 각 스킬의 이름 및 오브젝트의 이름을 출력합니다.
마찬가지로 3번까지만 지원합니다.

### Collectible

채집물들은 다음과 같은 코드를 가집니다.
- 1: 수원
- 2: 나뭇가지
- 3: 돌
- 4: 바다 낚시터
- 5: 민물 낚시터
- 6: 감자
- 7: 생명의 나무
- 8: 운석
- 9: 꽃

### Trait

특성은 L10N의 다음 키를 통해서 해독할 수 있습니다.
```
Trait/Name/{특성 코드}
```

### TacticalSkill

다음과 같은 전술 스킬을 지원합니다.

| GroupCode | 검색 키 |
|-----------|---------|
| 30 | Skill/Group/Name/4000000 |
| 40 | Skill/Group/Name/4001000 |
| 50 | Skill/Group/Name/4101000 |
| 60 | Skill/Group/Name/4102000 |
| 70 | Skill/Group/Name/4103000 |
| 80 | Skill/Group/Name/4104000 |
| 90 | Skill/Group/Name/4105000 |
| 110 | Skill/Group/Name/4107000 |
| 120 | Skill/Group/Name/4110000 |
| 130 | Skill/Group/Name/4112000 |
| 140 | Skill/Group/Name/4113000 |
| 150 | Skill/Group/Name/4108000 |
| 500010 | Skill/Group/Name/4501000 |
| 500020 | Skill/Group/Name/4502000 |
| 500030 | Skill/Group/Name/4503000 |
| 500040 | Skill/Group/Name/4504000 |
| 500050 | Skill/Group/Name/4505000 |
| 500060 | Skill/Group/Name/4506000 |
| 500070 | Skill/Group/Name/4507000 |
| 500080 | Skill/Group/Name/4508000 |
| 500090 | Skill/Group/Name/4509000 |
| 500100 | Skill/Group/Name/4510000 |
| 500110 | Skill/Group/Name/4511000 |
| 500120 | Skill/Group/Name/4000000 |
| 500130 | Skill/Group/Name/4001000 |
| 500140 | Skill/Group/Name/4101000 |
| 500150 | Skill/Group/Name/4102000 |
| 500160 | Skill/Group/Name/4103000 |
| 500170 | Skill/Group/Name/4104000 |
| 500180 | Skill/Group/Name/4105000 |
| 500190 | Skill/Group/Name/4107000 |
| 500200 | Skill/Group/Name/4110000 |
| 500210 | Skill/Group/Name/4112000 |
| 500220 | Skill/Group/Name/4113000 |
| 500230 | Skill/Group/Name/4108000 |

### Weather

날씨의 이름은 L10N의 다음 키를 통해서 확인할 수 있습니다.
```
Weather/Name/{code}
```

### Installation

환경변수 설치물의 이름은 L10N의 다음 키를 통해서 확인할 수 있습니다.
```
Installation/Name/{code}
```