var app = app || {};

(function() {

  var Helpers = {
    locate: function(done) {
      // handles geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          return Helpers.handleLocatedEvent(position, done);
        }, function () {
          return Helpers.handleNotLocatedEvent(done);
        });
      } else if (google.gears) {
        browserSupportFlag = true;
        var geo = google.gears.factory.create('beta.geolocation');
        geo.getCurrentPosition(function (position) {
          view.handleLocatedEvent(initialLocation);
        }, function () {
          return Helpers.handleLocatedEvent(position, done);
        });
        // Browser doesn't support Geolocation
      } else {
      }
    },

    handleLocatedEvent: function(position, done) {
      if(done) done(position);
    },
    handleNotLocatedEvent: function(done) {
      //app.Helpers.makeAlert({className:'alert-info', message:'We could not locate you automatically, you can still browse stops using the list below, just choose a transit type!'});
      if(done) done(undefined);
    },

    makeAlert: function(opts) {
      var alert = $('<div class="alert">').text(opts.message);
      var close = $('<a class="close" data-dismiss="alert" href="#">').text('x').prependTo(alert);
      if(opts.className) alert.addClass(opts.className);

      alert.appendTo('#messages');
    }
  };

  app.Helpers = Helpers;
})();
