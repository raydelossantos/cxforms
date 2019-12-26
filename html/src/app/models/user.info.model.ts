export class UserInfo {
    constructor(
      public id: number,
      public user_name: string,
      public user_origin: number,
      public employee_id: number,
      public first_name: string,
      public middle_name: string,
      public last_name: string,
      public photo: string,
      public created_by: number
    ) {}
  }