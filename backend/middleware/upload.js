import multer from "multer";

// Keep multer for any legacy use, but image handling is now done frontend-side as Base64
const storage = multer.memoryStorage();

export const upload = multer({ storage });

// No longer used - kept for reference only
export const bufferToDataUri = (file) => {
  if (!file) return null;
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
};
