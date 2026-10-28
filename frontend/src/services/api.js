import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 30000,
});

export function parseGitHubUrl(value) {
  const match = value.trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?(?:[?#].*)?$/i);
  if (!match) throw new Error("Enter a valid public GitHub repository URL, such as https://github.com/psf/requests");
  return { owner: match[1], repo: match[2].replace(/\.git$/i, "") };
}
