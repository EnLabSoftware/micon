export class Evaluation {
  constructor(
    public id?: number,
    public name?: string,
    public file?: File,
    public description?: string,
    public evaluation_func?: string,
    public validation_func?: string,
    public uploaded?: string,
    public active?: boolean,
  ) {}
}
