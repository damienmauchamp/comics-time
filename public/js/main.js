
// /read
$(document).on('click', '.comics:not(.complete) .to-read-icon, .comics-issue .fa-read-status', function(e) {
	e.preventDefault();
	if ($(this).hasClass('disabled')) {
		return;
	}
	var already_read = false;

	//
	var classes = {
		comics: options.page === "comics" ? ".comics-issue" : ".comics"
	};
	if (options.page === "comics") {
		already_read = $(this).hasClass('fa-read');
		$(this).addClass('fa-spin').addClass('fa-circle-notch').addClass('loading');
		$(this).removeClass('fa-check-circle');
	} else {

		$(this).addClass('fa-spin').addClass('fa-circle-notch').addClass('loading');
		$(this).removeClass('fa-check-circle');
		//fa fa-check-circle to-read-icon
		//console.log($(this));
	}

	//
	var comics = $(this).closest(classes.comics);
	var section = comics.closest('.to-read').attr('id');
	var params = {
		page: options.page,
		comics: comics.data('comics'),
		issue: comics.data('issue'),
		date: new Date(),
		action: already_read ? 'unread' : 'read'
	}

	//var img_element = $('#comics-item-' + comics.data('comics') + 'img#img-' + comics.data('comics'));
	//img_element.closest('.image-crop').addClass('img-loading');
	var img_element = $('#comics-item-' + comics.data('comics') + ' .image-crop');
	img_element.addClass('img-loading');
	var comics_loader = '<div class="loader-container"><i class="fa fa-spin fa-circle-notch fa-icon-loading" aria-hidden="true"></i></div>';
	img_element.prepend(comics_loader);
	//console.log('adding loading to img', img_element);

	$.ajax({
		url: '/read',
		dataType: 'json',
		method: 'post',
		data: params,
		success(response) {

			// response.error
			// response.message
			var res = response.data;

			// HOMEPAGE
			if (options.page === "homepage") {

				// item
				var item = $('#comics-item-' + res.comics);

				// img
				// displaying a spinning loader while the image is loading
				//item.find('img#img-' + res.comics).attr('src', res.img);
				var img_element = item.find('img#img-' + res.comics);
				/*var img = new Image();
				img.onload = function() { 
					img_element.attr('src', res.img);
					//img_element.closest('.image-crop').removeClass('img-loading');
					setTimeout(function() {
						item.find('.image-crop').removeClass('img-loading');
					}, 500);
				}
				img.src = res.img;*/
				$(img_element).one("load", function() {
					$(this).closest('.image-crop').removeClass('img-loading');
					$(this).find('.loader-container').remove();
				
					$(item).find('.read-btn .to-read-icon').addClass('fa-check-circle');
					$(item).find('.read-btn .to-read-icon').removeClass('fa-spin').removeClass('fa-circle-notch').removeClass('loading');
				}).attr("src", res.img);

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
				
				// $(item).find('.read-btn .to-read-icon').addClass('fa-check-circle');
				// $(item).find('.read-btn .to-read-icon').removeClass('fa-spin').removeClass('fa-circle-notch').removeClass('loading');

				// item attributes
				item.data({
					comics: res.comics,
					issue: res.issue,
				});
			}

			// COMICS
			else if (options.page === "comics") {
				if (!response.error) {
					var element = $('#comics-item-'+params.comics+'-'+params.issue).find('.fa-read-status');
					if (already_read) {
						$(element).removeClass('fa-read');
					} else {
						$(element).addClass('fa-read');
					}
					$(element).addClass('fa-check-circle');
					$(element).removeClass('fa-spin').removeClass('fa-circle-notch').removeClass('loading');
				}
			}
			
			if (typeof read === "function") {
				read(params);
			}
		}
	});
});

$(document).on('click', '.toggle-comics', function(e) {
	//
	var comics = $(this).closest('.comics-issue');
	var params = {
		comics: comics.data('comics'),
		active: $(this).prop('checked')
	}

	$.ajax({
		url: '/active',
		dataType: 'json',
		method: 'post',
		data: params,
		success(response) {
			// error
			if (params.active !== response.active) {
				$(this).prop('checked', response.active);
				console.error('Error.');
			}

			if ($('span.nb-items#list-nb-items').length) {
				$('span.nb-items#list-nb-items').text($('.toggle-comics:checked').length);
			}
			
			if (typeof disable === "function") {
				disable(params);
			}
		}
	})
});

// update volume
$(document).on('click', '.fa-refresh-comics', function(e) {
	e.preventDefault();
	$(this)
		.prop('disabled', true)
		.addClass('disabled')
		.addClass('fa-spin');

	var id = $(this).closest('.comics-issue').data('comics');
	$.ajax({
		url: '/comics/' + id + '/issues',
		dataType: 'json',
		method: 'put',
		success(response) {
			console.log('updated', response);
			
			if (typeof sync === "function") {
				sync(params);
			}

			window.location.reload();
		}
	})
});

// mobile nav bar
$('.page-left .extend-left-link').on('click touch', e => {
	$('.page-left.page-sidebar').toggleClass('extended');
})

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
	closeOnSelect: true,
	//multiple: true,
	containerCssClass: 'searchbox',
	containment: 'parent',
	dropdownCssClass: 'searchbox-dropdown',
	//dropdownParent: $('#test'),
	placeholder: 'Search for comics',
	escapeMarkup: function (markup) { return markup; }, // we do not want to escape markup since we are displaying html in results
	minimumInputLength: 1,
	templateResult: function (item) {
		if(item.loading) {
			return 'Searching...';
		}
		return  '<div class="search-item">' +
					'<div class="search-column search--image">' +
						'<img loading="lazy" src="' + item.image + '" />' +
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

			// reset
			$('#search').val('').trigger('change');
		},
		error(res) {
			// reset
			$('#search').val('').trigger('change');
		}
	})
})
.on('select2:opening select2:open select2:closing select2:close select2:select', function(e) {
	if (e.type === 'select2:opening') {
		$('body').addClass('searching');
	} else if (['select2:closing', 'select2:select'].includes(e.type)) {
		$('body').removeClass('searching');
	}
	//console.log(e.type);
});

//$('li.select2-results__option[data-select2-id]').length
/*.off('select2:opening select2:open select2:closing select2:close').on('select2:opening select2:open select2:closing select2:close', function(e) {
	if (e.type === 'select2:open') {
		//var top = $(".select2.select2-container.select2-container--default.select2-container--below").offset().top;
		var top = $(".select2-container.select2-container--default.select2-container--open").css('top')-8;
		$('.select2-container.select2-container--default.select2-container--open').css('top', top);
	} else if (e.type === 'select2:closing') {
		$('.select2-container.select2-container--default.select2-container--open').css('top', '');
	}
});*/

// history
$('#history-older').on('click', function() {
	var params = {
		date: new Date($('#history-end-date').val()) || ''
	};

	if (true) {
		params.update = true;
	}

	$.ajax({
		url: '/history',
		dataType: 'json',
		method: 'get',
		data: params,
		success(response) {
			if(!response) {
				return false;
			}
			$('#history-end-date').val(response.end_date);
			var issues = response.issues.filter(i => !history_displayed_issues.includes(i.id));

			if (!issues.length) {
				$('#history-older').hide();
			}

			var html = '';
			$.get('template/issue.ejs', function (template) {
				issues.forEach(i => {
					history_displayed_issues.push(i.id);
					// html += '<pre style="white-space:normal;font-size: 12px;padding-top:30px;"><code class="language-javascript">' + JSON.stringify(i) + '</code></pre>';

					var func = ejs.compile(template);
					var issue_html = func({
						issue: i,
						comic: {
							link: i.comics_link,
							id: i.comics_id,
							name: i.comics,
							start_year: i.comics_start_year,
						},
						options: {
							page: 'history'
						}
					});

					html += issue_html;
				});
				$('#issues_list').prepend(html);
				Prism.highlightAll();
			});

		}
	});
});

// update
$('#update').on('click', function() {
	//
	$(this)
		.prop('disabled', true)
		.addClass('disabled')
		.find('.menu-title').text('updating...');
	$(this).find('.fa-sync-alt')
		.addClass('fa-spin');
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
						//console.log(response);
					}
				})
				updates.push(update_request);
			});

			$.when.apply(null, updates).done(function(){
				$('#update')
					.prop('disabled', false)
					.removeClass('disabled')
					.find('.menu-title').text('Updated !');
				$('#update').find('.fa-sync-alt')
					.removeClass('fa-spin');
				console.log('Comics updated');
			});

			//
		}
	});
});

function template(name, data, element, before_after = 'before', returning = false) {
	// Grab the template
	$.get('template/' + name + '.ejs', function (template) {
		var func = ejs.compile(template);
		var html = func(data);
		if (before_after === 'before') {
			if (returning) {
				// console.log(html);
				return html;
			} else {
				$(element).prepend(html);
			}
			//console.log('prepend', data.date);
		} else if (before_after === 'after') {
			if (returning) {
				console.log(html);
				return html;
			} else {
				$(element).append(html);
			}
			//console.log('append', data.date);
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

	/*console.log("moving", {
		element: element,
		to: newParent
	});*/

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
function getCalendar(date, direction, more) {
	console.log(new Date(date), direction, more);
	// older : -1
	// newer : 1

	$.ajax({
		url: '/calendar/data',
		dataType: 'json',
		method: 'post',
		data: {
			direction: direction,
			date: date
			// more: more
		},
		success(res) {
			//console.log(res);
			var html = '';
			if (res.calendar) {

				var issues_cal = [];
				Object.keys(res.calendar).sort((a, b) => new Date(b) - new Date(a)).forEach( d => {
					issues_cal[d] = res.calendar[d];
				});


				$.get('template/calendar.ejs', function (template) {
					// var min_date = Object.entries(issues_cal).reverse()[0];
					// var max_date = null;
					var calendar_days = Object.keys(issues_cal).reverse();
					var min_date = calendar_days[0];
					var max_date = calendar_days[calendar_days.length - 1];

					Object.entries(issues_cal).reverse().forEach(([i_date, items]) => {
						console.log(i_date, items);
						//{options: options, date: new Date(date), items: items}
						// template('calendar', {options: options, date: new Date(date), items: items}, '.calendar-wrapper', direction > 0 ? 'after' : 'before', false);
						// template('calendar', {options: options, date: new Date(date), items: items}, '.calendar-wrapper', direction > 0 ? 'after' : 'before', false);

						var func = ejs.compile(template);
						html += func({
							options: options,
							date: new Date(i_date),
							items: items
						});
						// console.log(html);
						// max_date = i_date;

					});

					console.log('min date', min_date);
					console.log('max date', max_date);


					// console.log(html);
					if (direction > 0) {
						$('.calendar-direction#calendar-newer').data('maxDate', max_date);
						// options.calendar.max.date = max_date;
						$('#issues_list').append(html);
					} else {
						$('.calendar-direction#calendar-older').data('minDate', min_date);
						// options.calendar.min.date = min_date;
						$('#issues_list').prepend(html);
					}
					// issues.forEach(i => {
					// 	history_displayed_issues.push(i.id);
					// 	// html += '<pre style="white-space:normal;font-size: 12px;padding-top:30px;"><code class="language-javascript">' + JSON.stringify(i) + '</code></pre>';

					// 	var func = ejs.compile(template);
					// 	var issue_html = func({
					// 		issue: i,
					// 		comic: {
					// 			link: i.comics_link,
					// 			id: i.comics_id,
					// 			name: i.comics,
					// 			start_year: i.comics_start_year,
					// 		},
					// 		options: {
					// 			page: 'history'
					// 		}
					// 	});

					// 	html += issue_html;
					// });
					// $('#issues_list').prepend(html);
					// Prism.highlightAll();
				});
			}

			//{calendar: by_day, options: options}
			//template('comic', res.data[0], '.to-read-list', 'before');
		}
	})

}

$(document).on('click', 'a.calendar-direction', function(e) {

	var direction = 0,
		date = null;

	if ($(e.target).data('direction') === 'top' /*scroll.top*/) {
		var direction = -1;
		var date = $(e.target).data('minDate'); // options.calendar.min.date;
		console.log('OLDER, min_date', date, options.calendar.params.min);
		// var more = options.calendar.min.more;
		//console.log(options.calendar.min, "prependTo");
	} else if ( $(e.target).data('direction') === 'bottom' /*scroll.bottom*/) {
		var direction = 1
		var date = $(e.target).data('maxDate'); // options.calendar.max.date
		console.log('NEWER, max_date', date, options.calendar.params.max);
		// var more = options.calendar.max.more;
		//console.log(options.calendar.max, "appendTo");
	} else {
		return false;
	}

	getCalendar(date, direction, true);
});


// infinite scroll setup
// $(window).on('scroll', function() {
// 	return;
// 	if (options.page !== 'calendar') {
// 		return false;
// 	}
// 	// var scroll = {
// 	// 	top: $(window).scrollTop() === 0,
// 	// 	pos: $(this).scrollTop(),
// 	// 	bottom: ($(window).scrollTop() + $(window).height()) == $(document).height()
// 	// };
// 	//console.log(scroll);

// 	var direction = 0,
// 		date = null;

// 	if ( $(e.target).data('') /*scroll.top*/) {
// 		direction = -1, date = options.calendar.min.date, more = options.calendar.min.more;
// 		//console.log(options.calendar.min, "prependTo");
// 	} else if ( $(e.target).data('') /*scroll.bottom*/) {
// 		direction = 1, date = options.calendar.max.date, more = options.calendar.max.more;
// 		//console.log(options.calendar.max, "appendTo");
// 	} else {
// 		return false;
// 	}

// 	if(!more) {
// 		return false;
// 	}

// 	// date = $('#calendar-min-date').val();
// 	// date = $('#calendar-max-date').val();

// 	getCalendar(date, direction, more);

// 	//options.calendar.max
// });

