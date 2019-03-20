export class Topic {
  constructor(
    public id?: number,
    public title?: string,
    public slug?: string,
    public content?: string,
    public attachments?: File[],
    public created?: string,
  ) {}
}
