module.exports.default = (source) => {
  if (source.search(/url\(/)) {
    console.log(source);
  }
  // Apply some transformations to the source...

  return source;
};
