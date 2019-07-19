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