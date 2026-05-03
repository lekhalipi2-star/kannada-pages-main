const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.lekhalipi.com';
const BASE_ORIGIN = BASE_URL;
export default BASE_URL;

export type Chapter = {
  title: string;
  content: string;
};

export const getCoverImageUrl = (coverImage?: string | null) => {
  if (!coverImage) return "/placeholder.svg";
  if (/^https?:\/\//i.test(coverImage)) return coverImage;
  if (coverImage.startsWith('/')) return coverImage;
  if (/^data:image\//i.test(coverImage)) return coverImage;
  return `${BASE_ORIGIN}/uploads/${coverImage}`;
};

// Convert a File object to a Base64 data URI string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const loginAdmin = async (data: any) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: data.username?.trim(),
      password: data.password?.trim(),
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    // ✅ Fixed - handle both string and object error responses
    throw new Error(
      typeof result === "string" ? result : result?.message || "Login failed"
    );
  }

  return result; // { token: "..." }
};

export const verifyAdminToken = async (token: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/verify`, {
    headers: {
      Authorization: token,
    },
  });
  return res.ok;
};

export const getStories = async () => {
  const res = await fetch(`${BASE_URL}/api/stories`);
  return res.json();
};

export const getStoryById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/api/stories/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch story: ${res.status}`);
  }
  return res.json();
};

export const addStory = async (data: any, token: string) => {
  let cover_image: string | null = null;
  if (data.cover instanceof File) {
    cover_image = await fileToBase64(data.cover);
  }

  const res = await fetch(`${BASE_URL}/api/stories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      title: data.title,
      category: data.category,
      chapters: data.chapters ?? [],
      cover_image,
    }),
  });
  return res.json();
};

export const updateStory = async (id: string, data: any, token: string) => {
  let cover_image: string | undefined = undefined;
  if (data.cover instanceof File) {
    cover_image = await fileToBase64(data.cover);
  }

  const body: any = {
    title: data.title,
    category: data.category,
    chapters: data.chapters ?? [],
  };
  if (cover_image) {
    body.cover_image = cover_image;
  }

  const res = await fetch(`${BASE_URL}/api/stories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const deleteStory = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/api/stories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });
  return res.json();
};

export const addFeedback = async (data: any) => {
  const res = await fetch(`${BASE_URL}/api/stories/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getFeedback = async (token: string) => {
  const res = await fetch(`${BASE_URL}/api/stories/feedback`, {
    headers: {
      Authorization: token,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch feedback: ${res.status}`);
  }
  return res.json();
};
