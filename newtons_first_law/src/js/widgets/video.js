/**
 * Created by JFishwick on 08.05.2016.
 */
define(function(require) {
  'use strict';

  var properties = require('properties');
  var event = require('event');

  var dataStore = require('stores/datastore');
  var actions = require('stores/actions');

  var videoTemplate = require('html!assets/templates/video.html');

  require('style!css/widgets/video.css');

  var langMap = {
    'en': 'English'
  };

  var Video = function(videoData, model, pageModel, uniqueId) {
    var self = this;

    this.videoData = videoData;
    this.model = model;
    this.pageModel = pageModel;

    var view = videoTemplate.cloneNode(true);
    var video = view.querySelector('.video');
    video.setAttribute('id', 'video' + uniqueId);

    // Doesn't work without delay
    setTimeout(function() {
      self.player = jwplayer(video).setup({
        sources: getSources(videoData),
        tracks: getSubs(videoData),
        height: '100%',
        width: '100%',
        mute: videoData.muted,
        repeat: videoData.loop,
        image: videoData.poster ? 'images/' + videoData.poster : null,
        autostart: (videoData.autoplay && pageModel.i === model.currentPage), // Autoplay for first page
        captions: {
          fontSize: 10,
          backgroundOpacity: 70,
          fontFamily: 'Open Sans'
        }
      });
    }, 0);

    if (videoData.transcript) {
      var transcriptBtn = view.querySelector('.video-transcript');
      transcriptBtn.style.display = '';

      transcriptBtn.addEventListener(event.user.mousedown, function() {
        window.open('./transcripts/' + videoData.transcript, '_blank');
        self.player.pause(true);
      });

      transcriptBtn.addEventListener('keyup', function(e) {
        if (e.keyCode === 32) { // Space
          window.open('./transcripts/' + videoData.transcript, '_blank');
          self.player.pause(true);
        }
      });
    }

    model.currentPageProperty.addObserver(function(pageInd, oldPageInd) {
      if (oldPageInd === pageModel.i) {
        self.player.pause(true);
      }

      if (pageInd === pageModel.i) {
        var vid = self.player.container.querySelector('video');

        vid.setAttribute('tabindex', '-1');
        vid.setAttribute('aria-hidden', 'true');

        if (videoData.description) {
          self.player.container.setAttribute('aria-label', videoData.description);
        }
      }

      autoPlay.call(self);
    });

    return view;
  };

  var getSources = function(videoData) {
    return _.reduce(videoData.sources, function(result, sourceData) {
      result.push({
        file:/* 'videos/'*/ 'http://wowzahttp.cengage.com/digital-production/physics/' + sourceData.source
      });

      return result;
    }, []);
  };

  var getSubs = function(videoData) {
    return _.reduce(videoData.subs && videoData.subs, function(result, subData) {
      result.push({
        file: 'subs/' + subData.source,
        label: langMap[subData.lang],
        kind: 'captions'
      });

      return result;
    }, []);
  };

  var autoPlay = function() {
    if (this.model.currentPage === this.pageModel.i) {
      if (this.videoData.autoplay && this.player) {
        this.player.play();
      }
    }
  };

  return Video;
});
