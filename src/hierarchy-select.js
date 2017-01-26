(function($){
    'use strict';

    var HierarchySelect = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.hierarchySelect.defaults, options);
        this.$button = this.$element.children('button');
        this.$selectedLabel = this.$button.children('.selected-label');
        this.$menu = this.$element.children('.dropdown-menu');
        this.$menuInner = this.$menu.children('.inner');
        this.$searchbox = this.$menu.find('input');
        this.$hiddenField = this.$element.children('input');
        this.init();
    };

    HierarchySelect.prototype = {
        constructor: HierarchySelect,
        init: function() {
            this.setWidth();
            this.setHeight();
            this.initSelect();
            this.clickListener();
            this.searchListener();
        },
        initSelect: function() {
            var item = this.$menuInner.find('li.active:first a');
            if (item.length) {
                var value = item.parent().data('value');
                this.$selectedLabel.html(item.html());
                this.$hiddenField.val(value);
            }
        },
        setWidth: function() {
            if (this.options.width === 'auto') {
                var width = this.$menu.width();
                this.$element.css('min-width', width + 2 + 'px');
            } else if (this.options.width) {
                this.$element.css('width', this.options.width);
            } else {
                this.$element.css('min-width', '42px');
            }
        },
        setHeight: function() {
            if (this.options.height) {
                this.$menu.css('overflow', 'hidden');
                this.$menuInner.css({
                    'max-height': this.options.height,
                    'overflow-y': 'auto'
                });
            }
        },
        getText: function() {
            return this.$selectedLabel.text();
        },
        getValue: function() {
            return this.$hiddenField.val();
        },
        setValue: function(value) {
            var li = this.$menuInner.children('li[data-value="' + value + '"]:first');
            this.setSelected(li);
        },
        enable: function() {
            this.$button.removeAttr('disabled');
        },
        disable: function() {
            this.$button.attr('disabled', 'disabled');
        },
        setSelected: function(li) {
            if (li.length) {
                var text = li.children('a').text();
                var value = li.data('value');
                this.$selectedLabel.html(text);
                this.$hiddenField.val(value);
                this.$menuInner.find('.active').removeClass('active');
                li.addClass('active');
                this.$element.trigger('change');
            }
        },
        clickListener: function() {
            var that = this;
            this.$element.on('show.bs.dropdown', function() {
                var $this = $(this);
                var scrollTop = $(window).scrollTop();
                var windowHeight = $(window).height();
                var upperHeight = $this.offset().top - scrollTop;
                var elementHeight = $this.outerHeight();
                var lowerHeight = windowHeight - upperHeight - elementHeight;
                var dropdownHeight = that.$menu.outerHeight(true);
                if (lowerHeight < dropdownHeight && upperHeight > dropdownHeight) {
                    $this.toggleClass('dropup', true);
                }
            });
            this.$element.on('shown.bs.dropdown', function() {
                that.$searchbox.focus();
            });
            this.$element.on('hidden.bs.dropdown', function() {
                that.$element.toggleClass('dropup', false);
            });
            this.$menuInner.on('click', 'li a', function (e) {
                e.preventDefault();
                var $this = $(this);
                var li = $this.parent();
                if (li.hasClass('disabled')) {
                    e.stopPropagation();
                } else {
                    that.setSelected(li);
                }
            });
        },
        searchListener: function() {
            var that = this;
            if (!this.options.search) {
                this.$searchbox.parent().toggleClass('hidden', true);
                return;
            }
            function disableParents(element) {
                var item = element;
                var level = item.data('level');
                while (typeof item == 'object' && item.length > 0 && level > 1) {
                    level--;
                    item = item.prevAll('li[data-level="' + level + '"]:first');
                    if (item.hasClass('hidden')) {
                        item.toggleClass('disabled', true);
                        item.removeClass('hidden');
                    }
                }
            }
            this.$searchbox.on('keydown', function (e) {
                switch (e.keyCode) {
                    case 9: // Tab
                        e.preventDefault();
                        e.stopPropagation();
                        that.$menuInner.click();
                        that.$button.focus();
                        break;
                    default:
                        break;
                }
            });
            this.$searchbox.on('input propertychange', function (e) {
                e.preventDefault();
                var searchString = that.$searchbox.val().toLowerCase();
                var items = that.$menuInner.find('li');
                if (searchString.length === 0) {
                    items.each(function() {
                        var item = $(this);
                        item.toggleClass('disabled', false);
                        item.toggleClass('hidden', false);
                    });
                } else {
                    items.each(function() {
                        var item = $(this);
                        var text = item.children('a').text().toLowerCase();
                        if (text.indexOf(searchString) != -1) {
                            item.toggleClass('disabled', false);
                            item.toggleClass('hidden', false);
                            if (that.options.hierarchy) {
                                disableParents(item);
                            }
                        } else {
                            item.toggleClass('disabled', false);
                            item.toggleClass('hidden', true);
                        }
                    });
                }
            });
        }
    };

    var Plugin = function(option) {
        var args = Array.prototype.slice.call(arguments, 1);
        var method;
        var chain = this.each(function() {
            var $this   = $(this);
            var data    = $this.data('HierarchySelect');
            var options = typeof option == 'object'  && option;
            if (!data) {
                $this.data('HierarchySelect', (data = new HierarchySelect(this, options)));
            }
            if (typeof option == 'string') {
                method = data[option].apply(data, args);
            }
        });

        return (method === undefined) ? chain : method;
    };

    var old = $.fn.hierarchySelect;

    $.fn.hierarchySelect = Plugin;
    $.fn.hierarchySelect.defaults = {
        width: 'auto',
        height: '208px',
        hierarchy: false,
        search: false
    };
    $.fn.hierarchySelect.Constructor = HierarchySelect;

    $.fn.hierarchySelect.noConflict = function () {
        $.fn.hierarchySelect = old;
        return this;
    };
})(jQuery);
