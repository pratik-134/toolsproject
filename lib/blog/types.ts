/**
 * ClearTrix Static Blog Type Definitions
 * 100% file-based and static-generation friendly.
 */

export interface BlogAuthor {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: string;
  author: BlogAuthor;
  coverImage?: string;
  coverGradient?: string;
  tags: string[];
  featured?: boolean;
  relatedTools?: string[];
  tableOfContents: TableOfContentsItem[];
  contentHtml: string;
}
