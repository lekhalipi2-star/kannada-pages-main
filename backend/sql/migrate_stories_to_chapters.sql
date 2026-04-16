-- Convert legacy flat story text into the chapter JSON shape used by the app.
-- Safe to run multiple times: rows that already contain chapter JSON are skipped.
-- Run this against the stories_db database.

UPDATE stories
SET content = JSON_OBJECT(
  'chapters',
  JSON_ARRAY(
    JSON_OBJECT(
      'title', 'Chapter 1',
      'content', content
    )
  )
)
WHERE content IS NOT NULL
  AND content <> ''
  AND (
    JSON_VALID(content) = 0
    OR JSON_EXTRACT(content, '$.chapters') IS NULL
  );
