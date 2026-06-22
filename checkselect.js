/**
 * Check Select
 * TODO - Auto detect when the underlying select has changed it's values and update the check boxes
 * TODO - Max selections
 */
(function ($) {
    $.fn.checkselect = function (options) {

        var settings = $.extend({
            // These are the defaults.
            container: "<div></div>",
            containerClass: "checkselect",
            inputContainer: "<label></label>",
            inputContainerClass: "",
            inputClass: "",
            selectAll: false,
            selectAllText: 'Select All',
            selectMax: false,
            selectMaxMessage: 'Maximum options reached.',
            selectMaxMarkup: '',
            selectMaxMarkupPosition: 'after',
            selectMaxDelay: 1500,
            selectMaxFadeDuration: 400,
            selectMaxTipClass: 'cs-max-tip',
            inline: true,
            hideOriginal: true
        }, options);


        this.each(function () {
            var name = this.name.replace('[]', '');
            var id = this.id;
            var checkbox = $(this).prop('multiple');

            var $newElement = $(settings.container)
                .addClass(settings.containerClass)
                .attr('style', $(this).attr('style'))
            ;

            // Add the feature to select all
            if (settings.selectAll && checkbox)
            {
                var $selectAllLabel = $(settings.inputContainer)
                    .attr('for', id + '-select-all')
                    .addClass('check-select-all')
                    .addClass(settings.inputContainerClass)
                    .attr('title', settings.selectAllText);

                var $selectAllInput = $('<input>')
                    .attr('id', id + '-select-all' )
                    .attr('type', 'checkbox')
                    .attr('data-target', id)
                    .addClass(settings.inputClass)
                    .css('margin-right', '5px')
                    .on('click',function () {
                        var checked = this.checked;

                        $(this).closest('.' + settings.containerClass).find('input.checkbox').each(function (){
                            $(this).prop('checked', checked).trigger('change');
                        });
                    })
                ;

                $selectAllLabel.append($selectAllInput).append(settings.selectAllText).prependTo($newElement);

            }

            // Improve to support optgroup
            $('option', this).each(function () {
                var title = $(this).attr('title');
                var value = $(this).attr('value');
                var selected = $(this).attr('selected');
                var text = $(this).text();
                var display = $(this).html();
                if (typeof value === 'undefined') {
                    value = text;
                    this.value = text;
                }
                $(this).attr('data-checkselect-id', id + '-' + value);

                var $label = $(settings.inputContainer)
                    .attr('for', id + '-' + value)
                    .addClass('check')
                    .addClass(settings.inputContainerClass)
                    .attr('title', title);

                if (!settings.inline) {
                    $label.css('display', 'block').css('width', '100%');
                }

                var $input = $('<input>')
                    .attr('name', '_checkselect_' + name)
                    .addClass('checkselect' + name)
                    .addClass(settings.inputClass)
                    .attr('value', value)
                    .attr('id', id + '-' + value)
                    // .attr('name', name)
                    .attr('data-toggle', 'checkselect')
                    .attr('data-target', id)
                    .css('margin-right', '5px')
                ;
                if (selected) {
                    $input.prop('checked', true);
                }
                if (checkbox) {
                    $input.attr('type', 'checkbox').addClass('checkbox'); //.attr('name', name+'['+value+']');
                } else {
                    $input.attr('type', 'radio').addClass('radio');
                }

                // Handle Option Groups
                if ($(this).index() === 0 && $(this).parent().prop('nodeName') === 'OPTGROUP') {
                    var $optLabel = $('<label class="checkselect-optgroup-label">' +
                        $(this).parent().attr('label') +
                        '</label>');
                    if (!settings.inline) {
                        $optLabel.css('display', 'block').css('width', '100%');
                    }

                    $newElement.append($optLabel);
                }
                $label.append($input).append(display).appendTo($newElement);

                // for="73-Mon 29th July" class="check" id="checkselect" title="">Mon 29th July</label>')
                // 	<input type="checkbox" name="73[Mon 29th July]" value="Mon 29th July" class="radio pull-left" id="73-Mon 29th July" style="margin-right: 10px;">
            });

            $newElement.insertAfter($(this));

            // Store the plugin options on the container so the document-level
            // `change` handler (which runs outside this closure) can enforce selectMax.
            $newElement
                .data('checkselect-max', settings.selectMax || false)
                .data('checkselect-message', settings.selectMaxMessage)
                .data('checkselect-tip-class', settings.selectMaxTipClass)
                .data('checkselect-delay', settings.selectMaxDelay)
                .data('checkselect-duration', settings.selectMaxFadeDuration)
            ;

            // Optional "maximum reached" markup, inserted next to the rendered group
            // once it is fully built. Checkbox groups with a selectMax only.
            if (settings.selectMax && settings.selectMaxMarkup) {
                var $maxMarkup = $(settings.selectMaxMarkup);
                if (settings.selectMaxMarkupPosition === 'before') {
                    $newElement.before($maxMarkup);
                } else {
                    $newElement.after($maxMarkup);
                }
            }

            if (settings.hideOriginal) {
                $(this).hide();
            }
        });

    }
}(jQuery));

$(document).on('change', 'input[data-toggle="checkselect"]', function () {
    // selectMax enforcement — checkbox groups only. Runs before the normal sync
    // below, so an over-limit tick is reverted and never reaches the <select>.
    var target = $(this).attr('data-target');
    var $select = $('#' + target);

    if (this.type === 'checkbox' && this.checked) {

        var max = $select.data('checkselect-max');
        if (!max) {
            // fall back to the options value stored on the container
            max = $(this)
                .closest('.checkselect')
                .data('checkselect-max');
        }
        if (max) {
            var tipClass = $(this).closest('.checkselect').data('checkselect-tip-class') || 'cs-max-tip';
            $('.' + tipClass).remove(); // clear any existing tip before adding new one

            var checkedCount = $(
                'input.checkbox[data-target="' + $(this).attr('data-target') + '"]:checked'
            ).length;
            if (checkedCount > max) {
                $(this).prop('checked', false);
                var message  = $(this).closest('.checkselect').data('checkselect-message') || 'Maximum options reached.';
                var delay    = $(this).closest('.checkselect').data('checkselect-delay') || 1500;
                var duration = $(this).closest('.checkselect').data('checkselect-duration') || 400;
                var offset = $(this).offset();
                $('<div class="' + tipClass + '">' + message + '</div>')
                    .appendTo('body')
                    .css({
                        position: 'absolute',
                        zIndex: 9999,
                        top: offset.top + $(this).outerHeight() / 2,
                        left: offset.left + $(this).outerWidth() + 5
                    })
                    .delay(delay)
                    .fadeOut(duration, function () { $(this).remove(); });
                return false;
            }
        }
    }

    var $option = $select.find('option[value="' + $(this).attr('value') + '"]');
    if (this.checked) {
        $option.prop('selected', true);

    } else {
        $option.prop('selected', false);

        // $option.removeProp('selected');
    }
    $select.trigger('change');
});

