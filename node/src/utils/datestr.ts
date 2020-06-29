import dateFormat from 'dateformat';

export function datestr(d: Date): string {
  return dateFormat(d, 'UTC:yyyy-mm-dd"T"HH:MM:ss.l"Z"');
}

export default datestr;
