export {};

declare global {
  namespace PrismaJson {
    type TitleTextPayload = {
      value: string;
      description?: string;
    };

    type TagsPayload = {
      description?: string;
    };

    type RequisitePayload = TitleTextPayload | TagsPayload;

    type AuthActionPayload = {
      email?: string;

      ip?: string;
      realIp?: string;
      forwardedFor?: string;

      method?: string;
      protocol?: string;
      url?: string;
      path?: string;
      hostname?: string;
      referer?: string;
      origin?: string;
      accept?: string;
      acceptEncoding?: string;
      language?: string;

      userAgent?: string;
      browser?: string;
      os?: string;
      device?: string;

      secChUa?: string;
      secChUaMobile?: string;
      secChUaPlatform?: string;
      secChUaModel?: string;
      secChUaFullVersionList?: string;
      secFetchSite?: string;
      secFetchMode?: string;
      secFetchDest?: string;
      secFetchUser?: string;

      serverTimeIso?: string;
    };

    type NoteActionPayload = {
      op:
        | 'create_requisite'
        | 'update_requisite'
        | 'delete_requisite'
        | 'add_tags'
        | 'remove_tag';
      requisiteId?: string;
      tagIds?: string[];
    };

    type TagActionPayload = {
      name?: string;
    };

    type ActionPayload =
      | AuthActionPayload
      | NoteActionPayload
      | TagActionPayload;
  }
}
