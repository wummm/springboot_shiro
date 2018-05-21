/**
 * Created by uubee
 * on 2018/1/25.
 */
+function ($) { "use strict";

    var isIE = window.navigator.appName == 'Microsoft Internet Explorer';
    //图片校验
    function limitJpg(fileId, imgId, urlId) {
        var max_size = 800;// 800k
        var tmpFile = document.getElementById(fileId);
        if (tmpFile.value == '' || tmpFile.value == null) {
            alert("请上传图片");
            return false;
        }
        if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(tmpFile.value)) {
            alert("图片类型必须是[.gif,jpeg,jpg,png]中的一种");
            tmpFile.value = "";
            return false;
        } else {
            var fileData = tmpFile.files[0];
            var size = fileData.size;
            if (size > max_size * 1024) {
                alert("图片大小不能超过800k");
                tmpFile.value = "";
                return false
            }
            return true
        }
        return true
    }
    var Fileinput = function (element, options) {
        this.$element = $(element);

        this.$input = this.$element.find(':file');
        if (this.$input.length === 0) return;

        this.name = this.$input.attr('name') || options.name;

        this.$hidden = this.$element.find('input[type=hidden][name="' + this.name + '"]');
        if (this.$hidden.length === 0) {
            this.$hidden = $('<input type="hidden">').insertBefore(this.$input)
        }

        this.$preview = this.$element.find('.fileinput-preview');
        var height = this.$preview.css('height');
        if (this.$preview.css('display') !== 'inline' && height !== '0px' && height !== 'none') {
            this.$preview.css('line-height', height)
        }

        this.original = {
            exists: this.$element.hasClass('fileinput-exists'),
            preview: this.$preview.html(),
            hiddenVal: this.$hidden.val()
        };

        this.listen()
    };

    Fileinput.prototype.listen = function() {
        this.$input.on('change.bs.fileinput', $.proxy(this.change, this));
        $(this.$input[0].form).on('reset.bs.fileinput', $.proxy(this.reset, this));

        this.$element.find('[data-trigger="fileinput"]').on('click.bs.fileinput', $.proxy(this.trigger, this));
        this.$element.find('[data-dismiss="fileinput"]').on('click.bs.fileinput', $.proxy(this.clear, this))
    };

    Fileinput.prototype.change = function(e) {
        var files = e.target.files === undefined ? (e.target && e.target.value ? [{ name: e.target.value.replace(/^.+\\/, '')}] : []) : e.target.files;

        e.stopPropagation();

        if (files.length === 0) {
            this.clear();
            return
        }

        this.$hidden.val('');
        this.$hidden.attr('name', '');
        this.$input.attr('name', this.name);

        var file = files[0];

        if (this.$preview.length > 0 && (typeof file.type !== "undefined" ? file.type.match(/^image\/(gif|png|jpeg)$/) : file.name.match(/\.(gif|png|jpe?g)$/i)) && typeof FileReader !== "undefined") {
            var reader = new FileReader();
            var preview = this.$preview;
            var element = this.$element;
            var flag = limitJpg('picID')
            reader.onload = function(re) {
                var image = new Image();
                image.src=re.target.result;
                if(!flag){
                    return
                }
                image.onload=function(){
                    var width = image.width;
                    var height = image.height;
                    /*if(width!=140&&height!=140){
                     alert("宽高必须140x140")
                     $('#picID').val("");
                     $("#exampleInputUpload img").attr("src","");
                     return false
                     }*/
                }
                var $img = $('<img>');
                $img[0].src = re.target.result;
                files[0].result = re.target.result;

                element.find('.fileinput-filename').text(file.name);

                // if parent has max-height, using `(max-)height: 100%` on child doesn't take padding and border into account
                if (preview.css('max-height') != 'none') $img.css('max-height', parseInt(preview.css('max-height'), 10) - parseInt(preview.css('padding-top'), 10) - parseInt(preview.css('padding-bottom'), 10)  - parseInt(preview.css('border-top'), 10) - parseInt(preview.css('border-bottom'), 10));

                preview.html($img);
                element.addClass('fileinput-exists').removeClass('fileinput-new');

                element.trigger('change.bs.fileinput', files)
            };

            reader.readAsDataURL(file)
        } else {
            this.$element.find('.fileinput-filename').text(file.name);
            this.$preview.text(file.name);

            this.$element.addClass('fileinput-exists').removeClass('fileinput-new');

            this.$element.trigger('change.bs.fileinput')
        }
    };

    Fileinput.prototype.clear = function(e) {
        if (e) e.preventDefault();

        this.$hidden.val('');
        this.$hidden.attr('name', this.name);
        this.$input.attr('name', '');

        //ie8+ doesn't support changing the value of input with type=file so clone instead
        if (isIE) {
            var inputClone = this.$input.clone(true);
            this.$input.after(inputClone);
            this.$input.remove();
            this.$input = inputClone;
        } else {
            this.$input.val('')
        }

        this.$preview.html('');
        this.$element.find('.fileinput-filename').text('');
        this.$element.addClass('fileinput-new').removeClass('fileinput-exists');

        if (e !== undefined) {
            this.$input.trigger('change');
            this.$element.trigger('clear.bs.fileinput')
        }
    };

    Fileinput.prototype.reset = function() {
        this.clear();

        this.$hidden.val(this.original.hiddenVal);
        this.$preview.html(this.original.preview);
        this.$element.find('.fileinput-filename').text('');

        if (this.original.exists) this.$element.addClass('fileinput-exists').removeClass('fileinput-new');
        else this.$element.addClass('fileinput-new').removeClass('fileinput-exists');

        this.$element.trigger('reset.bs.fileinput')
    };

    Fileinput.prototype.trigger = function(e) {
        this.$input.trigger('click');
        e.preventDefault()
    };

    var old = $.fn.fileinput;

    $.fn.fileinput = function (options) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bs.fileinput');
            if (!data) $this.data('bs.fileinput', (data = new Fileinput(this, options)));
            if (typeof options == 'string') data[options]()
        })
    };

    $.fn.fileinput.Constructor = Fileinput;

    $.fn.fileinput.noConflict = function () {
        $.fn.fileinput = old;
        return this
    };

    $(document).on('click.fileinput.data-api', '[data-provides="fileinput"]', function (e) {
        var $this = $(this);
        if ($this.data('bs.fileinput')) return;
        $this.fileinput($this.data());

        var $target = $(e.target).closest('[data-dismiss="fileinput"],[data-trigger="fileinput"]');
        if ($target.length > 0) {
            e.preventDefault();
            $target.trigger('click.bs.fileinput');
        }
    });
}(window.jQuery);
