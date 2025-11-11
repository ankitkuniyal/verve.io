// Minimal API wrapper to mimic axios-like interface (returns { data })
const baseUrl = "https://verve-io.onrender.com";

async function request(method, path, body = null, opts = {}) {
  const url = path.startsWith("http")
    ? path
    : `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : null,
  });

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const err = new Error(
      data && data.message ? data.message : res.statusText || "API Error"
    );
    err.response = { status: res.status, data };
    throw err;
  }

  return { data };
}

export default {
  get: (path, opts) => request("GET", path, null, opts),
  post: (path, body, opts) => request("POST", path, body, opts),
  put: (path, body, opts) => request("PUT", path, body, opts),
  delete: (path, body, opts) => request("DELETE", path, body, opts),
  request,
};
