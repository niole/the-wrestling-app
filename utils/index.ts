export const max = (ns: number[]) => ns.reduce((a, n) => a > n ? a : n, Number.NEGATIVE_INFINITY);
export const formatDate = (d: number, withDate: boolean = true) => {
  const date = new Date(d);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const dateString = `${month}/${day}/${year}`;
  const timeString = `${hour}:${minute} - ${second} seconds`;
  if (withDate) {
    return `${timeString}  ${dateString}`;
  }
  return timeString;
};

