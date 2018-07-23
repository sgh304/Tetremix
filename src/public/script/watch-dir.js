$('document').ready(() => {
	let allReplays;
	let sorting = 'popular';
	// Function to resort the table
	const resortTable = () => {
		// Resort allReplays
		if (sorting === 'popular') {
			allReplays.sort((a, b) => {
	            return b.plays - a.plays;
	        })
		}
		else if (sorting === 'highestRated') {
	        allReplays.sort((a, b) => {
	            return (b.ratings.reduce((a, b) => a + b, 0) / (b.ratings.length || 1)) - (a.ratings.reduce((a, b) => a + b, 0) / (a.ratings.length || 1));
	        })
		}
		// Redraw table
		const cardHolder = $('#card-holder');
		cardHolder.empty();
		let currentRow;
		allReplays.forEach((replay, index) => {
			if(index % 4 === 0) {
				currentRow = $('<div class =\'row pb-3\'></div>');
				cardHolder.append(currentRow);
			}
			gameMode = $.get({url: '/tetremix/api/game-modes/' + replay.gameModeSlug, async: false}).responseJSON;
			currentRow.append(
				'<div class = \'col-3\'>\
            		<div class = \'card\'>\
                		<div class = \'row\'>\
                    		<div class = \'col-3 text-center\'>\
                        		<img class = \'icon\' src = \'/tetremix/img/views2.svg\'>\
								<h6>' + replay.plays + '</h6> \
		                    </div>\
 	                  		<div class = \'col\'>\
                        		<img class=\'card-img-top\' src=\'/tetremix/img/icon' + gameMode.icon + '.png\'>\
		                    </div>\
		                    <div class = \'col-3 text-center\'>\
	                        	<img class = \'icon\' src = \'/tetremix/img/rating.svg\'>\
	                        	<h6>' + (replay.ratings.reduce((a, b) => a + b, 0) / (replay.ratings.length || 1)).toFixed(1) + '</h6>\
		                    </div>\
		                </div>\
	                <div class = \'card-body\'>\
	                    <a href = \'\\watch\\' + replay.slug + '\'><h5 class = \'card-title\'>' + replay.name + '</h5></a>\
	                    <div class = \'row\'>\
	                    	<div class = \'col\'>\
				        		<img class = \'icon\' style = \'width: 20px; display:inline-block\' src = \'/tetremix/img/plays.svg\'>\
				        		<a href = \'\\play\\' + gameMode.slug + '\'><h6 style = \'display:inline-block\'>' + gameMode.name + '</h6></a>\
	                    	</div>\
	                    	<div class = \'col\'>\
				        		<img class = \'icon\' style = \'width: 20px; display:inline-block\' src = \'/tetremix/img/creator.svg\'>\
				        		<h6 style = \'display:inline-block\'>' + replay.creator.username + '</h6>\
	                    	</div>\
	                    </div>\
	                </div>\
	            </div>');
	    });
	}
	// Initial AJAX request
	$.get('/tetremix/api/replays', (replays) => {
		allReplays = replays;
		resortTable();
	});
	// Allow resorting with the form
	$('#sort-select').change(() => {
		sorting = $('#sort-select').val();
		resortTable();
	});
})