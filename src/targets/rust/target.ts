import { Target } from '../targets';
import { attohttpc } from './attohttpc/client';
import { reqwest } from './reqwest/client';
import { ureq } from './ureq/client';

export const rust: Target = {
  info: {
    key: 'rust',
    title: 'Rust',
    extname: '.rs',
    default: 'reqwest',
  },
  clientsById: {
    reqwest,
    ureq,
    attohttpc,
  },
};
