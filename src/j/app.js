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
  var appView = new app.AppView;
  appView.render();
});
