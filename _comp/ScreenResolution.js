/**
 The ScreenResolution class allows the user to select between pre-set resolution options to configure a new campaign with.
 @class ScreenResolution
 @constructor
 @return {Object} instantiated ScreenResolution
 **/
function ScreenResolution() {
    this.self = this;
    this.m_resolution = '1920x1080';
};

ScreenResolution.prototype = {
    constructor: ScreenResolution,

    /**
     Init the instance and bind UI for resolution mode selection.
     @method init
     @return none
     **/
    init: function () {
        var self = this;
        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab3' && commBroker.getService('PlayListViewStack') === e.caller) {
                var orientation = commBroker.getService('ScreenOrientation').getOrientation();
                self._buildResolutionSelector(orientation);
            }
        });
    },

    /**
     This is the main method that builds the UI for screen resolution selection on the creation of a new campaign.
     Note that the i_orientation is taken into count so we only display resolutions that adhere to the selected orientation.
     @method _buildResolutionSelector
     @param {String} i_orientation
     @return none
     **/
    _buildResolutionSelector: function (i_orientation) {

        var self = this;
        var screens = '';
        var i = 0;

        function _checkToSelectRadio(i_preSetResolution, i_screenResolution, i_counter) {
            if (i_preSetResolution == undefined && i_counter == 0) {
                self.m_resolution = i_screenResolution;
                return 'checked="checked">';
            }

            if (i_preSetResolution == i_screenResolution) {
                self.m_resolution = i_screenResolution;
                return 'checked="checked">';
            }
            return '>';
        }

        var preSetResolution = self.m_resolution;

        $('#stationOrientationTitle').text('select ' + i_orientation + ' settings');
        $('#stationResolution').children().remove();

        var collection = model.getScreenCollection();
        for (var screenResolution in collection[i_orientation]) {
            screens += '<input class="resolutionRadioSelection" data-screen="' + screenResolution + '" type="radio" data-theme="a" data-corners="false" name="stationResolutionOption" id="stationResolutionOption' + i + '" ' +
                _checkToSelectRadio(preSetResolution, screenResolution, i) +
                '<label class="resolutionRadioSelection" data-corners="false" for="stationResolutionOption' + i + '">' + screenResolution + '</label>';
            i++;
        }


        $('#stationResolution').append(screens);
        $("input[type='radio']", '#stationResolution').checkboxradio();
        $("input[type='radio']", '#stationResolution').checkboxradio("refresh");
        $("input[type='radio']", '#stationResolution').on('change', function (e) {

            var resolution = $(e.target).attr('data-screen');
            self.m_resolution = resolution;

            var screenArrowSelector = commBroker.getService('ScreenArrowSelector');
            setTimeout(function () {
                screenArrowSelector.selectNext();
            }, 400);
        });

        $("#stationResolution div:last-child").css({'border-bottom': "1px solid #CCC"})
    },

    /**
     Set the resolution of this instance to a given value.
     @method setResolution
     @param {String} i_value
     @return none
     **/
    setResolution: function (i_value) {
        this.m_resolution = i_value;
    },

    /**
     Get the set resolution of this instance.
     @method getResolution
     @return {String} m_resolution
     **/
    getResolution: function () {
        return this.m_resolution;
    }
}

