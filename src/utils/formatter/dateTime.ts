export function formatDateTime(
    dateTimeString: string,
    timeZoneOffset: number = new Date().getTimezoneOffset() / -60,
    formatString: string = 'YY-MM-DD hh:mm A'
  ): string {
    const date = new Date(dateTimeString)
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    const offsetDate = new Date(utcDate.getTime() + timeZoneOffset * 3600000)
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: formatString.includes('YY') ? '2-digit' : undefined,
      month: formatString.includes('MM') ? '2-digit' : undefined,
      day: formatString.includes('DD') ? '2-digit' : undefined,
      hour: formatString.includes('hh') ? 'numeric' : undefined,
      minute: formatString.includes('mm') ? 'numeric' : undefined,
      hour12: formatString.includes('A'),
      timeZone: formatString.includes('z') ? 'UTC' : undefined
    })
    return formatter.format(offsetDate)
  }
  