import { db } from "../config/db.js";
import { bufferToDataUri } from "../middleware/upload.js";

const DEFAULT_CHAPTER_TITLE = "ಅಧ್ಯಾಯ";

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeChapter = (chapter, index) => {
  if (typeof chapter === "string") {
    const content = chapter.trim();
    return content ? { title: `${DEFAULT_CHAPTER_TITLE} ${index + 1}`, content } : null;
  }

  if (!chapter || typeof chapter !== "object") {
    return null;
  }

  const content = cleanText(chapter.content);
  if (!content) {
    return null;
  }

  return {
    title: cleanText(chapter.title) || `${DEFAULT_CHAPTER_TITLE} ${index + 1}`,
    content,
  };
};

const splitTextIntoChapters = (content) => {
  const paragraphs = content
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.map((paragraph, index) => ({
      title: `${DEFAULT_CHAPTER_TITLE} ${index + 1}`,
      content: paragraph,
    }));
  }

  const trimmedContent = content.trim();
  return trimmedContent ? [{ title: `${DEFAULT_CHAPTER_TITLE} 1`, content: trimmedContent }] : [];
};

const parseStoryChapters = (source) => {
  if (Array.isArray(source)) {
    return source.map((chapter, index) => normalizeChapter(chapter, index)).filter(Boolean);
  }

  if (typeof source === "string") {
    const trimmed = source.trim();

    if (!trimmed) {
      return [];
    }

    try {
      return parseStoryChapters(JSON.parse(trimmed));
    } catch {
      return splitTextIntoChapters(trimmed);
    }
  }

  if (source && typeof source === "object") {
    if (Array.isArray(source.chapters)) {
      return parseStoryChapters(source.chapters);
    }

    if (typeof source.content === "string") {
      return splitTextIntoChapters(source.content);
    }
  }

  return [];
};

const buildStoredContent = (chapters) =>
  JSON.stringify({
    chapters: chapters
      .map((chapter, index) => ({
        title: cleanText(chapter.title) || `${DEFAULT_CHAPTER_TITLE} ${index + 1}`,
        content: cleanText(chapter.content),
      }))
      .filter((chapter) => chapter.content.length > 0),
  });

const normalizeStoryRow = (row) => {
  const chapters = parseStoryChapters(row.content);

  return {
    ...row,
    chapters,
    chapter_count: chapters.length,
    content: chapters.map((chapter) => chapter.content).join("\n\n"),
  };
};

const getStoryPayload = (body) => {
  const title = cleanText(body.title);
  const category = cleanText(body.category);
  const chapters = parseStoryChapters(body.chapters ?? body.content);

  return { title, category, chapters };
};

export const getStories = (req, res) => {
  db.query("SELECT * FROM stories", (err, data) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(data.map(normalizeStoryRow));
  });
};

export const getStoryById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM stories WHERE id = ?", [id], (err, data) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json(normalizeStoryRow(data[0]));
  });
};

export const addStory = (req, res) => {
  const { title, category, chapters } = getStoryPayload(req.body);
  const coverUrl = bufferToDataUri(req.file); // data:image/...;base64,... or null

  if (!title || !category) {
    return res.status(400).json({ error: "Title and category are required" });
  }

  if (!chapters.length) {
    return res.status(400).json({ error: "At least one chapter is required" });
  }

  db.query(
    "INSERT INTO stories (title, content, category, cover_image) VALUES (?, ?, ?, ?)",
    [title, buildStoredContent(chapters), category, coverUrl],
    (err) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json("Story added");
    }
  );
};

export const updateStory = (req, res) => {
  const { id } = req.params;
  const { title, category, chapters } = getStoryPayload(req.body);

  if (!title || !category) {
    return res.status(400).json({ error: "Title and category are required" });
  }

  if (!chapters.length) {
    return res.status(400).json({ error: "At least one chapter is required" });
  }

  db.query(
    "UPDATE stories SET title=?, content=?, category=? WHERE id=?",
    [title, buildStoredContent(chapters), category, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json("Story updated");
    }
  );
};

export const deleteStory = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM stories WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json("Story deleted");
  });
};

export const addFeedback = (req, res) => {
  const { story_id, message } = req.body;

  db.query(
    "INSERT INTO feedback (story_id, message) VALUES (?, ?)",
    [story_id, message],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json("Feedback added");
    }
  );
};

export const getFeedback = (req, res) => {
  db.query(
    `SELECT f.id, f.story_id, f.message, s.title AS story_title
     FROM feedback f
     LEFT JOIN stories s ON s.id = f.story_id
     ORDER BY f.id DESC`,
    (err, data) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(data);
    }
  );
};
