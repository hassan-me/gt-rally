import applyCaseMiddleware from 'axios-case-converter';
import axios from 'axios';
import { API_ROUTES, GLOBAL_CONFIG } from '../configs/index';
import { HTTP_HEADERS } from '../constants/index';

// Create instances without interceptors initially
export const createBaseInstance = (baseURL) => {
  const instance = applyCaseMiddleware(
    axios.create({
      baseURL,
      timeout: GLOBAL_CONFIG.REQUEST_TIMEOUT,
      headers: { ...HTTP_HEADERS.ACCEPT_JSON },
    }),
    {
      ignoreParams: true,
      ignoreHeaders: true,
    }
  );
  
  return instance;
};

export const instances = {
  default: createBaseInstance(GLOBAL_CONFIG.SERVER_API_BASE_URL),
  mapbox: createBaseInstance(GLOBAL_CONFIG.MAPBOX_API_BASE_URL),
};

export const setupInterceptors = (store) => {
  const { HTTP_STATUS_CODES } = require('../constants/index');
  const { logout } = require('../redux/slices/user.slice');
  
  // Setup interceptors for each instance
  Object.values(instances).forEach(instance => {
    instance.interceptors.request.use(
      async (config) => {
        const modifiedConfig = { ...config };
        const unprotectedAPIRoutes = [
          API_ROUTES.AUTH.SIGN_UP,
          API_ROUTES.AUTH.SSO,
          API_ROUTES.AUTH.LOGIN,
        ];
  
        if (!unprotectedAPIRoutes.some((x) => config.url === x)) {
          const { token } = store.getState().user;
          if (!token) {
            store.dispatch(logout());
            return Promise.reject(new axios.AxiosError('Authentication token is missing', 'UNAUTHORIZED'));
          }
  
          modifiedConfig.headers = {
            ...modifiedConfig.headers,
            ...HTTP_HEADERS.AUTH(token),
          };
        }
  
        return modifiedConfig;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );
  
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
          store.dispatch(logout());
          console.error('Unauthorized. Logging out...');
        }
        return Promise.reject(error);
      }
    );
  });
  
  return instances;
};