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
  }
}
