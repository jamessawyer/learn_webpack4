export default (text = 'hello angle') => {
  const element = document.createElement('div');
  element.innerHTML = text;
  return element;
};
