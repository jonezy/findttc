var app = app || {};

// adds a close function to Backbone.View, if you need to do anything
// specific when closing your view, implement an onClose function.
Backbone.View.prototype.close = function () {
  // close all the child views that have been stored in this.childViews
  _.each(this.childViews, function (childView) {
    if (childView.remove) {
      childView.remove();
    }

    if (childView.close) {
      childView.close();
    }

    delete childView;
  });

  // handle cleaning up this view
  this.off();
  this.remove();

  if (this.onClose) {
    this.onClose();
  }

  return this;
}

$(function() {
  //var appView = new app.AppView;
  //appView.render();

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
