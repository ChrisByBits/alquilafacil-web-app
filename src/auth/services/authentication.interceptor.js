/**
 * Authentication Interceptor
 *
 * @summary
 * This function is an interceptor that adds the Authorization header to the request if the user is signed in.
 * @param config - Axios request configuration
 * @returns {*} - Modified axios request configuration
 */
export const authenticationInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}
