export class Account {
    constructor(
        public id?: number,
        public username?: string,
        public display_name?: string,
        public first_name?: string,
        public last_name?: string,
        public email?: string,
        public avatar?: File,
        public password?: string,
        public phone?: string,
        public birth_day?: string,
        public gender?: number,
        public is_staff?: boolean
    ) { }
}
