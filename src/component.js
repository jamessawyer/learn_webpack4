export default (text = 'hello angle') => {
  const element = document.createElement('div');
  element.innerHTML = text;

  element.onclick = () =>
    import('./lazy')
      .then(lazy => {
        element.textContent = lazy.default;
      })
      .catch(err => {
        console.log('懒加载出错了', err);
      });
  return element;
};
