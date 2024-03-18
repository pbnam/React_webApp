import axios, { AxiosResponse, CancelToken } from 'axios';
import BuildConfig, { BuildVariantsType } from '../config';
import { getCookie } from '../utils/storage';

type AllowedHTTPRequest = 'get' | 'GET' | 'post' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE' | 'PATCH';

interface IRequestModel {
    url: string;
    method: AllowedHTTPRequest;
    data?: any;
    params?: any;
    cancelToken?: CancelToken;
}

axios.interceptors.request.use(
    (request) => {
        return new Promise((resolve) => {
            (request as any).headers['Authorization'] = getCookie('auth');

            resolve(request);
        });
    },
    (error) => {
        return Promise.reject(error);
    },
);

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        //call refresh token

        return Promise.reject(error);
    },
);

export default function makeRequest<R>(request: IRequestModel) {
    return new Promise<R>((resolve, reject) => {
        const { url } = request;

        if (!url || url === '') {
            reject(`Invalid Request URL!`);
        }

        BuildConfig.init(process.env.REACT_APP_ENV as BuildVariantsType);

        if (BuildConfig.BASE_URL) {
            axios.defaults.baseURL = BuildConfig.BASE_URL;

            axios
                .request<R>(request)
                .then((response: AxiosResponse<R>) => {
                    response?.status === 200 || response?.status === 201 || response?.status === 204 ? resolve(response.data) : reject(response);
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            reject();
        }
    });
}
