
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
        delay: 250,
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
            console.log(response);
        }
    })
});