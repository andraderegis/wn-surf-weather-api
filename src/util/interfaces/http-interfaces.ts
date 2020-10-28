import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IRequestConfig extends AxiosRequestConfig {}

export interface IResponse<T = any> extends AxiosResponse<T> {}
