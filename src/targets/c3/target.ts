import { Target } from '../targets';
import { curl } from './curl/client';
import { libcurl } from './libcurl/client';
import { tcp } from './tcp/client';

export const c3: Target = {
  info: {
    key: 'c3',
    title: 'C3',
    extname: '.c3',
    default: 'libcurl',
  },
  clientsById: {
    libcurl,
    curl,
    tcp,
  },
};
