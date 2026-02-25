-- Create articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT,
  markdown_body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read articles"
  ON articles FOR SELECT
  USING (true);

-- Vote RPC function (atomic increment)
CREATE OR REPLACE FUNCTION vote_article(article_id UUID, direction TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF direction = 'up' THEN
    UPDATE articles
    SET upvotes = upvotes + 1,
        score = upvotes + 1 - downvotes
    WHERE id = article_id;
  ELSIF direction = 'down' THEN
    UPDATE articles
    SET downvotes = downvotes + 1,
        score = upvotes - (downvotes + 1)
    WHERE id = article_id;
  ELSE
    RAISE EXCEPTION 'Invalid direction: %', direction;
  END IF;
END;
$$;

-- Create index for sorting by score
CREATE INDEX idx_articles_score ON articles (score DESC, created_at DESC);
