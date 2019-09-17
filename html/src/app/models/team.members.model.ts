export class Team {
    constructor(
      public id: number,
      public team_name: string,
      public team_code: string,
      public client_id: number,
      public location: string,
      public description: string,
      public created_by: number
    ) {}
  }