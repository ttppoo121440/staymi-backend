export type LineTokens = {
  access_token: string;
  id_token: string;
};

export type LineProfile = {
  userId: string;
  displayName: string;
  statusMessage: string;
  pictureUrl?: string;
};

export type LineIdTokenProfileType = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  amr: string[];
  name: string;
  picture: string;
  email?: string;
};

export type UserInfoType = {
  id: string;
  role: 'consumer' | 'store' | 'admin';
  name: string;
  avatar: string;
};

export type CreateUserByProviderInput = {
  provider: 'google' | 'line' | 'facebook';
  providerId: string;
  name: string;
  email?: string;
  avatar?: string;
};

export type GoogleTokens = {
  access_token: string;
  id_token: string;
};

export type GoogleProfile = {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
};

export type FacebookProfile = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

export type ProfileType = {
  id: string; // providerId
  emails?: { value: string }[];
  displayName: string;
  photos?: { value: string }[];
};

export type SerializedUser = {
  id: string;
};
