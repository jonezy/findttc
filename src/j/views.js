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
    events: {
      'click a':'loadPredictions'
    },
    render: function() {
      var view = this;
      Controller.showTitle(window.directionTitle);
      this.collection.each(function(d) {
        var stop = view.options.stops.where({tag: d.get('tag')})[0];
        view.$el.append(view.template({data:stop.toJSON(), stopId: stop.get('stopId') ? stop.get('stopId') : 0}));
      });
      return this;
    },
    loadPredictions: function(e) {
      e.preventDefault();
      var view = this;

      Controller.showLoadingText();
      window.StopTitle = $(e.srcElement).attr('data-stoptitle');

      var predictions = new app.Prediction({route:window.routeTag, routeTag:$(e.srcElement).attr('data-tag'),stop:$(e.srcElement).attr('data-stopid')});
      //predictions.on('change', function() {
          //var routePredictions = new app.Predictions(predictions)
          //var predictionsView = new app.PredictionView({collection:routePredictions,model:predictions, direction:view.options.direction});
          //Controller.showView(predictionsView);
      //});

      predictions.fetch({
        success: function(model, response) {
          var routePredictions = new app.Predictions(predictions)
          var predictionsView = new app.PredictionView({collection:routePredictions,model:predictions, direction:view.options.direction});
          Controller.showView(predictionsView);
        },
        error: function(model, response) {
        } 
      });
      setInterval(function() {
        $('#reload-button').text('...');
        predictions.fetch({
          success: function(model, response) {
            var routePredictions = new app.Predictions(predictions)
            var predictionsView = new app.PredictionView({collection:routePredictions,model:predictions, direction:view.options.direction});
            Controller.showView(predictionsView);
          },
          error: function(model, response) {
          } 
        });
      }, 40000);
    }
  });

  app.PredictionReloader = BaseListView.extend({
    el:'#actions',
    events: {
      'click button':'reloadPredictions'
    },
    initialize: function() {
      this.$el.empty();
    },
    render: function() {
      var reloadButton = this.make('button',{'id':'reload-button','class':'btn','style':'margin-top:10px;'}, '<i class="icon-refresh"></i>');
      this.$el.append(reloadButton);
    },
    reloadPredictions: function(e) {
      e.preventDefault();
      $(e.srcElement).text('...');
      var view = this;
      this.model.fetch({
          success: function(model, response) {
            var routePredictions = new app.Predictions(model)
            var predictionsView = new app.PredictionView({collection:routePredictions,model:model, direction:view.options.direction});
            Controller.showView(predictionsView);
          },
          error: function(model, response) {
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
      var view = this;
      BaseListView.prototype.initialize.call(this);
    },
    render: function() {
      var view = this,
          count = 0
          tbody = this.make('tbody'),
          direction = this.options.direction.toJSON();;

      Controller.showTitle(direction.branch + ' ' + direction.name + ' ' + ': ' + window.StopTitle);

      _.each(this.collection.models[0].attributes, function(p) {

          if(p.minutes) {
            var minutesUntil = parseInt(p.minutes);
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
      console.log(count);
      if(count === 0) {
        app.Helpers.makeAlert({message:'There are no predictions for this stop', className:'alert-info'});
      } else {
        if(count <= 5) {
          //if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
            //$('#routes').height(190);
          //}
        }
        this.$el.append(tbody);

        var reloader = new app.PredictionReloader({model:this.model, predictions:this.options.predictions, direction:this.options.direction});
        reloader.render();
        //this.childViews.push(reloader);
      }
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

      //var position = app.Helpers.locate(function(position) {
        //if(position) {
          //view.handleLocated(position);
        //} else {
          var routeList = new app.Routes;
          routeList.fetch();
          routeList.on('reset', function() {
            if(routeList === undefined || (routeList && routeList.length ===0))
               alert('The route list is empty');
            view.collection = routeList;
          });
        //}
      //});

      return this;
    },
    handleLocated: function(position) {
      var routesNear = new app.RoutesNearCollection({lat:position.coords.latitude,long:position.coords.longitude});
        var routeCollection = new app.Routes;
        routesNear.fetch();
        routesNear.on('reset', function() {
          routesNear.each(function(r) {
            var detail = new app.RouteNearDetailModel({uri:r.get('uri')});
            detail.fetch();
            detail.on('change', function() {
              detail.set({distance:r.get('distance')}, {silent:true});
              routeCollection.add(detail); 
            });
          });

          var listView = new app.RoutesListView({collection:routeCollection});
          Controller.showView(listView);
      });
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
      this.currentView.render();
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
})();
