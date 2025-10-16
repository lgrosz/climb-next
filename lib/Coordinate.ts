class Coordinate {
  latitude: number;
  longitude: number;

  constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  round(num: number, precision: number): number {
    const base = 10 ** precision;
    return Math.round(num * base) / base;
  }

  private dms(d: number, isLatitude: boolean): string {
    const degrees = Math.trunc(d);
    const minutesAndSeconds = Math.abs(d - degrees) * 60;
    const minutes = Math.floor(minutesAndSeconds);
    const seconds = (minutesAndSeconds - minutes) * 60;
    const direction = isLatitude ? (d >= 0 ? 'N' : 'S') : (d >= 0 ? 'E' : 'W');
    return `${Math.abs(degrees)}°${minutes.toString().padStart(2, '0')}'${this.round(seconds, 1).toFixed(1).toString().padStart(4, '0')}"${direction}`;
  }

  public toDMSString(): string {
    return `${this.dms(this.latitude, true)} ${this.dms(this.longitude, false)}`;
  }

  toJSON() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    }
  }
}

export default Coordinate;
