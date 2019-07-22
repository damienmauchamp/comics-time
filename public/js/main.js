
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

        	if (response.issues_left > 0) {
        		item.find('.remainging-issues').text(response.issues_left).show();
        	} else {
        		item.find('.remainging-issues').text(response.issues_left).hide();
        	}

        	// progress bar
        	item.find('.progress-bar').css('width', response.progress + '%');

        	// new show/hide, date
        	if (response.new) {
        		item.addClass('new');
        	} else {
        		item.removeClass('new');
        	}

            console.log(response);
        }
    });
	console.log('read', params);
});

// /search

$('#search').select2({
    ajax: {
        url: '/search',
        dataType: 'json',
        method: 'get',
        delay: 250,
        data: function (params) {
            return {
                q: params.term, // search term
                page: params.page
            };
        },
        processResults: function (data, params) {
            // parse the results into the format expected by Select2
            // since we are using custom formatting functions we do not need to
            // alter the remote JSON data, except to indicate that infinite
            // scrolling can be used
            params.page = params.page || 1;

            console.log('processResults', data, params, {
                results: data.results,
                pagination: {
                    more: (params.page * 30) < data.total_count
                }
            });

            return {
                results: data.results,
                pagination: {
                    more: (params.page * 30) < data.total_count
                }
            };
        },
        cache: true
    },
    placeholder: 'Search for comics',
    escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
    minimumInputLength: 1,
    templateResult: function (item) {
        var markup = "<div class='select2-result-repository clearfix'>" +
        "<div class='select2-result-repository__avatar'><img src='" + item.image + "' /></div>" +
        "<div class='select2-result-repository__meta'>" +
          "<div class='select2-result-repository__title'>" + item.name + "</div>";

        markup += "<div class='select2-result-repository__statistics'>" +
        "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i>(" + item.start_year + ")</div>" +
        "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + item.publisher + "</div>" +
        "<div class='select2-result-repository__sstargazers'><i class='fa fa-star'></i> " + item.count_of_issues + " issues</div>" +
        "</div>" +
        "</div></div>";

        return markup;
    },
    width: '100%'
    //templateSelection: formatRepoSelection
});