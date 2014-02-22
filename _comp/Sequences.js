/**
 The Sequencer instance manages the UI of timeline selection and controls playback order of timelines.
 It allows the user to re-order timeline playback through drag and drop operations.
 We also keep track of all created timelines through a local member m_timelines.
 @class Sequencer
 @constructor
 @return {Object} instantiated Sequencer
 **/

function Sequencer(i_element) {

    this.self = this;
    this.m_thumbsContainer = $(i_element);
    this.m_timelines = {};
    this._init();
};

Sequencer.prototype = {
    constructor: Sequencer,

    /**
     Init the instance and enable drag and drop operation.
     We also wire the open properties UI so we can populate a selected timeline through the properties panel.
     @method _init
     @return none
     **/
    _init: function () {

        var self = this;

        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ( $(e.context).data('viewstackname') == 'tab4' && e.caller === commBroker.getService('PlayListViewStack')) {

                // var orientation = commBroker.getService('ScreenOrientation').getOrientation();
                // var resolution = commBroker.getService('ScreenResolution').getResolution();

                self._initLayoutSelectorDragDrop();

                setTimeout(function () {
                    $(Elements.ATTACH_DRAG_DROP_MAIN_SCREEN_SELECTION).trigger('tap');
                }, 3000);

                $('.openPropertiesClass').on('tap', function (e) {
                    commBroker.getService('CompProperty').openPanel(e);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                });
            }
        });
    },

    /**
     Enable drag and drop operations on the thumbnail timelines within the Sequencer UI.
     @method _initLayoutSelectorDragDrop
     @return none
     **/
    _initLayoutSelectorDragDrop: function () {
        var self = this;

        // Regular popup
        // $("#popupUndismissible").popup( "open", {x: 90, y: 90, width: '400', height: '400'});

        $(Elements.ATTACH_DRAG_DROP_MAIN_SCREEN_SELECTION).on('tap', function () {

            var h = $(Elements.SCREEN_LAYOUTS_UL).height();
            var t = h * 10 / 100;
            $('.draggableScreenPlaceHolder').css({height: h, top: '-' + h + 'px'});

            self.m_thumbsContainer.sortable({
                revert: 200,
                axis: 'x',
                opacity: 1.0,
                placeholder: 'draggableScreenPlaceHolder',
                start: function (e, ui) {
                    // $(ui.placeholder).slideUp();
                    $(ui.placeholder).hide();
                },

                stop: function () {
                    $(Elements.DETTACH_DRAG_DROP_MAIN_SCREEN_SELECTION).trigger('tap');
                    $(Elements.ATTACH_DRAG_DROP_MAIN_SCREEN_SELECTION).trigger('tap');
                    self.reSequenceTimelines();
                },

                change: function (e, ui) {
                    $(ui.placeholder).stop(true).animate({width: '0px'}, 100).css({width: '0px'}).slideDown({duration: 0.5}).animate({width: '100px'});
                    // $(ui.placeholder).stop(true).animate({width: '0px'},100).css({width: '0px'}).slideDown({duration: 0.2}).animate({width: '8px'},0.300);
                },
                scrollSpeed: 120,
                containment: self.m_thumbsContainer,
                delay: 200,
                scroll: true
            }).disableSelection();

        });

        $(Elements.DETTACH_DRAG_DROP_MAIN_SCREEN_SELECTION).on('tap', function () {
            $(self.m_thumbsContainer).disableSelection();
            self.m_thumbsContainer.sortable('destroy');
        });
    },

    /**
     Create the timeline template (a.k.a timeline thumbnail) via the ScreenTemplateFactory
     and insert it into the sequencer UI. We proceed by activating the newly created timeline thumbnail
     via the ScreenTemplateFactory public methods.
     @method createTimelineThumbnailUI
     @param {Object} i_screenProps
     @return none
     **/
    createTimelineThumbnailUI: function (i_screenProps) {
        var self = this;

        // Get the timelineid for current the timeline creating
        for (var screenProp in i_screenProps) {
            var campaign_timeline_id = i_screenProps[screenProp]['campaign_timeline_id']
            break;
        }

        var screenTemplateData = {
            orientation: commBroker.getService('ScreenOrientation').getOrientation(),
            resolution: commBroker.getService('ScreenResolution').getResolution(),
            screenProps: i_screenProps,
            scale: '14'
        }

        var screenTemplate = new ScreenTemplateFactory(screenTemplateData, ScreenTemplateFactory.ENTIRE_SELECTABLE, this);
        var snippet = screenTemplate.create();
        var elementID = $(snippet).attr('id');

        self.m_timelines[campaign_timeline_id] = elementID;

        screenTemplate.selectablelDivision();
        screenTemplate.activate();
        self.m_thumbsContainer.append(snippet);
        screenTemplate.selectableFrame();
    },

    /**
     Reorder the timeline in the local msdb to match the UI order of the timeline thumbnails in the Sequencer
     @method reSequenceTimelines
     @return none
     **/
    reSequenceTimelines: function () {
        var self = this;

        var timelines = $(self.m_thumbsContainer).children().each(function (sequenceIndex) {
            var element = $(this).find('[data-campaign_timeline_id]').eq(0);
            var campaign_timeline_id = $(element).data('campaign_timeline_id');
            var selectedCampaign = commBroker.getService('Campaign').getSelectedCampaign();
            jalapeno.setCampaignTimelineSequencerIndex(selectedCampaign, campaign_timeline_id, sequenceIndex);
        });
    },

    /**
     Return this instance.
     @method getOwner
     @return {Object} this
     **/
    getOwner: function () {
        return this;
    },

    /**
     Delete a timeline from the Sequencer UI, as well as from the local member m_timelines.
     @method deleteSequencedTimeline
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    deleteSequencedTimeline: function (i_campaign_timeline_id) {
        var self = this;
        var elementID = self.m_timelines[i_campaign_timeline_id];
        $('#' + elementID).remove();
        // var timeline = self.m_timelines[i_campaign_timeline_id];
        delete self.m_timelines[i_campaign_timeline_id];
        jalapeno.removeTimelineFromSequences(i_campaign_timeline_id);
        self.reSequenceTimelines();
    },

    /**
     Find the campaign_timeline_id within the Sequencer and trigger a tap event on it so it gets selected.
     @method selectTimeline
     @param {Number} i_campaign_timeline_id
     @return {Number} i_campaign_timeline_id or -1
     **/
    selectTimeline: function (i_campaign_timeline_id) {
        var self = this;
        var total = $(self.m_thumbsContainer).find('[data-campaign_timeline_id="' + i_campaign_timeline_id + '"]').eq(0).trigger('tap');
        if (total.length == 0)
            return -1;
        return i_campaign_timeline_id;
    }
}