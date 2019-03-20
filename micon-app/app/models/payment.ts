export class Payment {
  constructor(
    public id?: number,
    public paymentID?: string,
    public buyer?: string,
    public payment_method?: string,
    public payment_status?: string,
    public message_log?: string,
    public created?: string
  ) {}
}
