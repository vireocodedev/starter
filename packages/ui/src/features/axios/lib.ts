/**
 * @packageDocumentation Axios configuration
 *
 * @features
 * - sets `withCredentials` property on all axios requests to `true`
 * - sets `baseURL` property on all axios requests to `http://localhost:3000/api/`
 * - configures a custom request interceptor
 * - configures a custom response interceptor
 *
 * @usage
 * ```ts
 * import "@/lib/axios/init";
 * ```
 **/

import type { AxiosStatic } from "axios";

export function configureAxiosClient(axios: AxiosStatic): AxiosStatic {
  axios.defaults.baseURL = "/api/";
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use(
    config => config,
    error => Promise.reject(error),
  );

  axios.interceptors.response.use(
    response => response,
    error => {
      console.error(error);
      return Promise.reject(error);
    },
  );

  return axios;
}
