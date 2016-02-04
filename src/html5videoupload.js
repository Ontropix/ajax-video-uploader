(function (window, $) {
    "use strict";

    $.html5videoupload = function html5videoupload(options, element) {

        this.element = element;
        this.options = $.extend(true, {}, $.html5videoupload.defaults, options, $(this.element).data());
        this.input = $(this.element).find('input[type=file]');

        var self = this;

        //buttons
        this.button = {}
        this.button.edit = '<div class="btn btn-info btn-edit" title="' + (this.options.editTitle || 'Edit') + '"><i class="glyphicon glyphicon-pencil"></i></div>';
        this.button.saving = '<div class="btn btn-warning saving">' + (this.options.saveLabel || 'Saving...') + ' <i class="glyphicon glyphicon-time"></i></div>';
        this.button.cancel = '<div class="btn btn-danger btn-cancel" title="' + (this.options.cancelTitle || 'Cancel') + '"><i class="glyphicon glyphicon-remove"></i></div>';
        this.button.done = '<div class="btn btn-success btn-ok" title="' + (this.options.okTitle || 'Ok') + '"><i class="glyphicon glyphicon-ok"></i></div>';
        this.button.del = '<div class="btn btn-danger btn-del" title="' + (this.options.delTitle || 'Delete') + '"><i class="glyphicon glyphicon-trash"></i></div>';

        self._init();

    };

    $.html5videoupload.defaults = {

        //url to upload service
        url: null,

        //video path
        video: null,

        onAfterProcessVideo: null,
        onAfterCancel: null,

        maxSize: 8388608 //8 MB
    };

    $.html5videoupload.prototype = {
        _init: function () {

            var self = this;
            var element = self.element;
            var options = self.options;

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

            self._bind();

            if (!empty(options.video)) {

                $(element)
                    .data('video', options.video)
                    .append($('<div class="final" style="background: black"><video controls style="height: 200px; width: 300px"></video></div>'));

                $(element).find('video').attr('src', options.video);
				
                var tools			= $('<div class="preview tools"></div>');
                var del				= $('' + this.button.del + '');

                $(del).unbind('click').click(function(e) {
                    e.preventDefault();
                    self.reset();
                });
								
                $(tools).append(del);
				
				$(element).append(tools);
            }

            return true;
        },

        _bind: function () {
            var self = this;
            var element = self.element;
            var input = self.input;

            //bind the events
            $(element).unbind('drop').on({
                drop: function (event) {
                    self.handleFile(event, $(this));
                },
                dragover: function (event) {
                    self.handleDrag(event);
                },
            });

            $(input).unbind('change').change(function (event) {
                self.drag = false;
                self.handleFile(event, $(element));
            });
        },

        handleDrag: function (event) {
            var self = this;
            self.drag = true;
            event.stopPropagation();
            event.preventDefault();
            event.originalEvent.dataTransfer.dropEffect = 'copy';
        },

        handleFile: function (event, element) {
            event.stopPropagation();
            event.preventDefault();

            var self = this;
            var files = (self.drag == false) ? event.originalEvent.target.files : event.originalEvent.dataTransfer.files; // FileList object.

            $(element).removeClass('notAnVideo').removeClass('maxSizeExceeded').addClass('loading');

            for (var i = 0, f; f = files[i]; i++) {

                if (!f.type.match('video/mp4')) {
                    $(element).addClass('notAnVideo');
                    continue;
                }

                if (f.size > self.options.maxSize) {
                    $(element).addClass('maxSizeExceeded');
                    continue;
                }

                var src = URL.createObjectURL(f);

                //place the images
                $(element).append($('<div class="final" style="background: black"><video controls style="height: 200px; width: 300px"></video></div>'));
                $(element).find('video').attr('src', src);

                self._tools();

                //clean up
                $(element).removeClass('loading');
            }
        },

        _tools: function () {
            var self = this;
            var element = self.element;
            var tools = $('<div class="tools"></div>');

            //cancel button (removes the image and resets it to the original init event
            $(tools).append($(self.button.cancel).on({
                'touchstart touchend click': function (e) {
                    e.preventDefault();
                    self.reset();
                }
            }));

            $(tools).append($(self.button.done).on({
                'touchstart click': function (e) {
                    e.preventDefault();
                    self.videoSave();
                }
            }));

            $(element).append($(tools));
        },

        videoSave: function () {
            var self = this;
            var element = self.element;
            var options = self.options;

            $(element).find('.tools').children().toggle();
            $(element).find('.tools').append($(self.button.saving));

            var formdata = new FormData();
            formdata.append("Video", self.input[0].files[0]);

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

                        self.videoFinal();

                    } else {
                        $(element).find('.tools .saving').remove();
                        $(element).find('.tools').children().toggle();
                        $(element).append($('<div class="alert alert-danger">' + response.error + '</div>').css({ bottom: '10px', left: '10px', right: '10px', position: 'absolute', zIndex: 99 }));
                        setTimeout(function () { self.responseReset(); }, 2000);
                    }
                },
                error: function (response, status) {
                    $(element).find('.tools .saving').remove();
                    $(element).find('.tools').children().toggle();
                    $(element).append($('<div class="alert alert-danger"><strong>' + response.status + '</strong> ' + response.statusText + '</div>').css({ bottom: '10px', left: '10px', right: '10px', position: 'absolute', zIndex: 99 }));
                    setTimeout(function () { self.responseReset(); }, 2000);
                }
            });
        },

        videoFinal: function () {
            var self = this;
            var element = self.element;

            //remove all children except final
            $(element).addClass('done');
            $(element).children().not('.final').hide();

            //create tools element
            var tools = $('<div class="tools final">');

            //delete option after crop
            $(tools).append($(self.button.del).click(function () {
                self.reset();
            }));

            //append tools to element
            $(element).append(tools);
            $(element).unbind();

            //custom function after process image;
            if (self.options.onAfterProcessVideo) self.options.onAfterProcessVideo.call(self, self);
        },

        responseReset: function () {
            var self = this;
            var element = self.element;

            //remove responds from ajax event
            $(element).find('.alert').remove();

        },

        reset: function () {
            var self = this;
            var element = self.element;
            var input = self.input;

            $(element).removeClass('loading done').children().show().not('input[type=file]').remove();
            $(input).val('');
            self._bind();

            $(element).data('video', null);

            if (self.options.onAfterCancel) self.options.onAfterCancel.call(self);
        }
    }

    function empty(arg) {
        var undef, key, i, len;
        var emptyValues = [undef, null, false, 0, '', '0'];

        for (i = 0, len = emptyValues.length; i < len; i++) {
            if (arg === emptyValues[i]) {
                return true;
            }
        }

        if (typeof arg === 'object') {
            for (key in arg) {
                return false;
            }
            return true;
        }
        return false;
    }


    $.fn.html5videoupload = function (options) {
        if ($.data(this, "html5videoupload")) return;
        return $(this).each(function () {
            $.data(this, "html5videoupload", new $.html5videoupload(options, this));
        });
    }

})(window, jQuery);