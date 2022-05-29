import * as R from 'ramda';
import { Match } from '../screens/types';

export const max = (ns: number[]) => ns.reduce((a, n) => a > n ? a : n, Number.NEGATIVE_INFINITY);
export const formatDate = (d: number, dateOnly: boolean = false, timeOnly: boolean = false) => {
  const dateString = formatDateOnly(d);
  const timeString = formatTime(d);
  if (dateOnly) {
    return dateString;
  }

  if (timeOnly) {
    return timeString;
  }
  return `${timeString}  ${dateString}`;
};

export const formatTime = (d: number): string => {
  const date = new Date(d);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${hour}:${minute} - ${second} seconds`;
};

export const formatDateOnly = (d: number): string => {
  const date = new Date(d);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export const getMatchDurationMillis = (match: Match): number => {
  return match.videos.map(v => v.start + v.durationMillis).reduce(R.max, Number.NEGATIVE_INFINITY) - match.start;
};
