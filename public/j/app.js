var app = app || {};

$(function() {
  app.Router = new app.Manager;
  Backbone.history.start({ pushState: false });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    var root = location.protocol + "//" + location.host;

    if (href.prop.slice(0, root.length) === root) {
      evt.preventDefault();
      Backbone.history.navigate(href.attr, false);
    }
  });

  if(window.location.hash)
    app.Router.navigate(window.location.hash);
});
