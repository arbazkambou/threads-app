export interface UserProps {
  name: string;
  username: string;
  image: string;
  bio: string;
  id: string;
  path: string;
}

export interface CreadThreadParams {
  text: string;
  author: string;
  communityId: string | null | undefined;
  path: string;
}
