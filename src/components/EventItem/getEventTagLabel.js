const getEventTagLabel = event => {
  if (!event.raw || typeof event.raw !== 'object') {
    return null;
  }
  const { label, type } = event.raw;
  if (typeof label === 'string' && label) {
    return label;
  }
  if (typeof type === 'string' && type) {
    return type;
  }
  return null;
};

export default getEventTagLabel;
