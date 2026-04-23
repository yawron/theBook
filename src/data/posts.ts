export interface Post {
  id: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
}

export const posts: Post[] = [];
