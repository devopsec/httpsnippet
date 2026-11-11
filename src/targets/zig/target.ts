import { Target } from '../targets';
import { libcurl } from './libcurl/client';
import { request } from './request/client';
import { std } from './std/client';

export const zig: Target = {
  info: {
    key: 'zig',
    title: 'Zig',
    extname: '.zig',
    default: 'std',
  },
  clientsById: {
    std,
    request,
    libcurl,
  },
};
