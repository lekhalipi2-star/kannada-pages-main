const BASE_URL = import.meta.env.VITE_API_URL;

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

export const loginAdmin = async (data: any) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const verifyAdminToken = async (token: string) => {
  const res = await fetch(`${BASE_URL}/auth/verify`, {
    headers: {
      Authorization: token,
    },
  });
  return res.ok;
};

export const getStories = async () => {
  const res = await fetch(`${BASE_URL}/stories`);
  return res.json();
};

export const getStoryById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/stories/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch story: ${res.status}`);
  }

  return res.json();
};

export const addStory = async (data: any, token: string) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("category", data.category);
  formData.append("chapters", JSON.stringify(data.chapters ?? []));
  if (data.cover) {
    formData.append("cover", data.cover);
  }

  const res = await fetch(`${BASE_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: formData,
  });
  return res.json();
};

export const updateStory = async (id: string, data: any, token: string) => {
  const res = await fetch(`${BASE_URL}/stories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      title: data.title,
      category: data.category,
      chapters: data.chapters ?? [],
    }),
  });
  return res.json();
};

export const deleteStory = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/stories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });
  return res.json();
};

export const addFeedback = async (data: any) => {
  const res = await fetch(`${BASE_URL}/stories/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getFeedback = async (token: string) => {
  const res = await fetch(`${BASE_URL}/stories/feedback`, {
    headers: {
      Authorization: token,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch feedback: ${res.status}`);
  }
  return res.json();
};


