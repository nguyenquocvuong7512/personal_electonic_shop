import api from "./api";

const SESSION_STORAGE_KEY = "cart_session_id";

function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

function saveSessionId(response) {
  const sessionId = response.data?.session_id;

  if (typeof window !== "undefined" && sessionId) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }

  return response.data;
}

function getRequestConfig() {
  const sessionId = getSessionId();
  return sessionId ? { headers: { "X-Session-ID": sessionId } } : {};
}

export const cartService = {
  get: async () => saveSessionId(await api.get("/cart", getRequestConfig())),

  add: async (sanphamId, soluong = 1) =>
    saveSessionId(
      await api.post(
        "/cart",
        { sanpham_id: sanphamId, soluong },
        getRequestConfig()
      )
    ),

  update: async (id, soluong) =>
    saveSessionId(
      await api.put(`/cart/${id}`, { soluong }, getRequestConfig())
    ),

  remove: async (id) =>
    saveSessionId(await api.delete(`/cart/${id}`, getRequestConfig())),

  checkout: async (data) =>
    saveSessionId(
      await api.post("/checkout", data, getRequestConfig())
    ),
};
