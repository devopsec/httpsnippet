/**
 * @description
 * HTTP code snippet generator for Rust using attohttpc (blocking).
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { rustString } from '../helpers';

const SHORTHAND = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH', 'TRACE'];

export const attohttpc: Client = {
  info: {
    key: 'attohttpc',
    title: 'attohttpc',
    link: 'https://docs.rs/attohttpc/latest/attohttpc/',
    description: 'Lightweight blocking HTTP client for Rust',
  },
  convert: ({ method, fullUrl, allHeaders, postData }, options) => {
    const opts = {
      indent: '    ',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });

    const upperMethod = method.toUpperCase();

    push('fn main() -> attohttpc::Result {');

    if (SHORTHAND.includes(upperMethod)) {
      push(`let response = attohttpc::${upperMethod.toLowerCase()}("${rustString(fullUrl)}")`, 1);
    } else {
      push('let response = attohttpc::RequestBuilder::new(', 1);
      push(
        `attohttpc::Method::from_bytes(b"${rustString(upperMethod)}").expect("valid HTTP method"),`,
        2,
      );
      push(`"${rustString(fullUrl)}",`, 2);
      push(')', 1);
    }

    Object.entries(allHeaders).forEach(([name, value]) => {
      push(`.header("${rustString(name.toLowerCase())}", "${rustString(String(value))}")`, 2);
    });

    if (postData.text) {
      push(`.text("${rustString(postData.text)}")`, 2);
    }

    push('.send()?;', 2);
    blank();
    push('println!("status: {}", response.status());', 1);
    push('println!("{}", response.text()?);', 1);
    push('Ok(())', 1);
    push('}');

    return join();
  },
};
