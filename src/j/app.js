$(function() {
  var Route = Backbone.Model.extend({});
  var RouteDetail = Backbone.Model.extend({
    url: function() {
      return 'http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=ttc&r='+this.get('tag')+'';
    },
    parse: function(response) {
      return response.route;
    }
  });
  var Routes = Backbone.Collection.extend({
    model:Route,
    url: 'http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=ttc',
    parse: function(response) {
      return response.route;
    }
  });

  var Direction = Backbone.Model.extend({});
  var Directions = Backbone.Collection.extend({model:Direction});

  var Stop = Backbone.Model.extend({});
  var Stops = Backbone.Collection.extend({model:Stop});

  var Prediction = Backbone.Model.extend({
    url: function() {
      return 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&r='+ this.get('routeTag')+'&s='+this.get('stop')+'';
    },
    parse: function(response) {
      if(response.predictions.direction)
        return response.predictions.direction.prediction;

      return "";
    }
  });
  var Predictions = Backbone.Collection.extend({model:Prediction});

  var RoutesListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-tabs nav-stacked',
    template: _.template($('#routeListTemplate').html()),
    events: {
      "click a":"loadRouteDetail"
    },
    render: function() {
      var view = this;
      Controller.showTitle('Routes');
      this.collection.each(function(r) {
        view.$el.append(view.template(r.toJSON()));
      });
      return this;
    },
    loadRouteDetail: function(e) {
      e.preventDefault();
      Controller.showLoadingText();
      window.routeTag = $(e.srcElement).attr('data-routetag');
      window.routeTitle = $(e.srcElement).attr('data-title');
      console.log($(e.srcElement).attr('data-title'));
      var routeDetail = new RouteDetail({tag:$(e.srcElement).attr('data-routetag')});
      routeDetail.on('change', function() {
        var directionsView = new DirectionsListView({collection:new Directions(routeDetail.get('direction')),stops:new Stops(routeDetail.get('stop'))});
        Controller.showView(directionsView);
      });
      routeDetail.fetch();
    }
  });

  var DirectionsListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-tabs nav-stacked',
    template: _.template($('#routeDirectionListTemplate').html()),
    events: {
      'click a':'loadStops'
    },
    render: function() {
      var view = this;
      console.log(window.routeTitle);
      Controller.showTitle(window.routeTitle);
      this.collection.each(function(d) {
        view.$el.append(view.template(d.toJSON()));
      });
      return this;
    },
    loadStops: function(e) {
      e.preventDefault();
      Controller.showLoadingText();
      window.directionTitle = $(e.srcElement).attr('data-directiontitle');
      var tag = $(e.srcElement).attr('data-tag');
      var direction = this.collection.where({tag:tag})[0];
      var directionStops = new Stops(direction.get('stop'));
      var stopsView = new StopsView({collection:directionStops, stops:this.options.stops});
      Controller.showView(stopsView);
    }
  });

  var StopsView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-tabs nav-stacked',
    template: _.template($('#routeStopListTemplate').html()),
    events: {
      'click a':'loadPredictions'
    },
    render: function() {
      var view = this;
      Controller.showTitle(window.directionTitle);
      this.collection.each(function(d) {
        var stop = view.options.stops.where({tag: d.get('tag')})[0];
        var sid = stop.get('stopId') ? stop.get('stopId') : 0;
        view.$el.append(view.template({data:stop.toJSON(), stopId: sid}));
      });
      return this;
    },
    loadPredictions: function(e) {
      e.preventDefault();

      Controller.showLoadingText();

      window.StopTitle = $(e.srcElement).attr('data-stoptitle');

      var predictions = new Prediction({routeTag:window.routeTag,stop:$(e.srcElement).attr('data-tag')});
      predictions.on('change', function() {
        var predictionsView = new PredictionView({collection:predictions});
        Controller.showView(predictionsView);
      });

      predictions.fetch();
      setInterval(function() {
        predictions.fetch();
      }, 20000);
    }
  });

  var PredictionView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-tabs nav-stacked',
    template: _.template($('#routePredictionListTemplate').html()),
    render: function() {
      var view = this;
      Controller.showTitle(window.directionTitle + ' - ' + window.StopTitle);
      _.each(this.collection.attributes,function(p) {
        if(p.minutes) {
        view.$el.append(view.template(p));
        }
      });
      return this;
    }
  });

  var AppView = Backbone.View.extend({
    el: '#routes',
    events: {
      'click a':'loadRoutes'
    },
    render:function() {
      var view = this,
          routeList = new Routes;

      routeList.fetch();
      routeList.on('reset', function() {
        view.collection = routeList;
      });

      return this;
    },
    loadRoutes: function(e) {
      e.preventDefault();
      var type = $(e.srcElement).attr('data-type'),
          loadCollectionStreetCar = new Routes,
          loadCollectionBus = new Routes,
          listView;

      this.collection.each(function(r) {
        if(r.get('tag').length > 2 && r.get('tag').slice(0,1) === '5') loadCollectionStreetCar.add(r);
        else loadCollectionBus.add(r);

        switch(type) {
          case 's':
            listView = new RoutesListView({collection:loadCollectionStreetCar});
          break;
          case 'b':
            console.log('here');
          listView = new RoutesListView({collection:loadCollectionBus});
          break
        }
      });
      Controller.showView(listView);
    }
  });

  var Controller = {
    showView: function(view) {
      view.render();
      $('#routes').empty();
      $('#routes').append(view.el);
    },
    showTitle: function(message) {
      $('#title').text(message);
      $('#title').show();
    },
    showLoadingText: function() {
      $('#routes').empty();
      $('#routes').text('Loading...');
    }
  };

  var appView = new AppView;
  appView.render();

  // When ready...
  window.addEventListener("load",function() {
    // Set a timeout...
    setTimeout(function(){
      // Hide the address bar!
      window.scrollTo(0, 1);
    }, 0);
  });
});
