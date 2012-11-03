var app = app || {};

(function() {

  var BaseListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-tabs nav-stacked',
    initialize: function() {
      this.childViews = [];
      $('#messages').empty();
    },
    render:function() {
      var view = this;
      this.collection.each(function(r) {
        view.$el.append(view.template(r.toJSON()));
      });
    }
  });

  app.RoutesListView = BaseListView.extend({
    template: _.template($('#routeListTemplate').html()),
    events: {
      "click a":"loadRouteDetail"
    },
    render: function() {
      Controller.showTitle('Routes');
      BaseListView.prototype.render.call(this);

      return this;
    },
    loadRouteDetail: function(e) {
      e.preventDefault();
      Controller.showLoadingText();
      window.routeTag = $(e.srcElement).attr('data-routetag');
      window.routeTitle = $(e.srcElement).attr('data-title');
      var routeDetail = new app.RouteDetail({tag:$(e.srcElement).attr('data-routetag')});
      routeDetail.on('change', function() {
        var directionsView = new app.DirectionsListView({collection:new app.Directions(routeDetail.get('direction')),stops:new app.Stops(routeDetail.get('stop'))});
        Controller.showView(directionsView);
      });
      routeDetail.fetch();
    }
  });

  app.DirectionsListView = BaseListView.extend({
    template: _.template($('#routeDirectionListTemplate').html()),
    events: {
      'click a':'loadStops'
    },
    render: function() {
      Controller.showTitle(window.routeTitle);
      BaseListView.prototype.render.call(this);

      return this;
    },
    loadStops: function(e) {
      e.preventDefault();
      Controller.showLoadingText();
      window.directionTitle = $(e.srcElement).attr('data-directiontitle');
      var tag = $(e.srcElement).attr('data-tag');
      var direction = this.collection.where({tag:tag})[0];
      var directionStops = new app.Stops(direction.get('stop'));
      var stopsView = new app.StopsView({collection:directionStops, stops:this.options.stops, direction:direction});
      Controller.showView(stopsView);
    }
  });

  app.StopsView = BaseListView.extend({
    template: _.template($('#routeStopListTemplate').html()),
    render: function() {
      var view = this;
      Controller.showTitle(window.directionTitle);
      this.collection.each(function(d) {
        var stop = view.options.stops.where({tag: d.get('tag')})[0];
        view.$el.append(view.template({data:stop.toJSON(), route:window.routeTag, stopId: stop.get('stopId') ? stop.get('stopId') : 0}));
      });
      return this;
    }
  });

  app.PredictionReloader = BaseListView.extend({
    el:'#top-nav',
    events: {
      'click button':'reloadPredictions'
    },
    initialize: function() {
      this.$el.empty();
    },
    render: function() {
      var reloadButton = this.make('button',{'id':'reload-button','class':'btn btn-navbar reload'}, '<i class="icon-refresh icon-white"></i>');
      this.$el.append(reloadButton);
    },
    reloadPredictions: function(e) {
      e.preventDefault();
      $(e.srcElement).text('...');
      var view = this;
      this.model.fetch({
        success: function(model, response) {
          var routePredictions = new app.Predictions(model)
          var predictionsView = new app.PredictionView({collection:routePredictions,model:model, direction:view.options.direction,stop:view.options.stop});
          Controller.showView(predictionsView);
        }
      });
    }
  });

  app.PredictionView = BaseListView.extend({
    tagName:'table',
    className: 'table',
    template: _.template($('#routePredictionListTemplate').html()),
    events: {
      'click button':'reloadPredictions'
    },
    initialize:function() {
      $('#routes').addClass('predictions');
      BaseListView.prototype.initialize.call(this);
    },
    render: function() {
      var view = this,
          count = 0
          tbody = this.make('tbody'),
          direction = this.options.direction,
          stop = this.options.stop;
          console.log(direction);

      _.each(this.collection.models[0].attributes, function(p) {
          if(p.minutes) {
            var minutesUntil = parseInt(p.minutes);
            if(!p.title) p.title = direction.title;
            if(minutesUntil > 10) {
              p.label = 'label-success';
              p.rowlabel = 'success';
            } else if (minutesUntil <= 10 && minutesUntil > 5) {
              p.label = 'label-warning';
              p.rowlabel = 'warning';
            } else if (minutesUntil <= 5) {
              p.label = 'label-important';
              p.rowlabel = 'error';
            } else {
              p.label = 'label-default';
            }
            $(tbody).append(view.template({data:p}));
            count = count + 1;
          }
      });

      if(count === 0) {
        app.Helpers.makeAlert({message:'There are no predictions for this stop', className:'alert-info'});
      } else {
        this.$el.append(tbody);
      }

      var reloader = new app.PredictionReloader({model:this.model, predictions:this.options.predictions, direction:this.options.direction, stop:view.options.stop});
      reloader.render();

      return this;
    },
    reloadPredictions: function(e) {
      e.preventDefault();
      $(e.srcElement).text('...');
      this.model.fetch();
    }
  });

  app.AppView = Backbone.View.extend({
    el: '#routes',
    events: {
      'click a':'loadRoutes'
    },
    render:function() {
      var view = this;
      $('#title').show();
      $('#type-selector').show();

      var routeList = new app.Routes;
      routeList.fetch();
      routeList.on('reset', function() {
        if(routeList === undefined || (routeList && routeList.length ===0))
          alert('The route list is empty');
        view.collection = routeList;
      });

      return this;
    },
    loadRoutes: function(e) {
      e.preventDefault();
      var type = $(e.srcElement).attr('data-type'),
          loadCollectionStreetCar = new app.Routes, loadCollectionBus = new app.Routes,
          listView;

      this.collection.each(function(r) {
        if(r.get('tag').length > 2 && r.get('tag').slice(0,1) === '5') loadCollectionStreetCar.add(r);
        else loadCollectionBus.add(r);

        switch(type) {
          case 's':
            listView = new app.RoutesListView({collection:loadCollectionStreetCar});
          break;
          case 'b':
            listView = new app.RoutesListView({collection:loadCollectionBus});
          break
        }
      });
      Controller.showView(listView);
    }
  });

  var Controller = {
    showView: function(view) {
      if(this.currentView) {
        this.currentView.close();
      }

      this.currentView = view;
      if(this.currentView.render) {
        this.currentView.render();
      }
      $('#routes').empty();
      $('#routes').append(view.el);
    },
    showTitle: function(message) {
      $('#title').html(message);
      $('#title').show();
    },
    showLoadingText: function() {
      $('#routes').empty();
      $('#routes').text('Loading...');
    }
  };

  app.Controller = Controller;
})();
