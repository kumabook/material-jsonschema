const defaultPorts = { 'http:': 80, 'https:': 443 };

export const getRootUrl = () => {
  const { port, protocol, hostname } = window.location;
  const p = (port && (port !== defaultPorts[protocol])) ? `:${port}` : '';
  return `${protocol}//${hostname}${p}`;
};

export const getFileUrl = path => `${getRootUrl()}${path}`;
