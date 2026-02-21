# schack-se-sdk

TypeScript SDK for the Swedish Chess Federation (schack.se) API and FIDE player data via [ChessTools](https://api.chesstools.org/docs).

### Underlying APIs

- **SSF (Swedish Chess Federation):** [Swagger docs](https://member.schack.se/swagger-ui/index.html#/)
- **ChessTools (FIDE data):** [API docs](https://api.chesstools.org/docs)

## Installation

Install from GitHub:

```bash
# Using pnpm (recommended)
pnpm add github:msvens/schack-se-sdk

# Using npm
npm install github:msvens/schack-se-sdk

# Specific version/tag
pnpm add github:msvens/schack-se-sdk#v1.0.0
```

> **Note:** `yarn` has a known bug when installing packages directly from GitHub repositories. Use `pnpm` or `npm` instead.

## Quick Start

```typescript
import { PlayerService, SSF_PROD_API_URL } from '@msvens/schack-se-sdk';

// Create a service instance
const playerService = new PlayerService(SSF_PROD_API_URL);

// Fetch player information
const response = await playerService.getPlayerInfo(642062);

if (response.data) {
  console.log(`${response.data.firstName} ${response.data.lastName}`);
  console.log(`ELO: ${response.data.elo.rating}`);
}
```

## Available Services

### PlayerService

```typescript
import { PlayerService } from '@msvens/schack-se-sdk';

const service = new PlayerService();

// Get player by SSF ID
const player = await service.getPlayerInfo(playerId);
const playerAtDate = await service.getPlayerInfo(playerId, new Date('2024-01-01'));

// Get player by FIDE ID
const player = await service.getPlayerByFIDEId(fideId);

// Search players by name
const players = await service.searchPlayer('Magnus', 'Carlsen');

// Batch fetch multiple players
const results = await service.getPlayerInfoBatch([1, 2, 3], undefined, { concurrency: 10 });

// Get rating history
const history = await service.getPlayerEloHistory(playerId, '2024-01', '2025-01');
```

### OrganizationService

```typescript
import { OrganizationService } from '@msvens/schack-se-sdk';

const service = new OrganizationService();

// Get federation info
const federation = await service.getFederation();

// Get all districts
const districts = await service.getDistricts();

// Get clubs in a district
const clubs = await service.getClubsInDistrict(districtId);

// Get specific club
const club = await service.getClub(clubId);
```

### TournamentService

```typescript
import { TournamentService } from '@msvens/schack-se-sdk';

const service = new TournamentService();

// Get tournament by ID
const tournament = await service.getTournament(tournamentId);

// Get tournament by group ID
const tournament = await service.getTournamentFromGroup(groupId);

// Search tournaments
const results = await service.searchGroups('Stockholm');

// Get upcoming tournaments
const upcoming = await service.searchComingTournaments();

// Get recently updated tournaments
const updated = await service.searchUpdatedTournaments(
  '2024-12-01T00:00:00',
  '2024-12-31T23:59:59'
);
```

### ResultsService

```typescript
import { ResultsService } from '@msvens/schack-se-sdk';

const service = new ResultsService();

// Get tournament standings
const results = await service.getTournamentResults(groupId);

// Get round results
const rounds = await service.getTournamentRoundResults(groupId);

// Get team tournament results
const teamResults = await service.getTeamTournamentResults(groupId);

// Get player's tournament history
const playerResults = await service.getMemberTournamentResults(memberId);

// Get all games played by a member
const games = await service.getMemberGames(memberId);
```

### RatingsService

```typescript
import { RatingsService, RatingType, PlayerCategory } from '@msvens/schack-se-sdk';

const service = new RatingsService();

// Get federation rating list
const list = await service.getFederationRatingList(
  new Date(),
  RatingType.STANDARD,
  PlayerCategory.JUNIORS
);

// Get club rating list
const clubList = await service.getClubRatingList(
  clubId,
  new Date(),
  RatingType.RAPID,
  PlayerCategory.ALL
);
```

### RegistrationService

```typescript
import { RegistrationService } from '@msvens/schack-se-sdk';

const service = new RegistrationService();

// Get team registration for a club
const registration = await service.getTeamRegistration(tournamentId, clubId);
```

### FideService

Provides FIDE player data via the [ChessTools API](https://api.chesstools.org/docs).

All types (`FidePlayer`, `FideActivePlayer`, `FidePlayerInfo`, `FideRatingPeriod`) are exact 1:1 mappings of the JSON responses from the API — we don't reshape or omit fields. The ChessTools API has two internal data sources (a web scraper and a MongoDB rating list) which leads to inconsistencies across endpoints (e.g. `fideid` vs `fide_id`, `rating` as number vs string). Each type models exactly what its endpoint returns.

```typescript
import { FideService } from '@msvens/schack-se-sdk';

const service = new FideService();

// Get player by FIDE ID
const player = await service.getPlayer(1503014);

// Get detailed player info with rating history
const info = await service.getPlayerInfo(1503014, true);

// Get full rating history
const history = await service.getPlayerHistory(1503014);

// Get top players by classical rating
const top = await service.getTopByRating(10);

// Get top active players
const active = await service.getTopActive(10, true);
```

## Utility Functions

### ELO Calculations

```typescript
import {
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  calculateTournamentStats
} from '@msvens/schack-se-sdk';

// Calculate expected score
const expected = calculateExpectedScore(1500, 1600); // ~0.36

// Calculate rating change
const change = calculateRatingChange(1500, 1600, 1.0, 20); // Win against higher rated

// Calculate performance rating
const performance = calculatePerformanceRating([1500, 1600, 1550], 2.5);

// Calculate tournament stats
const stats = calculateTournamentStats(matches, playerRating, kFactor);
```

### Game Results

```typescript
import {
  parseGameResult,
  getPlayerOutcome,
  isWalkover,
  formatGameResult
} from '@msvens/schack-se-sdk';

// Parse a result code
const parsed = parseGameResult(resultCode);
console.log(parsed.outcome); // 'white_win', 'black_win', 'draw', etc.

// Get player's outcome
const outcome = getPlayerOutcome(resultCode, isWhite); // 'win', 'draw', 'loss', null

// Check for walkover
const isWO = isWalkover(homeId, awayId, result);
```

### Rating Utilities

```typescript
import {
  getPlayerRatingForTournament,
  formatPlayerRating,
  parseTimeControl,
  getKFactorForRating
} from '@msvens/schack-se-sdk';

// Get appropriate rating for tournament time control
const rating = getPlayerRatingForTournament(player.elo, "10 min + 5 sek/drag");

// Format rating for display
const display = formatPlayerRating(player.elo, thinkingTime); // "1500" or "1500 S"

// Parse time control string
const timeControl = parseTimeControl("10 min + 5 sek/drag"); // 'rapid'

// Get K-factor
const kFactor = getKFactorForRating('standard', 1500, player.elo, birthdate);
```

### Team Formatting

```typescript
import {
  formatTeamName,
  toRomanNumeral,
  createTeamNameFormatter
} from '@msvens/schack-se-sdk';

// Format team name with Roman numeral
const name = formatTeamName('SK Rockaden', 2, 3); // "SK Rockaden II"

// Convert to Roman numeral
const numeral = toRomanNumeral(4); // "IV"

// Create a formatter for results data
const formatter = createTeamNameFormatter(results, getClubName);
```

## Subpath Imports

For tree-shaking or smaller bundles, you can import from specific subpaths:

```typescript
// Just services
import { PlayerService } from '@msvens/schack-se-sdk/services';

// Just types
import type { PlayerInfoDto } from '@msvens/schack-se-sdk/types';

// Just utilities
import { calculateExpectedScore } from '@msvens/schack-se-sdk/utils';
```

## API URLs & CORS

Every service constructor takes an optional base URL. This exists because the SSF API (`member.schack.se`) does **not** set CORS headers — browser-based apps cannot call it directly. In practice, you need to proxy API calls through your own backend to avoid CORS errors.

The actual API URLs are:

| Constant | URL |
|----------|-----|
| `SSF_PROD_API_URL` | `https://member.schack.se/public/api/v1` |
| `CHESSTOOLS_API_URL` | `https://api.chesstools.org` |

The SDK is intentionally flexible about the base URL so you can point it at your proxy path instead of the actual API:

```typescript
import { PlayerService, SSF_PROD_API_URL, SSF_DEV_API_URL } from '@msvens/schack-se-sdk';

// Direct call (works server-side or in tests, blocked by CORS in the browser)
const serverService = new PlayerService(SSF_PROD_API_URL);

// Through a local proxy (works in the browser — recommended for web apps)
const clientService = new PlayerService('/api/chess/v1');

// Development API
const devService = new PlayerService(SSF_DEV_API_URL);
```

For a Next.js example of setting up the proxy, see [Known Issues & Gotchas](#nextjs-trailing-slash-problem) below.

## Types

All TypeScript types are exported for use in your application:

```typescript
import type {
  PlayerInfoDto,
  TournamentDto,
  ClubDTO,
  ApiResponse,
  MemberFIDERatingDTO
} from '@msvens/schack-se-sdk';
```

## Response Format

All service methods return an `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  data?: T;           // The response data (if successful)
  error?: string;     // Error message (if failed)
  status: number;     // HTTP status code
  message?: string;   // Optional status message
}
```

## Known Issues & Gotchas

### Next.js: Trailing Slash Problem

Both the SSF API and the ChessTools API are sensitive to trailing slashes. The SSF API is particularly inconsistent — GET endpoints break *with* them, POST endpoints break *without* them:

| API | Method | Trailing slash | Result |
|-----|--------|---------------|--------|
| SSF | `GET /player/{id}/date/{date}` | No | 200 |
| SSF | `GET /player/{id}/date/{date}/` | Yes | **404** |
| SSF | `POST /player/list` | No | **404** |
| SSF | `POST /player/list/` | Yes | 200 |

The SDK handles this correctly (each endpoint uses the right path). The problem is **Next.js rewrites strip trailing slashes** before forwarding to the upstream API. This is standard Next.js behavior (SEO normalization) and `skipTrailingSlashRedirect: true` does not help — it only affects client-facing redirects, not rewrite forwarding.

**Solution:** Use catch-all **route handlers** instead of rewrites. Route handlers preserve `request.nextUrl.pathname` exactly, including trailing slashes. You need one for each API:

```typescript
// src/app/api/chess/v1/[...path]/route.ts — SSF proxy
import { NextRequest } from 'next/server';

const SSF_API_BASE = process.env.SSF_API_URL || 'https://member.schack.se/public/api/v1';

async function proxy(request: NextRequest) {
  const originalPath = request.nextUrl.pathname.replace('/api/chess/v1', '');
  const url = new URL(request.url);
  const target = `${SSF_API_BASE}${originalPath}${url.search}`;

  const response = await fetch(target, {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: request.method !== 'GET' ? await request.text() : undefined,
  });

  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

export const GET = proxy;
export const POST = proxy;
```

```typescript
// src/app/api/chesstools/[...path]/route.ts — ChessTools/FIDE proxy
import { NextRequest } from 'next/server';

const CHESSTOOLS_API_BASE = 'https://api.chesstools.org';

async function proxy(request: NextRequest) {
  const originalPath = request.nextUrl.pathname.replace('/api/chesstools', '');
  const url = new URL(request.url);
  const target = `${CHESSTOOLS_API_BASE}${originalPath}${url.search}`;

  const response = await fetch(target, {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

export const GET = proxy;
```

Then configure the SDK services to use the proxy paths:

```typescript
const playerService = new PlayerService('/api/chess/v1');
const fideService = new FideService('/api/chesstools');
```

### `getPlayerList` Returns 500 for Unknown IDs

`POST /player/list/` returns HTTP 500 if **any** requested player ID doesn't exist. Players who leave the federation get removed from the database, but their IDs still appear in historical game results.

Use `getPlayerInfoBatch` (individual GET calls with per-player error handling) when fetching players where unknown IDs are possible. `getPlayerList` is safe only when all IDs are known to be valid.

## License

MIT
