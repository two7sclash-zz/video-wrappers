/**
 * Created on 18.05.2016.
 */
define(function(require) {

  var graphTemplate = require('html!assets/templates/graph.html');

  var actions = require('stores/actions');
  var dataStore = require('stores/datastore');
  var event = require('event');

  require('style!css/widgets/graph.css');

  var Graph = function(jsonData, model, pageModel, uniqueId) {
    var view = graphTemplate.cloneNode(true);
    var self = this;

    var slopeDiv = view.querySelector('.slope');

    var graph = view.querySelector('.graph');
    graph.setAttribute('id', 'graph' + uniqueId);

    if (jsonData.description) {
      view.setAttribute('tabindex', '0');
      view.setAttribute('aria-label', jsonData.description);
    }

    var firstTime;
    var dragIndex;
    var dragPoint;
    model.currentPageProperty.addObserver(function(pageInd) {
      if (pageInd === pageModel.i) {
        setTimeout(function() {
          initBoard.call(this, jsonData, uniqueId);

          if (!firstTime) {
            firstTime = true;

            //Handler for starting to drag a point - only supports two points
            $(graph).bind(
              'jqplotDragStart',
              function(seriesIndex, pointIndex, gridpos, datapos) {
                dragIndex = pointIndex;
                dragPoint = gridpos;
              }
            );

            //Handler for stopping to drag a point - only supports two points
            $(graph).bind(
              'jqplotDragStop',
              function(ev) {
                var coords = self.myPlot.series[dragIndex].data;

                if (coords[1][0] - coords[0][0] !== 0) {
                  var slope = (coords[1][1] - coords[0][1]) /
                              (coords[1][0] - coords[0][0]);
                  var intersect = coords[0][1] - slope * coords[0][0];
                  slope = Math.round(slope * 100) / 100;
                  intersect = Math.round(intersect * 100) / 100;

                  var equation = "Slope: " + slope + " m/s/s <br> y-Intercept: " + intersect + " m/s";

                  slopeDiv.style.display = '';
                  slopeDiv.innerHTML = equation;

                }
              }
            );
          }

        }.bind(this), 0);
      }
    }.bind(this));

    event.addCustomEventListener(actions.UPDATE_DATA_STORE, function() {
      if (model.currentPage === pageModel.i) {
        initBoard.call(this, jsonData, uniqueId);
      }
    }.bind(this));

    window.addEventListener('resize', function() {
      if (this.myPlot) {
        this.myPlot.replot();
      }
    }.bind(this));

    return view;
  };

  var addCoordinates = function(plot, ind) {
    if (plot.imports_from === undefined) {
      return;
    }

    // Get data
    var values = dataStore.getData(plot.imports_from);

    if (values) {
      //  Data must be sorted for velocity graphs
      var count = values.length - 1;
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < count - i; j++) {
          if (values[j][0] > values[j + 1][0]) {
            var max = values[j];
            values[j] = values[j + 1];
            values[j + 1] = max;
          }
        }
      }
    }

    // Clear plot data
    plot.coordinates = [];

    // Format of value:
    // [ index of frame in x-y-analysis,
    //	 x-coord of mouse click on the canvas (in x-y-analysis),
    //	 y-coord of mouse click on the canvas (in x-y-analysis),
    //	 time value pertaining to current frame in x-y-analysis ]
    _.forEach(values, function(value, index) {
      var x, y;

      if (plot.velocityGraph) {
        // Count value of point for velocity graph
        if (plot.indices) {
          if (index !== 0) {
            // Find bounding points
            var leftX = values[index - 1][plot.indices.x];
            var leftY = values[index - 1][plot.indices.y];
            var rightX = values[index][plot.indices.x];
            var rightY = values[index][plot.indices.y];

            // Create a point
            y = (rightY - leftY) / (rightX - leftX); // Slope
            x = (rightX + leftX) / 2; // X-Midpoint
          }
        }
      } else {
        // Get value of point for non-velocity graph

        // Get X and Y co-ordinates
        if (plot.indices) {
          x = value[plot.indices.x];
          y = value[plot.indices.y];
        } else {
          x = value[1];
          y = value[2];
        }
      }

      // Apply equations as necessary
      if (plot.equations) {
        var tempX; // For correct counting of Y

        if (plot.equations.x) {
          tempX = eval(plot.equations.x);
        }
        if (plot.equations.y) {
          y = eval(plot.equations.y);
        }

        x = tempX;
      }

      // Can only plot values if they're not NaN
      if (!isNaN(x) && !isNaN(y)) {
        if (x !== undefined && y !== undefined) {
          // Add point to existing coordinates
          plot.coordinates.push([x, y]);
        }
      }
    });
  };

  var initBoard = function(jsonData, uniqueId) {
    var importFrom = {};

    //Variables for the series index and point index of the currently dragged point
    var dragIndex;
    var dragPoint;

    _.forEach(jsonData.plots, function(plot, i) {
      addCoordinates(plot, i);
    });

    // Enable plugins on jqplot for trendline
    $.jqplot.config.enablePlugins = true;

    // Initialize Legend
    var legend = {
      show: jsonData.showLegend,
      location: jsonData.legendLocation
    };

    var grid = {
      background: 'rgba(57,57,57,0.0)'
    };

    var axes = {
      xaxis: {
        min: jsonData.xmin,
        max: jsonData.xmax,
        numberTicks: jsonData.xticks,
        label: jsonData.xlabel,
        showLabel: jsonData.showXLabel
      },
      yaxis: {
        min: jsonData.ymin,
        max: jsonData.ymax,
        numberTicks: jsonData.yticks,
        label: jsonData.ylabel,
        showLabel: jsonData.showYLabel,
        //labelRenderer: $.jqplot.CanvasAxisLabelRenderer
      }
    };

    var allPoints = [];
    var series = [];
    _.forEach(jsonData.plots, function(plot) {

      // Set up metadata
      series.push(
        {
          label: plot.label,
          trendline: {show: plot.trendline},
          dragable: {constrainTo: 'none', isDragable: plot.dragable},
          showLine: plot.showLine,
          color: plot.color,
          lineWidth: plot.lineWidth,
          rendererOptions: {smooth: plot.smooth},
          markerOptions: {
            show: plot.showMarkers,
            style: plot.markerStyle,
            size: plot.markerSize
          },
          isDragable: plot.dragable
        }
      );

      // Set up points
      if (plot.coordinates && plot.coordinates.length) {
        allPoints.push(plot.coordinates);
      } else {
        allPoints.push([[-1, -1]]);
      }
    });

    // Clear all the graphs
    $('graph' + uniqueId).html("");

    if (!this.myPlot) {
      this.myPlot = $.jqplot(
        'graph' + uniqueId,
        allPoints,
        {
          axes: axes,
          legend: legend,
          series: series,
          grid: grid,
          // Set the title of the graph (if this is undefined, no title is set)
          title: jsonData.graphTitle
        }
      );
    } else {
      _.forEach(allPoints, function(values, i) {
        this.myPlot.series[i].data = values;
      }.bind(this));

      this.myPlot.replot();
    }
  };

  return Graph;
});