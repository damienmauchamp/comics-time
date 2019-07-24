
// /read
$('.to-read-icon').on('click', function() {
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
        success(response) {

        	var item = $('#comics-item-' + response.comics);

        	// item attributes
        	item.data({
                comics: response.comics,
                issue: response.issue,
            });

        	// img
        	item.find('img#img-' + response.comics).attr('src', response.img);

        	// #
        	item.find('.issue-number').text(response.issue_number);

            item.find('.remainging-issues').text(response.issues_left)
        	if (response.issues_left) {
        		item.find('.nb-remainging-issues').show();
        	} else {
        		item.find('.nb-remainging-issues').hide();
        	}

        	// progress bar
        	item.find('.progress-bar').css('width', response.progress + '%');

        	// new show/hide, date
        	if (response.new) {
        		item.addClass('new');
        	} else {
        		item.removeClass('new');
        	}

            //item.prependTo($('.to-read-list'));

            console.log(response);
        }
    });
	console.log('read', params);
});

// /search
var options = {
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
        success(response) {
            $('.to-read-list').prepend('<li>' + JSON.stringify(response.content) + '</li>');
            console.log(response);
        }
    })
});