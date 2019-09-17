export class Form {
    constructor(
      public id: number,
      public form_name: string,
      public lob_id: string,
      public short_name: string,
      public reports_url: string,
      public record_closed_criteria: boolean,
      public stay_after_submit: boolean,
      public show_submitters_info: boolean,
      public hide_values_in_emails: boolean,
      public created_by: number
    ) {}
  }