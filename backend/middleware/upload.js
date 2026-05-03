import multer from "multer";

// Store file in memory as a buffer — we convert to Base64 in the controller
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Convert multer buffer → data URI string (stored directly in DB)
export const bufferToDataUri = (file) => {
  if (!file) return null;
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
};
