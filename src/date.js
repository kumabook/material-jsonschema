export default {
  parse: (str) => {
    if (str) {
      return new Date(str);
    }
    return new Date();
  },
};
