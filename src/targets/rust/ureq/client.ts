/**
 * @description
 * HTTP code snippet generator for Rust using ureq (3.x, blocking).
 */

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';
import { rustString } from '../helpers';

const SHORTHAND = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'CONNECT', 'PATCH', 'TRACE'];
const WITH_BODY = ['POST', 'PUT', 'PATCH'];

export const ureq: Client = {
  info: {
    key: 'ureq',
    title: 'ureq',
    link: 'https://docs.rs/ureq/latest/ureq/',
    description: 'Simple, safe blocking HTTP client for Rust (ureq 3.x)',
  },
  convert: ({ method, fullUrl, allHeaders, postData }, options) => {
    const opts = {
      indent: '    ',
      ...options,
    };

    const { push, blank, join } = new CodeBuilder({ indent: opts.indent });

    const upperMethod = method.toUpperCase();
    const body = postData.text ? `"${rustString(postData.text)}"` : null;
    const headers = Object.entries(allHeaders).map(
      ([name, value]) =>
        `.header("${rustString(name.toLowerCase())}", "${rustString(String(value))}")`,
    );

    push('fn main() -> Result<(), ureq::Error> {');

    if (SHORTHAND.includes(upperMethod)) {
      push(`let mut response = ureq::${upperMethod.toLowerCase()}("${rustString(fullUrl)}")`, 1);
      headers.forEach(header => push(header, 2));
      if (body) {
        if (!WITH_BODY.includes(upperMethod)) {
          push('.force_send_body()', 2);
        }
        push(`.send(${body})?;`, 2);
      } else if (WITH_BODY.includes(upperMethod)) {
        push('.send_empty()?;', 2);
      } else {
        push('.call()?;', 2);
      }
    } else {
      push('let request = ureq::http::Request::builder()', 1);
      push(`.method("${rustString(upperMethod)}")`, 2);
      push(`.uri("${rustString(fullUrl)}")`, 2);
      headers.forEach(header => push(header, 2));
      push(`.body(${body ?? '()'})?;`, 2);
      push('let mut response = ureq::run(request)?;', 1);
    }

    blank();
    push('println!("status: {}", response.status());', 1);
    push('println!("{}", response.body_mut().read_to_string()?);', 1);
    push('Ok(())', 1);
    push('}');

    return join();
  },
};
