// ----------------------------------------------------------------------

const BASE_PATH = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const joinWithBase = (path: string) => {
  if (!BASE_PATH || BASE_PATH === '' || BASE_PATH === '/') {
    return path.startsWith('/') ? path : `/${path}`;
  }

  if (path.startsWith(BASE_PATH)) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${BASE_PATH}${path}`;
  }

  return `${BASE_PATH}/${path}`;
};

export const buildAppPath = (path: string) => {
  if (!path) {
    return BASE_PATH || '/';
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  return joinWithBase(path);
};
