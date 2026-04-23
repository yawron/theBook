export interface Post {
  id: string;
  title: string;
  date: string;
  time?: string;
  tags: string[];
  content: string;
}

export const posts: Post[] = [];
