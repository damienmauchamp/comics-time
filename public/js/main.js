
// /read
$(document).on('click', '.comics:not(.complete) .to-read-icon', function(e) {
    e.preventDefault();
	var comics = $(this).closest('.comics');
    var section = comics.closest('.to-read').attr('id');
	var params = {
		comics: comics.data('comics'),
		issue: comics.data('issue'),
		date: new Date()
	}
    if (typeof read === "function") {
        read(params);
    }
	$.ajax({
		url: '/read',
        dataType: 'json',
        method: 'post',
        data: params,
        success(res) {
            // item
            var item = $('#comics-item-' + res.comics);

            // img
            item.find('img#img-' + res.comics).attr('src', res.img);

            // progress bar
            item.find('.progress-bar').css('width', res.progress + '%');

        	// #
        	item.find('.issue-number').text(res.issue_number ? ('#' + res.issue_number) : '');

            // remaining issue(s)
            item.find('.remainging-issues').text(res.issues_left)

        	if (res.issues_left && !res.complete) {
        		item.find('.nb-remainging-issues').show();
        	} else {
        		item.find('.nb-remainging-issues').hide();
        	}

            // new show/hide, date
            if (res.new && !res.complete) {
                item.addClass('new');
            } else {
                item.removeClass('new');
            }

            if (res.complete) {
                //item.remove();
                item.find('.to-read-icon').css('visibility', 'hidden');
                item.addClass('complete');
                item.removeData('issue');

                // console.log("moving to", section);

                var increase_count = $('.to-read#done .nb-items');
                var decrease_count = $('.to-read#'+section+' .nb-items');
                increase_count.text(parseInt(increase_count.text()) + 1);
                decrease_count.text(parseInt(decrease_count.text()) - 1);
                moveElement(item, '.to-read#done ul.to-read-list');
                return false;
            } else if (section === "not-started") {
                // console.log("moving to", section);

                var increase_count = $('.to-read#to-read .nb-items');
                var decrease_count = $('.to-read#'+section+' .nb-items');
                increase_count.text(parseInt(increase_count.text()) + 1);
                decrease_count.text(parseInt(decrease_count.text()) - 1);
                moveElement(item, '.to-read#to-read ul.to-read-list');
            } else {
                // console.log("not moving");
            }

            // item attributes
            item.data({
                comics: res.comics,
                issue: res.issue,
            });
        }
    });
});

// /search
$('#search').select2({
    ajax: {
        url: '/search',
        dataType: 'json',
        method: 'get',
        delay: 1000,
        data: function (params) {
            return {
                q: params.term,
                page: params.page,
                limit: options.search.limit
            };
        },
        processResults: function (data, params) {
            params.page = params.page || 1;
            return {
                results: data.results,
                pagination: {
                    more: (params.page * options.search.limit) < data.total_count
                }
            };
        },
        cache: true
    },
    allowClear: true,
    containerCssClass: 'searchbox',
    //dropdownCssClass: 'aaaa',
    //dropdownParent: $('#test'),
    placeholder: 'Search for comics',
    escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
    minimumInputLength: 1,
    templateResult: function (item) {
        if(item.loading) {
            return 'Searching...';
        }
        return  '<div class="search-item">' +
                    '<div class="search-column search--image">' +
                        '<img src="' + item.image + '" />' +
                    '</div>' +
                    '<div class="search-column search--info">' +
                        '<div class="search--name">' + item.name + ' (' + item.start_year + ') ' + (item.added ? '✓' : '') + '</div>' +
                        '<div class="search--issues">' + item.count_of_issues + ' issue(s)</div>' +
                        '<div class="search--publisher">' + item.publisher + '</div>' +
                    '</div>' +
                '</div>';
        return item.name + ' (' + item.start_year + ') - ' + item.count_of_issues + ' issue(s)' + (item.publisher ? ', by ' + item.publisher : '');
    },
    minimumResultsForSearch: 1,
    width: '100%',
    /*templateSelection: function (data, container) {
        console.log('templateSelection', data.id);
        return data.name;
    }*/
    //templateSelection: formatRepoSelection
})
.on("select2:select", function(e, i) { 
    console.log('ajout', $(this).val());
    $.ajax({
        url: '/comics/' + $(this).val(),
        dataType: 'json',
        method: 'post',
        success(res) {
            template('comic', res.data[0], '.to-read#not-started > ul.to-read-list', 'before');
            var increase_count = $('.to-read#not-started .nb-items');
            increase_count.text(parseInt(increase_count.text()) + 1);
        }
    })
});

// update
$('#update').on('click', function() {
    //
    $(this).text('updating...').prop('disabled', true);
    $.ajax({
        url: '/update',
        dataType: 'json',
        method: 'get',
        success(response) {
            if(!response) {
                return false;
            }

            var n_comics = response.length;
            var updates = [];
            response.forEach(function(v) {
                var update_request = $.ajax({
                    url: '/comics/' + v + '/issues',
                    dataType: 'json',
                    method: 'put',
                    success(response) {
                        console.log(response);
                    }
                })
                updates.push(update_request);
            });

            $.when.apply(null, updates).done(function(){
                $('#update').text('updated').prop('disabled', false);
                console.log('Comics updated');
            });

            //
        }
    });
});

function template(name, data, element, before_after = 'before') {
    // Grab the template
    $.get('template/' + name + '.ejs', function (template) {
        var func = ejs.compile(template);
        var html = func(data);
        if (before_after === 'before') {
            $(element).prepend(html);
        } else if (before_after === 'after') {
            $(element).append(html);
        } else {
            return false;
        }
    });
}

function moveElement(element, newParent, duration = 0, direction = 'top') {
    var tempParent = newParent;
    //Allow passing in either a jQuery object or selector
    element = $(element);
    newParent= $(newParent);

    console.log("moving", {
        element: element,
        to: newParent
    });

    var oldOffset = element.offset();
    if (['top', 'haut', 'début'].includes(direction)) {
        element.prependTo(newParent);
    } else if (['bottom', 'bas', 'fin'].includes(direction)) {
        element.appendTo(newParent);
    }
    var newOffset = element.offset();

    var temp = element.clone().appendTo(tempParent); // body
    temp.css({
        'position': 'absolute',
        'left': oldOffset.left,
        'top': oldOffset.top,
        'z-index': 1000
    });
    element.hide();

    temp.animate({'top': newOffset.top, 'left': newOffset.left}, duration, function(){
       element.show();
       temp.remove();
    });
}

// calendar
// infinite scroll setup
$(window).on('scroll', function() {
    if (options.page !== 'calendar') {
        return false;
    }
    var scroll = {
        top: $(window).scrollTop() === 0,
        pos: $(this).scrollTop(),
        bottom: ($(window).scrollTop() + $(window).height()) == $(document).height()
    };
    console.log(scroll);

    var direction = 0,
        date = null;

    if (scroll.top) {
        direction = -1, date = options.calendar.min.date, more = options.calendar.min.more;
        console.log(options.calendar.min, "prependTo");
    } else if (scroll.bottom) {
        direction = 1, date = options.calendar.max.date, more = options.calendar.max.more;
        console.log(options.calendar.max, "appendTo");
    } else {
        return false;
    }

    if(!more) {
        return false;
    }

    $.ajax({
        url: '/calendar/data',
        dataType: 'json',
        method: 'post',
        data: {
            direction: direction,
            date: date,
            more: more
        },
        success(res) {
            console.log(res);
            if (res.calendar) {
                Object.entries(res.calendar).forEach(([date, items]) => {
                    console.log(date, items);
                    //{options: options, date: new Date(date), items: items}
                    template('calendar', {options: options, date: new Date(date), items: items}, '.calendar-wrapper', direction > 0 ? 'after' : 'before');
                });
                console.log('yes');
            } else {
                console.log('non');
            }
            //{calendar: by_day, options: options}
            //template('comic', res.data[0], '.to-read-list', 'before');
        }
    })

    //options.calendar.max
});

