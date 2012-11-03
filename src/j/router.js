var app = app || {};

(function() {

  app.Manager = Backbone.Router.extend({
    routes: {
      ":routetag/:stoptag":"loadPredictions"
      //"*path":"loadApp"
    },

    //loadApp: function() {
      //console.log('here');
      //var appView = new app.AppView;
      //appView.render();
    //},
    loadPredictions: function(routetag, stoptag) {

      $('#routes').empty();
      $('#title').text();
      $('#routes').text('Loading...');
      var routeDetail = new app.RouteDetail({tag:routetag});
      var router = this;
      routeDetail.on('change', function() {
        var routeStop = _.find(routeDetail.get('stop'), function(s) {
          if(s.tag === stoptag)
            return s;
        });

        _.each(routeDetail.get('direction'), function(d) {
          _.each(d.stop, function(s) {
            if(s.tag === stoptag) {
              direction = d;
              var predictions = new app.Prediction({route:routetag, routeTag:stoptag});
              router.actuallyLoadPredictions(predictions, new app.Direction(direction), routeStop);
            }
          });

        });
      });
      routeDetail.fetch();

    },
    actuallyLoadPredictions: function(predictions, directions, stop) {

      predictions.fetch({
        success: function(model, response) {
          var routePredictions = new app.Predictions(predictions)
          var predictionsView = new app.PredictionView({collection:routePredictions,model:predictions,direction:direction, stop:stop});
          app.Controller.showView(predictionsView);
        },
        error: function(model, response) {
        } 
      });
    }
  });


})();
