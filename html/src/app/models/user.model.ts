export class User {
    constructor(
      public id: number,
      public username: string,
      public is_admin: boolean,
      public login_attempt: number,
      public created_by: number
    ) {}
  }