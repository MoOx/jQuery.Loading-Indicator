/*
 * loading indicator manager for jQuery
 *
 * Allow you to easily manipulate a loading indicator when you work with multiple ajax requests simultaneous
 * It simply use a semaphore
 *
 * @version 0.3
 * @author Maxime Thirouin @MoOx maxime.thirouin@gmail.com
 */

(function($)
{
    $.loadingIndicator = function(element, options)
    {
        // plugin's default options
        // this is private property and is  accessible only from inside the plugin
        var defaults = {
            semaphore: 0,
            element: null,
            addTo: document.body,
            append: true,
            show: function($element)
            {
                $element.show();
            },
            hide: function($element)
            {
                $element.hide();
            }
            // @todo add callback ?
            //beforeShow: function() {},
            //afterShow: function() {},
            //beforeHide: function() {},
            //afterHide: function() {},
        }

        // to avoid confusions, use "plugin" to reference the current instance of the object
        var plugin = this;

        plugin.settings = {};

        var $element = $(element),
             element = element;

        plugin.init = function()
        {
            plugin.settings = $.extend({}, defaults, options);

            if (!plugin.settings.semaphore) $element.hide();

            // add element to body on dom ready only
            $(function()
            {
                $(plugin.settings.addTo)[plugin.settings.append ? 'append' : 'prepend']($element);
            });

            return this;
        };

        plugin.start = function()
        {
            if (++plugin.settings.semaphore>0)
            {
                plugin.settings.show($element);
            }

            return this;
        };

        plugin.end = function()
        {
            if (--plugin.settings.semaphore<1)
            {
                plugin.settings.hide($element);
            }

            return this;
        }

        return plugin.init();
    }

    $.fn.loadingIndicator = function(options)
    {
        var plugin = new $.loadingIndicator(this, options);

        return this.data('loadingIndicator', plugin);
    }

    ////
    // unique global loader
    ////

    $.loadingIndicator.defaults = {
        // by default, we use generated html content OR an specified element
        html: '<div id="loadingIndicator" class="loadingIndicator" />',
        element: null,
        bindAjax: true
    };

    // $.loading is single element for the page
    $.loading = function(options)
    {
        // init plugin for body
        $.loadingIndicator.documentElement();

        // auto overwrite itself to prevent re test each time
        $.loading = function()
        {
            $.loadingIndicator.documentElement().data('loadingIndicator').start();
        };
        // recall real function
        $.loading();
    };

    $.loadingComplete = function()
    {
        $.loadingIndicator.documentElement().data('loadingIndicator').end();
    };

    // alias
    $.loadingEnd = $.loadingComplete;

    $.loadingIndicator.documentElement = function()
    {
        if (!document.body)
        {
            throw '$.loadingIndicator cannot be use before DOM Ready';
        }

        var $body = $(document.body), $element = $body.data('loadingIndicatorElement');
        if (!$element)
        {
            $element = $.loadingIndicator.defaults.element ? $.loadingIndicator.defaults.element : $($.loadingIndicator.defaults.html);
            $element.loadingIndicator();
            $body.data('loadingIndicatorElement', $element);
        }

        return $element;
    }

    // auto register ajax bind if option enabled (by default it is)
    $(function()
    {
        if ($.loadingIndicator.defaults.bindAjax)
        {
            $.loadingIndicator.documentElement()
                .bind("ajaxSend", $.loading)
                .bind("ajaxComplete", $.loadingEnd);
        }
    })

})(jQuery);