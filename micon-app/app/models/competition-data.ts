export class CompetitionData {
  constructor(
    public id?: number,
    public name?: string,
    public competition?: number,
    public attachment?: File,
    public description?: string,
    public type?: number,
    public type_name?: string,
  ) {}
}
