const DEFAULT_API_BASE_URL_BY_MODE = {
  development: "http://localhost:3001",
  test: "http://localhost:3001",
  production: "https://todo-cal.kro.kr/api",
};

const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_API_BASE_URL_BY_MODE[import.meta.env.MODE] ||
    DEFAULT_API_BASE_URL_BY_MODE.development
);

export const apiUrl = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
