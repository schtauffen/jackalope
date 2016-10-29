!(function () {
  function logger (J) {
    return function (next) {
      return function (action) {
        next(action)
        console.log(action)
      }
    }
  }

  if (typeof module !== 'undefined') module.exports = logger
  else if (window.Jackalope) {
    Jackalope.middleware = Jackalope.middleware || {}
    Jackalope.middleware.logger = logger
  }
})();
