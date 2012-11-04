var app = app || {};

(function() {

  app.Manager = Backbone.Router.extend({
    routes: {
      "":"loadApp",
      ":t":"loadRoutes",
      ":t/:r": "loadRouteDirections",
      "p/:r/:s":"loadPredictions",
      ":t/:r/:d": "loadRouteStops"
    },

    loadApp: function() {
      var appView = new app.AppView;
      appView.render();
    },

    loadRoutes: function(t) {
      var routeList = new app.Routes,
          routes;

      app.Controller.showLoadingText();
      app.type = t;
      app.Controller.showTitle(t === 's' ? 'Streetcar Routes' : 'Bus Routes');

      routeList.fetch({
        success: function(collection,response) {
          routes = t === 's' ? new app.Routes(routeList.streetCarRoutes()) : new app.Routes(routeList.busRoutes());
          var listView = new app.RoutesListView({collection:routes});
          app.Controller.showView(listView);
        }
      });
    },
    loadRouteDirections: function(t,r) {
      var routeDetail = new app.RouteDetail({tag:r});

      app.Controller.showLoadingText();
      app.type = t;
      app.route = r;

      routeDetail.fetch({
        success: function(model, response) {
          app.Controller.showTitle(model.get('title'));
          var directionsView = new app.DirectionsListView({collection:new app.Directions(model.get('direction'))});
          app.Controller.showView(directionsView);
        }
      });
    },

    loadRouteStops: function(t,r,d) {
      var routeDetail = new app.RouteDetail({tag:r});

      app.Controller.showLoadingText();
      app.type = t;
      app.route = r;
      app.direction = d;

      routeDetail.fetch({
        success: function(model, response) {
          var direction = new app.Directions(model.get('direction')).where({tag:d})[0];
          app.Controller.showTitle(direction.get('title'));
          var stopsView = new app.StopsView({collection:new app.Stops(direction.get('stop')), stops:routeDetail});
          app.Controller.showView(stopsView);
        }
      });
    },

    loadPredictions: function(r, s) {
      var routeDetail = new app.RouteDetail({tag:r}),
          router = this;

      app.Controller.showLoadingText();

      routeDetail.on('change', function() {
        var routeStop = _.find(routeDetail.get('stop'), function(stop) {
          if(stop.tag === s)
            return stop;
        });

        _.each(routeDetail.get('direction'), function(d) {
          _.each(d.stop, function(stop) {
            if(stop.tag === s) {
              router.actuallyLoadPredictions(new app.Prediction({route:r, routeTag:s}), d, routeStop);
            }
          });

        });
      });
      routeDetail.fetch();
    },

    actuallyLoadPredictions: function(predictions, direction, stop) {
      predictions.on('change', function() {
        app.Controller.showTitle(stop.title + ' <small>(' + direction.branch + ' ' + direction.name + ')</small>');

        var predictionsView = new app.PredictionView({collection:new app.Predictions(predictions),model:predictions,direction:direction});
        app.Controller.showView(predictionsView);
      });

      predictions.fetch();

      setInterval(function() {
        predictions.fetch();
      }, 30000);
    }
  });

})();
