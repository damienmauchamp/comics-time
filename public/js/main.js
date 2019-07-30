
// /read
$(document).on('click', '.comics:not(.complete) .to-read-icon', function() {
	var comics = $(this).closest('.comics');
	var params = {
		comics: comics.data('comics'),
		issue: comics.data('issue'),
		date: new Date()
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
                return false;
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
options = {
    ...options,
    search: {
        limit: 20
    }
}
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
    dropdownParent: $('#test'),
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
                        '<div class="search--name">' + item.name + ' (' + item.start_year + ')</div>' +
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
            template('comic', res.data[0], '.to-read-list', 'before');
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