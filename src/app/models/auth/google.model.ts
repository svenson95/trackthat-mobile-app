// https://developers.google.com/identity/gsi/web/reference/js-reference?hl=de
export type GoogleResponse = {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
};
export type GoogleJWT = string;

export interface GoogleUser {
  userId: string;
  email: string;
  name: string;
  picture: string;
}
