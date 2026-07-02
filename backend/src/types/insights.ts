// Normalized post metrics returned by a platform's insights API. Fields are
// optional because availability varies by platform (and by media type / app
// permissions); missing metrics are treated as 0 when persisted.
export interface InsightsResult {
  impressions?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  clicks?: number;
  reach?: number;
  saves?: number;
}
