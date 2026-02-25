export interface Article {
  id: string;
  slug: string;
  title: string;
  source_url: string | null;
  markdown_body: string;
  tags: string[];
  word_count: number;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
}
