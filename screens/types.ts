export type MatchVideo = {
  id: string;
  uri: string;
  start: number;
  events: MatchEvent[];
  durationMillis: number;
  title?: string;
};

export type MatchEvent = {
  id: string;
  timestamp: number;
  label: string;
  durationMillis: number;
};

export type Match = {
  id: string;
  title: string;
  videos: MatchVideo[];
  start: number;
};
