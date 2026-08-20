/**
 * Rating algorithm constants used in tournaments
 * These determine which rating system should be used for ELO calculations
 */
export declare const RatingAlgorithm: {
    /** Standard ELO algorithm */
    readonly STANDARD_ELO: 1;
    /** Use ELO if available, otherwise LASK */
    readonly IF_ELO_THEN_ELO_OTHERWISE_LASK: 2;
    /** LASK algorithm */
    readonly LASK: 3;
    /** Max of ELO and LASK */
    readonly MAX_ELO_LASK: 4;
    /** No rating calculation */
    readonly NO_RATING: 5;
    /** Rapid ELO algorithm */
    readonly RAPID_ELO: 6;
    /** Blitz ELO algorithm */
    readonly BLITZ_ELO: 7;
    /** Priority order: Blitz, Standard, Rapid */
    readonly BLITZ_STANDARD_RAPID_ELO: 8;
    /** Priority order: Standard, Rapid, Blitz */
    readonly STANDARD_RAPID_BLITZ_ELO: 9;
    /** Priority order: Rapid, Standard, Blitz */
    readonly RAPID_STANDARD_BLITZ_ELO: 10;
};
export type RatingAlgorithmType = typeof RatingAlgorithm[keyof typeof RatingAlgorithm];
//# sourceMappingURL=ratingAlgorithm.d.ts.map