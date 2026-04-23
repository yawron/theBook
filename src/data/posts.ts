// @ts-nocheck
import post1 from './how-to-use.md?raw';
import post2 from './retro-web.md?raw';
import post3 from './post3-music.md?raw';
import post4 from './post4-coffee.md?raw';
import post5 from './post5-code.md?raw';

export interface Post {
  id: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
}

export const posts: Post[] = [
  {
    id: 'post5-code',
    title: 'Web前端的复古回潮',
    date: '2026-04-24',
    tags: ['技术', '随笔', '设计'],
    content: post5
  },
  {
    id: 'post4-coffee',
    title: '街角的咖啡店与发呆的下午',
    date: '2025-02-14',
    tags: ['生活', '随笔'],
    content: post4
  },
  {
    id: 'post3-music',
    title: '翻出了一张旧CD',
    date: '2024-06-01',
    tags: ['生活', '怀旧', '音乐'],
    content: post3
  },
  {
    id: 'retro-web',
    title: '回归2000年代的互联网',
    date: '2024-05-14',
    tags: ['随笔', '设计'],
    content: post2
  },
  {
    id: 'how-to-use',
    title: '如何使用这个轻量级日志系统',
    date: '2024-05-15',
    tags: ['指南', '使用说明'],
    content: post1
  }
];
