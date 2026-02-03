# schack-se-sdk

TypeScript SDK for the Swedish Chess Federation (schack.se) API.

## Installation

Install from GitHub:

```bash
# Using npm
npm install github:msvens/schack-se-sdk

# Using yarn
yarn add github:msvens/schack-se-sdk

# Specific version
yarn add github:msvens/schack-se-sdk#v1.0.0
```

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

## API URLs

The SDK defaults to the production API. You can switch to the development API:

```typescript
import { PlayerService, SSF_PROD_API_URL, SSF_DEV_API_URL } from '@msvens/schack-se-sdk';

// Production (default)
const prodService = new PlayerService(SSF_PROD_API_URL);

// Development
const devService = new PlayerService(SSF_DEV_API_URL);
```

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

## License

MIT
