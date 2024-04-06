import * as child_process from 'child_process';

const HTTP_REGEX = /(\w+:\/\/)(.+@)*([\w\d\.]+)(:[\d]+){0,1}\/*(.*)/;
const HTTP_REGEX_PREFIX_SELECTOR = /(\w+:\/\/)/;

const SSH_REGEX = /(.+@)*([\w\d\.]+):(.*)/;
const SSH_REGEX_PREFIX_SELECTOR = /(.+@)*([\w\d\.]+):/;
const SSH_REGEX_DOMAIN_CAPTURER = /(?:.+@)*([\w\d\.]+)(?::)/;

/**
 * Takes URL like git@github.com:organization/low-code.git
 * or https://github.com/organization/low-code.git
 * and returns github.com/originzation/low-code.git
 *
 * @param {string} repoStr - The full url of the repo in https or ssh format.
 * @returns {string} - Modified URL with domain and path only.
 */
export const extractURL = (repoStr: string) => {
  if (HTTP_REGEX.test(repoStr)) {
    // remove schema and just regurns domain and path
    return repoStr.replace(HTTP_REGEX_PREFIX_SELECTOR, '');
  }

  if (SSH_REGEX.test(repoStr)) {
    // get matched and captured string array
    const matchedAndCaptured = repoStr.match(SSH_REGEX_DOMAIN_CAPTURER);

    if (!matchedAndCaptured?.length) {
      return repoStr;
    }

    const domain = matchedAndCaptured[1];
    const path = repoStr.replace(SSH_REGEX_PREFIX_SELECTOR, '');

    return `${domain}/${path}`;
  }

  return repoStr;
};
