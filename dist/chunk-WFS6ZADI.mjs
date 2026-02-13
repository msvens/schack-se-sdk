// src/types/ratingAlgorithm.ts
var RatingAlgorithm = {
  /** Standard ELO algorithm */
  STANDARD_ELO: 1,
  /** Use ELO if available, otherwise LASK */
  IF_ELO_THEN_ELO_OTHERWISE_LASK: 2,
  /** LASK algorithm */
  LASK: 3,
  /** Max of ELO and LASK */
  MAX_ELO_LASK: 4,
  /** No rating calculation */
  NO_RATING: 5,
  /** Rapid ELO algorithm */
  RAPID_ELO: 6,
  /** Blitz ELO algorithm */
  BLITZ_ELO: 7,
  /** Priority order: Blitz, Standard, Rapid */
  BLITZ_STANDARD_RAPID_ELO: 8,
  /** Priority order: Standard, Rapid, Blitz */
  STANDARD_RAPID_BLITZ_ELO: 9,
  /** Priority order: Rapid, Standard, Blitz */
  RAPID_STANDARD_BLITZ_ELO: 10
};

export {
  RatingAlgorithm
};
