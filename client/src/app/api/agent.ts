import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { router } from "../router/Routes";
import { PaginatedResponse } from "../models/pagination";
import { store } from "../store/configureStore";

const sleep = () => new Promise(resolve => setTimeout(resolve, 500));

axios.defaults.baseURL = 'http://localhost:5185/api/';

// This is for the [Browser] to [recive] the [cookie] And [set it] [inside] the [apllication storage] as well.
axios.defaults.withCredentials = true;

const responseBody = (response: AxiosResponse) => response.data;

// Here I'm [making sure] that i'll [Send up] a [Toekn] with are [request]. Continue DownVV
// [Only] if i [have] a [Token]. So if i [don't] habe a [Token] I will not [Add] the [Authorization] [Header] with any [Request]!!!
axios.interceptors.request.use(config => {
    // In order to use the [user] [object] from [getState()]. Continue DownVV
    // Will need to make sure we have a [token] in [localStorage]
    const token = store.getState().account.user?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

axios.interceptors.response.use(async response => {
    await sleep();
    const pagination = response.headers['pagination'];
    if (pagination) {
        response.data = new PaginatedResponse(response.data, JSON.parse(pagination));
        return response;
    }
    return response
}, (error: AxiosError) => {
    const { data, status } = error.response as AxiosResponse;
    switch (status) {
        case 400:
            if (data.errors) {
                const modelStateErrors: string[] = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modelStateErrors.push(data.errors[key])
                    }
                }
                throw modelStateErrors.flat();
            }
            toast.error(data.title);
            break;
        case 401:
            toast.error(data.title);
            break;
        case 500:
            router.navigate('/server-error', { state: { error: data } });
            break;
        default:
            break;
    }

    return Promise.reject(error.response);
})


const requests = {
    // The [url] will be from [Above ^^] The ['http://localhost:5185/api/']. Continue DownVV
    //AND from [Below VV] in the [Catalog]. For [Example] => ['http://localhost:5185/api/products']
    //The [.then(responseBody)] will just get the [data] from the [Above^^]
    get: (url: string, params?: URLSearchParams) => axios.get(url, {params}).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
}


// This will be the [Type] of [requests] [Specifically] for the [Catalog]
const Catalog = {
    list: (params: URLSearchParams) => requests.get('products', params),
    details: (id: number) => requests.get(`products/${id}`),
    fetchFilters: () => requests.get('products/filters')
}


// This will be the [Type] of [requests] [Specifically] for the [TestErrors]
const TestErrors = {
    get400Error: () => requests.get('buggy/bad-request'),
    get401Error: () => requests.get('buggy/unauthorised'),
    get404Error: () => requests.get('buggy/not-found'),
    get500Error: () => requests.get('buggy/server-error'),
    getValidationError: () => requests.get('buggy/validation-error')
}


const Basket = {
    get: () => requests.get('basket'),
    addItem: (productId: number, quantity = 1) => requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
    removeItem: (productId: number, quantity = 1) => requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
}


const Account = {
    login: (values: any) => requests.post('account/login', values),
    register: (values: any) => requests.post('account/register', values),
    currentUser: () => requests.get('account/currentUser'),
}


// This is for that will be able to call [requests] from [Catalog] And [More!!!]
const agent = {
    Catalog,
    TestErrors,
    Basket,
    Account
}

export default agent;