/*
 *   Create by Andrei Shneider
 *   http://code9.biz
*/

(function (window, $, undefined) {
    "use strict";

    $.html5videoupload = function html5videoupload(options, element) {

        this.element = element;
        this.options = $.extend(true, {}, $.html5videoupload.defaults, options, $(this.element).data());
        this.input = $(this.element).find('input[type=file]');

        var _self = this;

        //buttons
        this.button = {}
        this.button.edit = '<div class="btn btn-info btn-edit" title="' + (this.options.editTitle || 'Edit') + '"><i class="glyphicon glyphicon-pencil"></i></div>';
        this.button.saving = '<div class="btn btn-warning saving">' + (this.options.saveLabel || 'Saving...') + ' <i class="glyphicon glyphicon-time"></i></div>';
        this.button.cancel = '<div class="btn btn-danger btn-cancel" title="' + (this.options.cancelTitle || 'Cancel') + '"><i class="glyphicon glyphicon-remove"></i></div>';
        this.button.done = '<div class="btn btn-success btn-ok" title="' + (this.options.okTitle || 'Ok') + '"><i class="glyphicon glyphicon-ok"></i></div>';
        this.button.del = '<div class="btn btn-danger btn-del" title="' + (this.options.delTitle || 'Delete') + '"><i class="glyphicon glyphicon-trash"></i></div>';

        _self._init();

    };

    $.html5videoupload.defaults = {

        //url to upload service
        url: null,

        //video path
        video: null,

        onAfterProcessVideo: null,
        onAfterCancel: null
    };

    $.html5videoupload.prototype = {
        _init: function () {

            var _self = this;
            var element = _self.element;
            var options = _self.options;

            if (empty($(element))) {
                return false;
            } else {
                $(element).children().css({ position: 'absolute' });
            }

            //the engine of this script
            if (!(window.FormData && ("upload" in ($.ajaxSettings.xhr())))) {
                $(element).empty().attr('class', '').addClass('alert alert-danger').html('HTML5 Upload Image: Sadly.. this browser does not support the plugin, update your browser today!');
                return false;
            }

            _self._bind();

            if (!empty(options.video)) {

                $(element)
                    .data('video', options.video)
                    .append($('<div class="final" style="background: black"><video controls style="height: 200px; width: 300px"></video></div>'));

                $(element).find('video').attr('src', options.video);
				
                var tools			= $('<div class="preview tools"></div>');
                var del				= $('' + this.button.del + '');

                $(del).unbind('click').click(function(e) {
                    e.preventDefault();
                    _self.reset();
                });
								
                $(tools).append(del);
				
				$(element).append(tools);
            }

            return true;
        },

        _bind: function () {
            var _self = this;
            var element = _self.element;
            var input = _self.input;

            //bind the events
            $(element).unbind('drop').on({
                drop: function (event) {
                    _self.handleFile(event, $(this));
                }
            });

            $(input).unbind('change').change(function (event) {
                _self.drag = false;
                _self.handleFile(event, $(element));
            });
        },

        handleFile: function (event, element) {
            event.stopPropagation();
            event.preventDefault();

            var _self = this;
            var files = event.originalEvent.target.files;

            $(element).removeClass('notAnImage').addClass('loading');

            for (var i = 0, f; f = files[i]; i++) {

                if (!f.type.match('video/mp4')) {
                    $(element).addClass('notAnVideo');
                    continue;
                }

                var src = URL.createObjectURL(f);

                //place the images
                $(element).append($('<div class="final" style="background: black"><video controls style="height: 200px; width: 300px"></video></div>'));
                $(element).find('video').attr('src', src);

                _self._tools();

                //clean up
                $(element).removeClass('loading');
            }
        },

        _tools: function () {
            var _self = this;
            var element = _self.element;
            var tools = $('<div class="tools"></div>');

            //cancel button (removes the image and resets it to the original init event
            $(tools).append($(_self.button.cancel).on({
                'touchstart touchend click': function (e) {
                    e.preventDefault();
                    _self.reset();
                }
            }));

            $(tools).append($(_self.button.done).on({
                'touchstart click': function (e) {
                    e.preventDefault();
                    _self.videoSave();
                }
            }));

            $(element).append($(tools));
        },

        videoSave: function () {
            var _self = this;
            var element = _self.element;
            var options = _self.options;

            $(element).find('.tools').children().toggle();
            $(element).find('.tools').append($(_self.button.saving));

            var formdata = new FormData();
            formdata.append("Video", _self.input[0].files[0]);

            $.ajax({
                type: 'POST',
                url: options.url,
                data: formdata,
                cache: false,
                contentType: false,
                processData: false,

                success: function (response) {

                    if (response.status == "success") {
                        $(element).find('.tools .saving').remove();
                        $(element).find('.tools').children().toggle();

                        $(element).data('video', response.video);

                        _self.videoFinal();

                    } else {
                        $(element).find('.tools .saving').remove();
                        $(element).find('.tools').children().toggle();
                        $(element).append($('<div class="alert alert-danger">' + response.error + '</div>').css({ bottom: '10px', left: '10px', right: '10px', position: 'absolute', zIndex: 99 }));
                        setTimeout(function () { _self.responseReset(); }, 2000);
                    }
                },
                error: function (response, status) {
                    $(element).find('.tools .saving').remove();
                    $(element).find('.tools').children().toggle();
                    $(element).append($('<div class="alert alert-danger"><strong>' + response.status + '</strong> ' + response.statusText + '</div>').css({ bottom: '10px', left: '10px', right: '10px', position: 'absolute', zIndex: 99 }));
                    setTimeout(function () { _self.responseReset(); }, 2000);
                }
            });
        },

        videoFinal: function () {
            var _self = this;
            var element = _self.element;

            //remove all children except final
            $(element).addClass('done');
            $(element).children().not('.final').hide();

            //create tools element
            var tools = $('<div class="tools final">');

            //delete option after crop
            $(tools).append($(_self.button.del).click(function () {
                _self.reset();
            }));

            //append tools to element
            $(element).append(tools);
            $(element).unbind();

            //custom function after process image;
            if (_self.options.onAfterProcessVideo) _self.options.onAfterProcessVideo.call(_self, _self);
        },

        responseReset: function () {
            var _self = this;
            var element = _self.element;

            //remove responds from ajax event
            $(element).find('.alert').remove();

        },

        reset: function () {
            var _self = this;
            var element = _self.element;
            var input = _self.input;

            $(element).removeClass('loading done').children().show().not('input[type=file]').remove();
            $(input).val('');
            _self._bind();

            $(element).data('video', null);

            if (_self.options.onAfterCancel) _self.options.onAfterCancel.call(_self);
        }
    }

    $.fn.html5videoupload = function (options) {
        if ($.data(this, "html5videoupload")) return;
        return $(this).each(function () {
            $.data(this, "html5videoupload", new $.html5videoupload(options, this));
        });
    }

    function empty(arg) {
        var undef, key, i, len;
        var emptyValues = [undef, null, false, 0, '', '0'];

        for (i = 0, len = emptyValues.length; i < len; i++) {
            if (arg === emptyValues[i]) {
                return true;
            }
        }

        if (typeof mixed_var === 'object') {
            for (key in arg) {
                return false;
            }
            return true;
        }
        return false;
    }

})(window, jQuery);