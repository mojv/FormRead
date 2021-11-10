import Axios from 'axios'
import {store} from "../store";

let api = Axios.create({
    headers: {
        'X-Api-Key': 'DEV-API-KEY',
    }
})

api.interceptors.request.use(
  config => {
    const token = store.state.auth.token;
    if (token) {
      config.headers.common["Authorization"] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    response => {
        if (response.status === 200 || response.status === 201) {
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },

    error => {
        if (error.response.status) {
            switch (error.response.status) {
                case 401:
                case 403:
                    store.state.auth.token =  null;
                    alert("session expired");
                    break;
                default:
                    alert(error.response.statusText);
            }
            return Promise.reject(error.response);
        }
    }
);

export default api