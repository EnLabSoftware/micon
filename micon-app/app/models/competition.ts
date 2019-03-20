export class Competition {
  constructor(
    public id?: number,
    public type?: number,
    public status?: number,
    public slug?: string,
    public title?: string,
    public description?: string,
    public short_description?: string,
    public logo?: File,
    public image?: File,
    public start_time?: string,
    public end_time?: string,
    public is_activate?: boolean,
    public ticketed?: boolean,
    public can_submission?: boolean,
    public can_ticket?: boolean,
    public time_progress?: number,
  ) {}
}
