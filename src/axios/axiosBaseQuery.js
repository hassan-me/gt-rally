import { HTTP_HEADERS, HTTP_METHODS, HTTP_STATUS_CODES } from '../constants/index';
import { instances } from './instances';

const CONTENT_TYPE = 'Content-Type';

const axiosBaseQuery =
  ({ instance } = { instance: 'default' }) =>
  async ({ url, data, params, method = HTTP_METHODS.GET, headers = {} }) => {
    try {
      const axiosInstance = instances[instance];
      const response = await axiosInstance({
        url,
        data,
        params,
        method,
        headers: {
          ...headers,
          [CONTENT_TYPE]: headers[CONTENT_TYPE] || HTTP_HEADERS.CONTENT_JSON[CONTENT_TYPE],
        },
      });

      return { data: response.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          data: err.response?.data || err.message,
          status: err.response?.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        },
      };
    }
  };

export default axiosBaseQuery;
