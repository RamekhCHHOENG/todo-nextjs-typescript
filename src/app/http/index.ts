import axios, { AxiosInstance, AxiosError } from "axios";

const http: AxiosInstance = axios.create({
  baseURL: "https://todo-app-api-1454.onrender.com",
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { data, status } = error.response;
      const { error: errorMessage } = data as { error: string };
      alert(`Error: ${status} - ${errorMessage}`);
    }
    return Promise.reject(error);
  }
);


export default http;
