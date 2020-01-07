function initPagination() {
	
	if($ === undefined)
	{
		$ = jQuery2;
	}
	
	var listElement = $('table tbody');
	var perPage = Number.parseInt($("#table-per-page").val());
	var txtFilter = $("#table-query-search").val();

	var rows = listElement.children().filter(function(d, i){ return i.innerText.match(txtFilter) != null;});
	var url = tabUrl;
	var resourceId = url.substring(url.indexOf('resource/') + 9, url.indexOf('/', url.indexOf('resource/') + 9));
	var url = '/api/records/search/resource_id=' + resourceId + '&limit=0';
	var numPages = 0;
	$.getJSON(url, function(data) {
		
		
		var numItems = data.result.total;
		numPages = Math.floor((numItems-1)/perPage) + 1;
		 
		$('.pagination').text("");
		$('.pagination').data("curr",0);

		$('<li><a aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>').appendTo('.pagination');
		var curr = 0;
		while(numPages > curr){
		  $('<li><a class="page_link">'+(curr+1)+'</a></li>').appendTo('.pagination');
		  curr++;
		}
		$('<li><a aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>').appendTo('.pagination');
		
		$('.pagination li:nth-child(2)').after('<li id="dotsStart" style="display:none;"><a class="disabled">...</a></li>');
		$('.pagination li:last').prev().before('<li id="dotsSEnd" style="display:none;"><a class="disabled">...</a></li>');
		
		$('.pagination li:nth-child(2)').addClass('active');
		$('.pagination li:first').addClass('disabled');
		$('.pagination li:first a').addClass('disabled');
		if(numItems <= perPage){
			$('.pagination li:last').addClass('disabled');
			$('.pagination li:last a').addClass('disabled');
		}

		listElement.children().css('display', 'none');
		listElement.children().removeClass('item-visible');
		rows.slice(0, perPage).css('display', 'table-row');
		rows.slice(0, perPage).addClass('item-visible');

		$('.pagination li a').click(function(){
			if($(this).hasClass('disabled')) {
				return;
			}
			var clickedPage;
			if($(this).children().length > 0) {
				clickedPage = $(this).children().html().valueOf();
				if(clickedPage == "»") {
					next();
				} else if(clickedPage == "«") {
					previous();
				} else {
					clickedPage = 0;
				}
			} else {
				clickedPage = $(this).html().valueOf() - 1;
				goTo(clickedPage);
			}
			
		});
		
			 $('.pagination li').each(function(){
	 	if($(this).children().html().valueOf() != "...")
	 	{
	 		$(this).show();
	 	}
		
		if(!Number.isInteger($(this).children().html().valueOf()) && $(this).children().html().valueOf() != 1 && $(this).children().html().valueOf() != numPages)
		{
			if($(this).children('a').html().valueOf() < parseInt($('.pagination').data("curr")) -1 ||  $(this).children('a').html().valueOf() > parseInt($('.pagination').data("curr"))+3)
			{
				
				$(this).hide();
			}
		}
	});

	 if(numPages > 6)
	 {
	 	$('#dotsSEnd').show();
	 }
		
			var url = tabUrl;
		var resourceId = url.substring(url.indexOf('resource/') + 9, url.indexOf('/', url.indexOf('resource/') + 9));
		
		var limit = perPage * (0+1);
		var offset = perPage * (0+1) - perPage;
		
		var url = '/api/records/search/download/resource_id=' + resourceId + '&limit=' + limit+ '&offset=' + offset + '&format=objects';
		
		d3.request(url)
		    .mimeType("text/csv; charset=ISO-8859-1")
		    .response(function(xhr) { 
		    	var res = JSON.parse(xhr.responseText);
		    	//if(Object.keys(res[0]).length == 1){
		    	//	return  d3.dsvFormat(";").parse(xhr.responseText);
		    	//} else {
		    		return res;
		    	//}
		    })
		    .get( function(error, us) {
					features = us;
					featuresArray = features;
					
						reloadTabData("CSV");
						//loadChartData("CSV");
					
					
				});
		
		
	});




	function previous(){
	  var goToPage = parseInt($('.pagination').data("curr")) - 1;
	  goTo(goToPage);
	}

	function next(){
	  goToPage = parseInt($('.pagination').data("curr")) + 1;
	  goTo(goToPage);
	}

	function goTo(page){
	var url = tabUrl;
	var resourceId = url.substring(url.indexOf('resource/') + 9, url.indexOf('/', url.indexOf('resource/') + 9));
	
	var limit = perPage * (page+1);
	var offset = perPage * (page+1) - perPage;
	
	var url = '/api/records/search/download/resource_id=' + resourceId + '&limit=' + limit+ '&offset=' + offset + '&format=objects';
		
		d3.request(url)
		    .mimeType("text/csv; charset=ISO-8859-1")
		    .response(function(xhr) { 
		    	var res = JSON.parse(xhr.responseText);
		    	//if(Object.keys(res[0]).length == 1){
		    	//	return  d3.dsvFormat(";").parse(xhr.responseText);
		    	//} else {
		    		return res;
		    	//}
		    })
		    .get( function(error, us) {
					features = us;
					featuresArray = features;
					
						reloadTabData("CSV");
						//loadChartData("CSV");
					
					
				});
		
	  var startAt = page * perPage,endOn = startAt + perPage;
	  
	  rows.css('display','none').slice(startAt, endOn).css('display','table-row');
	 rows.removeClass('item-visible').slice(startAt, endOn).addClass('item-visible');;
      if(page > parseInt($('.pagination').data("curr"))){
		  $('.list-articles').show('slide', {direction: 'right'}, 500);
	  } else {
		  $('.list-articles').show('slide', {direction: 'left'}, 500);
	  }
		
	  $('.pagination').data("curr",page);
	  $('.pagination li').removeClass('active');
	  //var res = page + 1;
	  //$('.pagination li:nth-child('+res+')').addClass('active');
	  
	   $('.pagination li').filter(function(){
	  	return $(this).children().html().valueOf() == page + 1;
	  }).addClass('active')
	  
	  $('.pagination li').removeClass('disabled');
	  $('.pagination li a').removeClass('disabled');
	  if(page == 0) {
		  $('.pagination li:first').addClass('disabled');
		  $('.pagination li:first a').addClass('disabled');
	  } else if(page == numPages -1) {
		  $('.pagination li:last').addClass('disabled');
		  $('.pagination li:last a').addClass('disabled');
	  }
	  
	  	$('.pagination li').each(function(){
			if($(this).children().html().valueOf() != "...")
	 		{
	 		$(this).show();
	 		}
			if(!Number.isInteger($(this).children().html().valueOf()) && $(this).children().html().valueOf() != 1 && $(this).children().html().valueOf() != numPages)
			{
				if($(this).children('a').html().valueOf() < parseInt($('.pagination').data("curr")) -1 ||  $(this).children('a').html().valueOf() > parseInt($('.pagination').data("curr"))+3)
				{
					$(this).hide();
				}
			}
		});

		if(page < numPages -2){
			$('#dotsSEnd').show();
		}
		else
		{
			$('#dotsSEnd').hide();
		}
		if(page > 3)
		{
			$('#dotsStart').show();
		}
		else
		{
			$('#dotsStart').hide();
		}
	  
	}
	/*var $container = $('.list-articles');
		$container.imagesLoaded( function () {
			$container.masonry({
				columnWidth: '.list-articles-item',
				itemSelector: '.item-visible'
			});  
		});*/
	 
}