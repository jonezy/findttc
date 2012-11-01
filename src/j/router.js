var app = app || {};

(function() {

  app.Manager = Backbone.Router.extend({
    routes: {
      "":"loadApp",
      ":routetag/:stoptag":"loadPredictions"
    },

    loadApp: function() {
      console.log('handled in route');
      var appView = new app.AppView;
      appView.render();
    },
    loadPredictions: function(routetag, stoptag) {
      $('#routes').empty();
      var routeList = new app.Routes;
      routeList.fetch({
        success:function() {
          coll = routeList;
        }
      });

      //var routeDetail = new app.RouteDetail({tag:routetag});
      //routeDetail.fetch({
        //success:function() {

      //console.log(routeDetail);
        //}

      //})
      var predictions = new app.Prediction({route:routetag, routeTag:stoptag});
      predictions.fetch({
        success: function(model, response) {
          var routePredictions = new app.Predictions(predictions)
          var predictionsView = new app.PredictionView({collection:routePredictions,model:predictions});
          app.Controller.showView(predictionsView);
        },
        error: function(model, response) {
        } 
      });
    }
  });


})();
