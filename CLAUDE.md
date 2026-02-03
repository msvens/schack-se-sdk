# schack-se-sdk - AI Quick Reference

## Purpose

TypeScript SDK for the Swedish Chess Federation (schack.se) public API. Provides typed wrappers for API endpoints and chess-specific utility functions.

## Architecture

### Services (API Wrappers) - `src/services/`

Direct 1:1 mappings to API endpoints. All extend BaseApiService.

| Service | Purpose |
|---------|---------|
| PlayerService | Player info, search, batch operations, rating history |
| OrganizationService | Federation, districts, clubs |
| TournamentService | Tournament structure, search, batch operations |
| ResultsService | Standings, round results, individual games |
| RatingsService | National/district/club rating lists |
| RegistrationService | Team tournament registration |

### Types - `src/types/`

TypeScript interfaces matching API response DTOs:

| File | Contents |
|------|----------|
| base.ts | ApiResponse, ApiError |
| player.ts | PlayerInfoDto, MemberFIDERatingDTO, RatingDataPoint |
| organization.ts | FederationDTO, DistrictDTO, ClubDTO |
| tournament.ts | TournamentDto, TournamentClassDto, GroupSearchAnswerDto |
| results.ts | TournamentEndResultDto, TournamentRoundResultDto, GameDto |
| ratings.ts | RatingType, PlayerCategory, MemberCategory |
| ratingAlgorithm.ts | RatingAlgorithm constants |
| registration.ts | TeamRegistrationDto |

### Utils (Domain Logic) - `src/utils/`

Chess-specific utilities:

| File | Purpose |
|------|---------|
| eloCalculations.ts | Expected score, rating change, performance rating |
| gameResults.ts | Point systems, result codes, win/draw/loss detection |
| ratingUtils.ts | Time control parsing, K-factor, rating formatting |
| resultFormatting.ts | Walkover detection, result display strings |
| teamFormatting.ts | Team names with Roman numerals |
| tournamentGroupUtils.ts | Find groups in tournament hierarchy |
| sortingUtils.ts | Sort results by place, tournaments by date |
| dateUtils.ts | ELO lookup date normalization |
| batchUtils.ts | Array chunking, deduplication |
| ratingHistory.ts | Fetch and decimate rating history |
| opponentStats.ts | Game statistics by opponent/color |

## Usage Pattern

```typescript
import { PlayerService, SSF_PROD_API_URL } from '@msvens/schack-se-sdk';

const service = new PlayerService(SSF_PROD_API_URL);
const response = await service.getPlayerInfo(12345);

if (response.data) {
  console.log(response.data.firstName);
} else {
  console.error(response.error);
}
```

## API URLs

- Production: `https://member.schack.se/public/api/v1`
- Dev: `https://halvarsson.no-ip.com/webapp/memdb/public/api/v1`

## Point Systems

The API supports three point systems (determined by result code):

| System | Win | Draw | Loss |
|--------|-----|------|------|
| DEFAULT | 1 | 0.5 | 0 |
| SCHACK4AN | 3 | 2 | 1 |
| POINT310 | 3 | 1 | 0 |

## Key Concepts

### Rating Types
- `standard` - Classical time control (>60 min)
- `rapid` - 10-60 minutes
- `blitz` - <10 minutes
- `lask` - Swedish national rating

### K-Factors (FIDE)
- K=40: Juniors (<18 at end of year) with rating <2300
- K=20: Rating <2400
- K=10: Rating >=2400

### Tournament Structure
```
Tournament
  └── rootClasses[]
       └── TournamentClassDto
            ├── groups[] (TournamentClassGroupDto)
            │    └── tournamentRounds[] (RoundDto)
            └── subClasses[] (recursive)
```

## Build & Test

```bash
yarn install
yarn build    # Uses tsup
yarn test     # Uses Jest
```

## File Structure

```
src/
├── index.ts              # Main exports
├── constants.ts          # API URLs, timeouts
├── services/
│   ├── index.ts
│   ├── base.ts           # BaseApiService
│   ├── players.ts
│   ├── organizations.ts
│   ├── tournaments.ts
│   ├── results.ts
│   ├── ratings.ts
│   └── registration.ts
├── types/
│   ├── index.ts
│   ├── base.ts
│   ├── player.ts
│   ├── organization.ts
│   ├── tournament.ts
│   ├── results.ts
│   ├── ratings.ts
│   ├── ratingAlgorithm.ts
│   └── registration.ts
└── utils/
    ├── index.ts
    ├── batchUtils.ts
    ├── dateUtils.ts
    ├── eloCalculations.ts
    ├── gameResults.ts
    ├── opponentStats.ts
    ├── ratingHistory.ts
    ├── ratingUtils.ts
    ├── resultFormatting.ts
    ├── sortingUtils.ts
    ├── teamFormatting.ts
    └── tournamentGroupUtils.ts
```
