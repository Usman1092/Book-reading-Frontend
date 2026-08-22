// // src/api/client.js
// //
// // In-memory access token (never localStorage — reduces XSS exposure).
// // On a 401, we try the refresh endpoint once (it reads the httpOnly
// // cookie) before giving up and forcing a re-login.

// import axios from 'axios';

// let accessToken = null;
// let onUnauthorized = () => {};

// export function setAccessToken(token) {
//   accessToken = token;
// }
// export function getAccessToken() {
//   return accessToken;
// }
// export function setUnauthorizedHandler(fn) {
//   onUnauthorized = fn;
// }

// const client = axios.create({
//    baseURL: '/api',
//   withCredentials: true, // sends the httpOnly refresh cookie
// });

// client.interceptors.request.use((config) => {
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// let refreshPromise = null;

// client.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;
//     const status = error.response?.status;

//     if (status === 401 && !original._retried && !original.url?.includes('/auth/')) {
//       original._retried = true;
//       try {
//         if (!refreshPromise) {
//           refreshPromise = axios
//             .post('/api/auth/refresh', {}, { withCredentials: true })
//             .finally(() => {
//               refreshPromise = null;
//             });
//         }
//         const { data } = await refreshPromise;
//         setAccessToken(data.accessToken);
//         original.headers.Authorization = `Bearer ${data.accessToken}`;
//         return client(original);
//       } catch (refreshErr) {
//         setAccessToken(null);
//         onUnauthorized();
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default client;

import axios from "axios";

let accessToken = null;
let onUnauthorized = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// const API_URL = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      !original._retried &&
      !original.url?.includes("/auth/")
    ) {
      original._retried = true;

      try {
        if (!refreshPromise) {
          
          refreshPromise = axios
            .post(
              `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
              {},
              { withCredentials: true },
            )
            .finally(() => {
              refreshPromise = null;
            });
        }

        const { data } = await refreshPromise;

        setAccessToken(data.accessToken);

        original.headers.Authorization = `Bearer ${data.accessToken}`;

        return client(original);
      } catch (refreshErr) {
        setAccessToken(null);
        onUnauthorized();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
