$('document').ready(() => {
	let allGameModes;
	let sorting = 'popular';
	// Function to resort the table
	const resortTable = () => {
		// Resort allGameModes
		if (sorting === 'popular') {
			allGameModes.sort((a, b) => {
	            return b.plays - a.plays;
	        })
		}
		else if (sorting === 'highestRated') {
	        allGameModes.sort((a, b) => {
	            return (b.ratings.reduce((a, b) => a + b, 0) / (b.ratings.length || 1)) - (a.ratings.reduce((a, b) => a + b, 0) / (a.ratings.length || 1));
	        })
		}
		// Redraw table
		const cardHolder = $('#card-holder');
		cardHolder.empty();
		let currentRow;
		allGameModes.forEach((gameMode, index) => {
			if(index % 4 === 0) {
				currentRow = $('<div class =\'row pb-3\'></div>');
				cardHolder.append(currentRow);
			}
			currentRow.append(
				'<div class = \'col-3\'>\
            		<div class = \'card\'>\
                		<div class = \'row\'>\
                    		<div class = \'col-3 text-center\'>\
                        		<img class = \'icon\' src = \'/tetremix/img/plays.svg\'>\
								<h6>' + gameMode.plays + '</h6> \
		                    </div>\
 	                  		<div class = \'col\'>\
                        		<img class=\'card-img-top\' src=\'/tetremix/img/icon' + gameMode.icon + '.png\'>\
		                    </div>\
		                    <div class = \'col-3 text-center\'>\
	                        	<img class = \'icon\' src = \'/tetremix/img/rating.svg\'>\
	                        	<h6>' + (gameMode.ratings.reduce((a, b) => a + b, 0) / (gameMode.ratings.length || 1)).toFixed(1) + '</h6>\
		                    </div>\
		                </div>\
	                <div class = \'card-body\'>\
	                    <a href = \'/tetremix/play/' + gameMode.slug + '/\'><h5 class = \'card-title\'>' + gameMode.name + '</h5></a>\
	                    <p class=\'card-text\'>' + gameMode.description + '</p>\
				        <img class = \'icon\' style = \'width: 20px; display:inline-block\' src = \'/tetremix/img/creator.svg\'>\
				        <h6 style = \'display:inline-block\'>' + gameMode.creator.username + '</h6>\
	                </div>\
	            </div>');
	    });
	}
	// Initial AJAX request
	$.get('/tetremix/api/game-modes', (gameModes) => {
		allGameModes = gameModes;
		resortTable();
	});
	// Allow resorting with the form
	$('#sort-select').change(() => {
		sorting = $('#sort-select').val();
		resortTable();
	});
})