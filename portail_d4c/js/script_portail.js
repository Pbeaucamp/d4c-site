//var filtreLicence = [];
var filtreProducteur = [];
var filtreTheme = [];
var filtreType = [];
var filtreGranularite = [];
var filtreFormats = [];
var filtreTags = [];
var filtreVisu = [];
var ckan;
var tag;
var search;
var typeReq;
var theme;
var records_counts;
var filtreMapCoord = [];

var canReplaceUrl;
var themes = [];
var types = [];
var orgas = [];
var features = [
	{ name: "table", label: "Tableau", picto: "fa-table" },
	{ name: "geo", label: "Carte", picto: "fa-globe" },
	{ name: "analyze", label: "Analyse", picto: "fa-bar-chart" },
	{ name: "calendar", label: "Calendrier", picto: "fa-calendar" },
	{ name: "image", label: "Image", picto: "fa-picture-o" },
	{ name: "wordcloud", label: "Nuage de mots", picto: "fa-cloud" },
	{ name: "timeline", label: "Frise chronologique", picto: "fa-history" },
	{ name: "custom_view", label: "Vue personnalisée", picto: "fa-tachometer" },
	{ name: "export", label: "Export", picto: "fa-download" },
	{ name: "api", label: "API", picto: "fa-cogs" }
];

var goToPage = 0;
var rows = 12;
$(document).ready(function () {

	/*
	$("#barreRecherche input").autocomplete({
		source: function(request, response) {
				var results = $.ui.autocomplete.filter(listeSource, request.term); 
				var resultats = results.slice(0,10);
				//console.log(resultats);
				// for (var i = 0; i < resultats.length; i++) {
				// 	resultats[i] = resultats[i].replace(request.term,'<b>'+request.term+'</b>');
				// }

				response(resultats);
			},
		select : function(event,ui){
			$('#search-form input').val(ui.item.value);
			if(listeProducteur.indexOf(ui.item.label) != -1)
			{
				var idProd = listeIdProducteur[listeProducteur.indexOf(ui.item.label)];
				searchDatasets(null, idProd,true,false);
			}
			else
			{
				searchDatasets(null, "text",true,true);
			}
		}
	});
	*/

	//autoComplete();

	canReplaceUrl = window.history && window.history.pushState;

	loadParameters();

	if (isMarqueBlanche()) {
		var selectedOrganisation = $('#selected-organization').val();
		if (selectedOrganisation != null) {
			if (filtreProducteur.indexOf(selectedOrganisation) == -1) {
				filtreProducteur.push(selectedOrganisation);
			}
		}
	}

	$.ajax(fetchPrefix() + '/d4c/api/themes/',
		{
			type: 'POST',
			dataType: 'json',
			cache: true,
			success: function (res) {
				themes = res;

				loadDatasets();
			},
			error: function (e) {
				console.log("ERROR: ", e);

				loadDatasets();
			}
		});
});

function loadDatasets() {
	searchDatasets();

	$("#search-form").submit(function (e) {
		searchDatasets();
		e.preventDefault();
	});

	$('#datasets').on('click', 'h2', function () {
		window.location.href = fetchPrefix() + '/visualisation?id=' + $(this).data('name') + '' + $(this).data('analyse');
	});

	$('#datasets ').on('click', '.jetons .tag', function () {
		tag = $(this).text();
		filtreTags.push(tag);
		searchDatasets();
	});

	$('#list-producteur').on('click', 'li', function () {
		var prod = $(this).data('orga');
		if (filtreProducteur.indexOf(prod) != -1) {
			filtreProducteur.splice(filtreProducteur.indexOf(prod));
		} else {
			filtreProducteur.push(prod);
		}
		searchDatasets();
	});

	$('#list-type').on('click', 'li', function () {
		var type = $(this).data('type');
		if (filtreType.indexOf(type) != -1) {
			filtreType.splice(filtreType.indexOf(type));
		} else {
			filtreType.push(type);
		}
		searchDatasets();
	});


	$('#list-theme').on('click', 'li', function () {
		var theme = $(this).data('theme');
		if (filtreTheme.indexOf(theme) != -1) {
			filtreTheme.splice(filtreTheme.indexOf(theme));
		} else {
			filtreTheme.push(theme);
		}
		searchDatasets();
	});

	/*$('#list-format').on('click','li',function(){
		var format = $(this).data('format');
		filtrerFormat(format);
	});*/

	$('#list-tag').on('click', 'li', function () {
		var tag = $(this).data('tag');
		if (filtreTags.indexOf(tag) != -1) {
			filtreTags.splice(filtreTags.indexOf(tag));
		} else {
			filtreTags.push(tag);
		}
		searchDatasets();
	});

	$('#list-visu').on('click', 'li', function () {
		var visu = $(this).data('visu');
		if (filtreVisu.indexOf(visu) != -1) {
			filtreVisu.splice(filtreVisu.indexOf(visu));
		} else {
			filtreVisu.push(visu);
		}
		searchDatasets();
	});

	$('#reset-filters').on('click', function (event) {

		resetFilters();
	});


	$('.jetons').on('click', 'span', function () {


		if (typeof $(this).parent().data("orga") != "undefined") {
			for (var j = 0; j < filtreProducteur.length; j++) {
				if (filtreProducteur[j] == $(this).parent().data('orga')) {
					filtreProducteur.splice(j, 1);
				}
			}

			$('#input-producteur').val(filtreProducteur.join(";"));
		}
		else if (typeof $(this).parent().data("themes") != "undefined") {
			for (var j = 0; j < filtreTheme.length; j++) {
				if (filtreTheme[j] == $(this).parent().data('themes')) {
					filtreTheme.splice(j, 1);
				}
			}

			$('#input-theme').val(filtreTheme.join(";"));
		}
		else if (typeof $(this).parent().data("type") != "undefined") {
			for (var j = 0; j < filtreType.length; j++) {
				if (filtreType[j] == $(this).parent().data('type')) {
					filtreType.splice(j, 1);
				}
			}

			$('#input-type').val(filtreType.join(";"));
		}

		/*else if(typeof $(this).parent().data("format") != "undefined"){
			for (var l= 0; l < filtreFormats.length; l++) {
				if(filtreFormats[l] == $(this).parent().data('format')){
					filtreFormats.splice(l,1);
				}
			}
			$('#input-format').val(filtreFormats.join(";"));
		} */
		else if (typeof $(this).parent().data("tag") != "undefined") {
			for (var m = 0; m < filtreTags.length; m++) {
				if (filtreTags[m] == $(this).parent().data('tag')) {
					filtreTags.splice(m, 1);
				}
			}
			$('#input-tag').val(filtreTags.join(";"));
		}
		else if (typeof $(this).parent().data("visu") != "undefined") {
			for (var m = 0; m < filtreVisu.length; m++) {
				if (filtreVisu[m] == $(this).parent().data('visu')) {
					filtreVisu.splice(m, 1);
				}
			}
			$('#input-visu').val(filtreVisu.join(";"));
		}
		else if (typeof $(this).parent().data("search") != "undefined") {
			$('#search-form input').val("");
		}

		$(this).parent().remove();
		searchDatasets();
	});

	$('#filter select').change(function () {
		searchDatasets();
	});

	$('#list-cat li').on('click', function (e) {
		var cat = $(this).data('cat');
		var req = getReq();
		if (cat == "zip") {
			$.ajax(fetchPrefix() + '/d4c/api/datasets/2.0/download/' + cat + "/" + req,
			{
				type: 'GET',
				dataType: 'json',
				beforeSend: function () {
					loading(true);
				},
				success: function (data) {
					loading(false);
					if (data.status == "error") {
						alert(data.message);
					}
					else {
						window.location.href = data.filename;
					}
				},
				error: function (e) {
					loading(false);
					alert("Une erreur est survenue lors de la récupération des données (" + e.responseText + "). Veuillez réessayer ultérieurement.");
				}
			});
		}
		else {
			window.location.href = fetchPrefix() + '/d4c/api/datasets/2.0/download/' + cat + "/" + req;
		}
	});
}



function loadParameters() {

	/* old parammeters : to keep compatibility */
	var search = getQueryVariable('search');
	var theme = getQueryVariable('themes');
	var tag = getQueryVariable('tag');

	/* new parameters */
	var sortReq = getQueryVariable('sort');
	var fqReq = getQueryVariable('fq');
	var qReq = getQueryVariable('q');
	var start = getQueryVariable('start');



	if (start != undefined) {
		var page = start / rows;
		goToPage = page;
	}

	if (qReq != undefined || search != undefined) {
		if (search != undefined) {
			$('#search-form input').val(search);
		}

		if (qReq != undefined) {
			qReq = qReq.replace("text:", "");
			$('#search-form input').val(qReq);
		}
	}

	if (sortReq != undefined) {
		sortReq = sortReq.replace("%20", " ");
		if (sortReq == "title asc") {
			$('#filter select').val("alpha");
		} else if (sortReq == "title desc") {
			$('#filter select').val("alpha_reverse");
		} else if (sortReq == "metadata_modified desc") {
			$('#filter select').val("date_recent");
		} else if (sortReq == "metadata_modified asc") {
			$('#filter select').val("date_old");
		} else if (sortReq == "records_count desc") {
			$('#filter select').val("enregistrement_plus");
		} else if (sortReq == "records_count asc") {
			$('#filter select').val("enregistrement_minus");
		} else if (sortReq == "nb_download desc") {
			$('#filter select').val("telechargement_plus");
		} else if (sortReq == "nb_download asc") {
			$('#filter select').val("telechargement_minus");
		} else if (sortReq == "nb_views desc") {
			$('#filter select').val("populaire_plus");
		} else if (sortReq == "nb_views asc") {
			$('#filter select').val("populaire_minus");
		} else if (sortReq == "organization asc") {
			$('#filter select').val("producteur");
		} else if (sortReq == "imported_recent") {
			$('#filter select').val("imported_recent");
		} else if (sortReq == "imported_old") {
			$('#filter select').val("imported_old");
		}
	}

	if (fqReq != undefined) {
		var fqArr = fqReq.split(" AND ");
		$.each(fqArr, function (i, part) {
			var part = part.split(":");
			var values = part[1].replace("(", "").replace(")", "");
			var values = values.split(" OR ");
			if (part[0] == "organization") {
				filtreProducteur = values;
			} else if (part[0] == "tags") {
				$.each(values, function (i, v) {
					values[i] = v.replace(/\"/g, "");
				});
				filtreTags = values;
			} else if (part[0] == "themes") {
				$.each(values, function (i, v) {
					values[i] = v.replace(/\*/g, "");
				});
				filtreTheme = values;
			} else if (part[0] == "features") {
				$.each(values, function (i, v) {
					values[i] = v.replace(/\*/g, "");
				});
				filtreVisu = values;
			} else if (part[0] == "data_rgpd" || part[0] == "limesurvey" || part[0] == "api") {
				if (part[0] == "data_rgpd") {
					filtreType.push("RGPD");
				}
				else if (part[0] == "limesurvey") {
					filtreType.push("LimeSurvey");
				}
				else if (part[0] == "api") {
					filtreType.push("API");
				}
			}
		});
	} else if (theme != undefined) {
		if (theme != null && theme != "") {
			filtreTheme.push(theme);
		}
	} else if (tag != undefined) {
		if (tag != null && tag != "") {
			filtreTags.push(tag);
		}
	}

}


function resetFilters() {
	//filtreLicence = [];
	if (isMarqueBlanche()) {
		if (hasSelectedOrganization()) {
			// filtreTerritory = [];
		}
		// else if (hasSelectedTerritory()) {
		// 	filtreProducteur = [];
		// }
	}
	else {
		filtreProducteur = [];
	}
	filtreGranularite = [];
	filtreFormats = [];
	filtreTags = [];
	filtreVisu = [];
	filtreTheme = [];
	filtreType = [];
	filtreMapCoord = [];
	$('#input-map-coordinate').val('');
	$('#search-form input').val('');
	searchDatasets();
}

function changeUrl(requete) {
	if (canReplaceUrl) {
		var url = window.location.origin + window.location.pathname + "?" + requete;
		window.history.pushState({}, null, url);
	}
}

/*function autoComplete(){
	
	$("#search_bar").autocomplete({
		source: function(request, response) {
				$.ajax(fetchPrefix() + '/d4c/api/datasets/2.0/search/q=title:*' + request.term + '*&rows=10000',
				{
					type: 'POST',
					dataType: 'json',
					cache : true,
					success: function (data) {
//						console.log(data);
						var res = data.result.results.map(function(d){ return d.title;});
						
						var lengthMax = 0;
						for(var i= 0; i < res.length; i++) {
							if(res[i].length > lengthMax) {
								lengthMax = res[i].length;
							}
						}
						
						response(res); 
						$('ul.ui-autocomplete').css('width',lengthMax * 5);
						$('ul.ui-autocomplete').css('overflow','hidden');
					},
					error: function (e) {
						console.log("ERROR: ", e);
					}
				});
				
			},
		select : function(event,ui){
			$('#search-form input').val('"' + ui.item.value + '"');
			// if(listeProducteur.indexOf(ui.item.label) != -1)
			// {
			// 	var idProd = listeIdProducteur[listeProducteur.indexOf(ui.item.label)];
			// 	searchDatasets(null, idProd,true,false);
			// }
			// else
			// {
				searchDatasets(null, "text",true,true);
			// }
		}
	});
	
}*/

/*function getOrgas(){
	$.ajax(fetchPrefix() + '/d4c/api/organizations/all_fields=true',
	{
		type: 'POST',
		dataType: 'json',
		cache : true,
		success: function (res) {
			orgas = res;
		},
		error: function (e) {
			console.log("ERROR: ", e);
		}
	});
}*/

function getReq() {
	var req = "";
	var sortReq = "";
	var fqReq = "";
	var qReq = "";
	var coordReq = "";
	var facetReq = 'facet.field=%5B"organization","tags","themes","features"%5D';

	var page = getPage();
	var start = rows * page;
	var rowsReq = "&rows=" + rows;
	var startReq = "&start=" + start;

	var searchValue = getSearchValue();
	if (searchValue != "") {
		searchValue = searchValue.toLowerCase();
		qReq = "&q=text:" + searchValue;
	}

	if ($('#filter select').val() != "") {
		var key = $('#filter select').val();
		if (key == "alpha") {
			sortReq = "&sort=title asc";
		} else if (key == "alpha_reverse") {
			sortReq = "&sort=title desc";
		} else if (key == "date_recent") {
			//TODO upgrade solr to query "&sort=def(date_moissonnage_last_modification, metadata_modified) desc";
			sortReq = "&sort=date_moissonnage_last_modification desc";
		} else if (key == "date_old") {
			//TODO upgrade solr to query "&sort=def(date_moissonnage_last_modification, metadata_modified) asc";
			sortReq = "&sort=date_moissonnage_last_modification asc";
		} else if (key == "enregistrement_plus") {
			sortReq = "&sort=records_count desc";
		} else if (key == "enregistrement_minus") {
			sortReq = "&sort=records_count asc";
		} else if (key == "telechargement_plus") {
			sortReq = "&sort=nb_download desc";
		} else if (key == "telechargement_minus") {
			sortReq = "&sort=nb_download asc";
		} else if (key == "populaire_plus") {
			sortReq = "&sort=nb_views desc";
		} else if (key == "populaire_minus") {
			sortReq = "&sort=nb_views asc";
		} else if (key == "producteur") {
			sortReq = "&sort=organization asc";
		} else if (key == "imported_recent") {
			sortReq = "&sort=metadata_modified desc";
		} else if (key == "imported_old") {
			sortReq = "&sort=metadata_modified asc";
		}
	}

	var fqArr = [];
	if (filtreProducteur.length > 0) {
		fqArr.push("organization:(" + filtreProducteur.join(" OR ") + ")");
	}
	if (filtreTags.length > 0) {
		fqArr.push("tags:(\"" + filtreTags.join("\" OR \"") + "\")");
	}
	if (filtreTheme.length > 0) {
		fqArr.push("themes:(*" + filtreTheme.join("* OR *") + "*)");
	}
	if (filtreVisu.length > 0) {
		fqArr.push("features:(*" + filtreVisu.join("* OR *") + "*)");
	}
	if (filtreType.length > 0) {
		$.each(filtreType, function (i, t) {
			if (t == "RGPD") {
				fqArr.push("data_rgpd:(1)");
			}
			else if (t == "LimeSurvey") {
				fqArr.push("limesurvey:(1)");
			}
			else if (t == "API") {
				fqArr.push("api:(1)");
			}
		});
	}

	if ($('#input-map-coordinate').val() != "") {
		var inputmapcoord = $('#input-map-coordinate').val();
		filtreMapCoord.push(inputmapcoord);
		coordReq = "&coordReq=(" + filtreMapCoord + ")";
		filtreMapCoord = [];

	}

	if (fqArr.length > 0) {
		fqReq = "&fq=" + fqArr.join(" AND ");
	}



	req = facetReq + rowsReq + startReq + qReq + sortReq + coordReq + fqReq;

	return req;
}

function getSearchValue() {
	return $('#search-form input').val();
}

function searchDatasets(page) {
	loading(true);

	if (page) {
		goToPage = page;
	}
	else {
		goToPage = 0;
	}

	var req = getReq();

	changeUrl(req);
	//$.ajax(ckan + '/api/action/package_search?' + requete + '&rows=1000'  + pertinence,
	$.ajax(fetchPrefix() + '/d4c/api/datasets/2.0/search/' + req,
		{
			type: 'POST',
			dataType: 'json',
			cache: true,
			success: function (data) {
				orgas = data.all_organizations;
				loading(false);
				renderResult(data);
			},
			error: function (e) {
				console.log("ERROR: ", e);
			}
		});
	/*$.ajax(fetchPrefix() + '/d4c/api/datasets/2.0/records/count/' + encodeURIComponent(requete) + '&rows=10000'  + pertinence,
	{
		type: 'POST',
		dataType: 'json',
		cache : true,
		success: function (data) {
			records_counts = data;
		}
	});*/
}

accentsTidy = function (s) {
	var r = s.toLowerCase();
	non_asciis = { 'a': '[àáâãäå]', 'ae': 'æ', 'c': 'ç', 'e': '[èéêë]', 'i': '[ìíîï]', 'n': 'ñ', 'o': '[òóôõö]', 'oe': 'œ', 'u': '[ùúûűü]', 'y': '[ýÿ]' };
	for (i in non_asciis) { r = r.replace(new RegExp(non_asciis[i], 'g'), i); }
	return r;
};

function renderResult(json) {
	$('#list-producteur').find('li').remove();
	$('#list-format').find('li').remove();
	$('#list-tag').find('li').remove();
	$('#list-theme').find('li').remove();
	$('#list-type').find('li').remove();
	$('#list-visu').find('li').remove();
	$('.alert-info').remove();
	$('#datasets').find('.dataset').each(function () {
		$(this).remove();
	});
	$('#filter').find('.jetons').children().remove();

	//if(doCLear)	$("select").val($("select option:first").val());

	$('#nb_jeux').text("");

	var n = 0;
	var numDataset = 0;

	if (json == null || json.result.count == 0) {
		$('#datasets').append('<div class="alert alert-info">Aucune connaissance trouvée</div>');

		setActiveFilters();

		initPagination(rows, numDataset, getPage());

		return;
	}

	numDataset = json.result.count;
	$('#nb_jeux').text(numDataset);
	//datasets
	package_list = json.result.results;

	for (var i = package_list.length - 1; i >= 0; i--) {
		createDataset(package_list[i]);
	}

	//tag facet
	var tags_facet = json.result.search_facets.tags.items;
	tags_facet.sort(function (a, b) {
		return b.count - a.count;
	});
	$.each(tags_facet, function (i, t) {
		var selectedCss = isSelected(filtreTags, t);
		$('#list-tag').append('<li class="list-item ' + selectedCss + '" data-tag="' + t.name + '">' + t.name +
			' <span class="number_element">' + t.count + '</span></li>');
	});

	//theme facet
	var themes_facet = json.result.search_facets.themes.items;
	themes_facet.sort(function (a, b) {
		return b.count - a.count;
	});
	$.each(themes_facet, function (i, t) {
		var selectedCss = isSelected(filtreTheme, t);
		var theme = themes.filter(function (o) { return o.title == t.name; });
		if (theme.length > 0) {
			$('#list-theme').append('<li class="list-item ' + selectedCss + '" data-theme="' + t.name + '">' + theme[0].label +
				' <span class="number_element">' + t.count + '</span></li>');
		}
	});

	//orga facet
	var orga_facet = json.result.search_facets.organization.items;
	orga_facet.sort(function (a, b) {
		return b.count - a.count;
	});
	$.each(orga_facet, function (i, t) {
		var selectedCss = isSelected(filtreProducteur, t);
		var orga = orgas.filter(function (o) { return o.name == t.name; });
		if (orga.length > 0) {
			$('#list-producteur').append('<li class="list-item ' + selectedCss + '" data-orga="' + t.name + '">' + orga[0].title +
				' <span class="number_element">' + t.count + '</span></li>');
		}
	});

	//visu facet
	var visu_facet = json.result.search_facets.features.items;
	visu_facet.sort(function (a, b) {
		return b.count - a.count;
	});
	$.each(visu_facet, function (i, t) {
		var selectedCss = isSelected(filtreVisu, t);
		var feat = features.filter(function (o) { return o.name == t.name; });
		if (feat.length > 0) {
			$('#list-visu').append('<li class="list-item ' + selectedCss + '" data-visu="' + t.name + '">' + '<i class="fa ' + feat[0].picto + '" aria-hidden="true"></i>' + feat[0].label +
				' <span class="number_element">' + t.count + '</span></li>');
		}
	});

	//type facet
	var type_facet = ["RGPD", "LimeSurvey", "API"];
	$.each(type_facet, function (i, t) {
		var selectedCss = isSelected(filtreType, t);
		var type = t;
		if (type.length > 0) {
			$('#list-type').append('<li class="list-item ' + selectedCss + '" data-type="' + t + '">' + type + '</li>');
		}
	});


	//filtres actifs
	setActiveFilters();

	initPagination(rows, numDataset, getPage());
}

function isSelected(filters, item) {
	for (i = 0; i < filters.length; i++) {
		var filter = filters[i];
		if (filter == item || filter == item.name) {
			return "selected";
		}
	}
	return "";
}

function setActiveFilters() {
	var hasActifFilters = false;

	if (!isMarqueBlanche()) {
		$.each(filtreProducteur, function (i, orga) {
			hasActifFilters = true;
			$('#filter').find('.jetons').append('<li data-orga="' + orga + '">' + orgas.filter(function (o) { return o.name == orga; })[0].title + ' <span class="glyphicon glyphicon-remove"></span></li>');
		});
	}
	else {
		$('#div-producteur').hide();
	}
	$.each(filtreTags, function (i, tag) {
		hasActifFilters = true;
		$('#filter').find('.jetons').append('<li data-tag="' + tag + '">' + tag + ' <span class="glyphicon glyphicon-remove"></span></li>');
	});
	$.each(filtreTheme, function (i, theme) {
		hasActifFilters = true;
		$('#filter').find('.jetons').append('<li data-theme="' + theme + '">' + themes.filter(function (o) { return o.title == theme; })[0].label + ' <span class="glyphicon glyphicon-remove"></span></li>');
	});
	$.each(filtreVisu, function (i, visu) {
		hasActifFilters = true;
		var feat = features.filter(function (o) { return o.name == visu; });
		$('#filter').find('.jetons').append('<li data-visu="' + visu + '">' + '<i class="fa ' + feat[0].picto + '" aria-hidden="true"></i>' + feat[0].label + ' <span class="glyphicon glyphicon-remove"></span></li>');
	});
	$.each(filtreType, function (i, type) {
		hasActifFilters = true;
		$('#filter').find('.jetons').append('<li data-type="' + type + '">' + type + ' <span class="glyphicon glyphicon-remove"></span></li>');
	});

	var searchValue = getSearchValue()
	if (searchValue) {
		hasActifFilters = true;
		$('#filter').find('.jetons').append('<li data-search="' + searchValue + '">' + searchValue + ' <span class="glyphicon glyphicon-remove"></span></li>');
	}

	if (hasActifFilters) {
		$('#actif-filters').show();
	}
	else {
		$('#actif-filters').hide();
	}
}

function createDataset(data) {

	var name_orga = data.organization.title;
	var id_orga = data.organization.id;

	/*var reuses = data.extras.filter(function(element){
		return element.key == 'utilisations';
	});

	var li_reuses = "";
	var nb_reuses = 0;

	if(reuses != undefined && reuses.length != 0)
	{
		if(reuses[0].value != 0)
		{
			li_reuses = '<ul><li class="titre">Réutilisations</li><li class="info">' + reuses[0].value + '</li></ul>';
			nb_reuses = reuses[0].value;
		}
			
		
	}*/

	var modif = data.metadata_modified;
	var date = new Date(Date.UTC(modif.substring(0, 4), +modif.substring(5, 7) - 1, +modif.substring(8, 10), +modif.substring(11, 13), +modif.substring(14, 16)));
	// var heure = (date.toLocaleTimeString()).substring(0,5);

	// var imported = data.metadata_imported;
	// if(imported != undefined){
	// 	imported = new Date(Date.UTC(imported.substring(0,4),+imported.substring(5,7) - 1,+imported.substring(8,10),+imported.substring(11,13),+imported.substring(14,16)));
	// } else {
	// 	imported = new Date();
	// }

	//Define last data update date
	var lastUpdateDate;
	for (let i = 0; i < data.resources.length; i++) {
		let resource = data.resources[i];
		let currentDataDate = resource.last_modified;
		if (!currentDataDate) {
			currentDataDate = resource.created;
		}

		if (!lastUpdateDate) {
			lastUpdateDate = currentDataDate;
		}
	}
	if (lastUpdateDate) {
		lastUpdateDate = new Date(Date.UTC(lastUpdateDate.substring(0, 4), +lastUpdateDate.substring(5, 7) - 1, +lastUpdateDate.substring(8, 10), +lastUpdateDate.substring(11, 13), +lastUpdateDate.substring(14, 16)));
	}

	/////////////
	var tagList = "";

	for (var i = 0; i < data.tags.length; i++) {
		var tag = data.tags[i].name;
		tagList += '<li class="tag">' + tag + '</li>';
	}

	////////////
	var id = data.id;
	// We set the name as ID to open the dataset
	var name = data.name;

	var private = data.private ? '<span class="dataset-private label label-inverse"><i class="lock fa fa-lock"></i>Private</span>' : '';

	///////////
	var description = data.notes != null ? data.notes : '';
	if (description.indexOf("__Origine__") != -1) {
		description = description.substring(0, description.indexOf("__Origine__"));
	}
	//We remove HTML tags
	description = strip(description);
	description = description.substring(0, 80) + "...";

	var listeFormat = '<ul class="listeFormat"></ul>';

	//console.log(data);

	let analyseDefault = '';
	let imgBck = fetchPrefix() + '/sites/default/files/img_backgr/default.svg';

	for (let i = 0; i < data.extras.length; i++) {
		if (data.extras[i].key == 'analyse_default') {
			analyseDefault = '&' + data.extras[i].value;
		}

		if (data.extras[i].key == 'img_backgr') {
			imgBck = data.extras[i].value;
		}
	}

	//Check if dataset has features geo or hasWMS to display map
	let hasGeo = data.metas != undefined && data.metas.features != undefined && data.metas.features.indexOf("geo") != -1;
	// let featureGeo = myFeatures.filter(function(o){ return o.name == "geo"; })[0];
	if (!hasGeo && hasWMS(data)) {
		data.metas.features.push("geo");
	}

	let targetValue = '';
	if (isMarqueBlanche()) {
		targetValue = ' target="_blank" rel="noopener noreferrer"';
	}

	//visus

	let api_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/api/?id=' + name + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "api"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "api"; })[0].label + '</a></p>';
	let analize_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/analyze/?id=' + name + '' + analyseDefault + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "analyze"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "analyze"; })[0].label + '</a></p>';
	let table_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/table/?id=' + name + '' + analyseDefault + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "table"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "table"; })[0].label + '</a></p>';
	let timeline_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/timeline/?id=' + name + '' + analyseDefault + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "timeline"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "timeline"; })[0].label + '</a></p>';
	let map_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/map/?id=' + name + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "geo"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "geo"; })[0].label + '</a></p>';
	let wordcloud_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/wordcloud/?id=' + name + '' + analyseDefault + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "wordcloud"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "wordcloud"; })[0].label + '</a></p>';
	let image_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/images/?id=' + name + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "image"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "image"; })[0].label + '</a></p>';
	let calendar_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/calendar/?id=' + name + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "calendar"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "calendar"; })[0].label + '</a></p>';
	let export_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/export/?id=' + name + '' + analyseDefault + '"' + targetValue + '><i class="fa ' + features.filter(function (o) { return o.name == "export"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function (o) { return o.name == "export"; })[0].label + '</a></p>';


	let rightPanel = '';
	$.each(features, function (i, f) {
		if (f.name == "export") {
			rightPanel += export_vis;
		} else {
			if (data.metas != undefined && data.metas.features != undefined && data.metas.features.indexOf(f.name) != -1) {
				var vis;
				switch (f.name) {
					case 'api':
						vis = api_vis;
						break;
					case 'analyze':
						vis = analize_vis;
						break;
					case 'table':
						vis = table_vis;
						break;
					case 'timeline':
						vis = timeline_vis;
						break;
					case 'geo':
						vis = map_vis;
						break;
					case 'wordcloud':
						vis = wordcloud_vis;
						break;
					case 'image':
						vis = image_vis;
						break;
					case 'calendar':
						vis = calendar_vis;
						break;
					case 'custom_view':
						let titleCustomView = data.metas.custom_view.title;
						// let custom_view_vis;
						if (titleCustomView) {
							let custom_view_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/' + encodeURIComponent(data.metas.custom_view.slug).replace('%20', '+') + '/?id=' + name + '"><i class="fa fa-' + data.metas.custom_view.icon + '" aria-hidden="true"></i>' + titleCustomView + '</a></p>';
							vis = custom_view_vis;
						}
						else {
							let custom_view_vis = '<p><a href ="' + fetchPrefix() + '/visualisation/' + encodeURIComponent(data.metas.custom_view.slug).replace('%20', '+') + '/?id=' + name + '"><i class="fa fa-' + data.metas.custom_view.icon + '" aria-hidden="true"></i>Vue personnalisée</a></p>';
							vis = custom_view_vis;
						}
						break;
					default:
						vis = '';
				}
				rightPanel += vis;
			}
		}

	});


	var theme = data.extras.filter(function (t) { return t.key == "themes" })[0];
	if (theme && theme.value) {
		theme = jQuery.parseJSON(theme.value);
	}
	else {
		theme = ["default"];
	}

	//theme = accentsTidy(theme.replace(new RegExp(", ", 'g'),"-").replace(new RegExp(",", 'g'),"-").replace(new RegExp(" ", 'g'),"-"));
	var imageThemes = buildImageThemes(theme);

	var datasetRecordsCount = buildDatasetRecordsCount(data);
	var datasetSize = buildDatasetSize(data);

    $('#datasets').prepend(
		'<div div class="dataset col-md-6 col-sm-12 col-xs-12 content-body" data-theme="' + theme[0] +'" data-orga="' + id_orga /*+'" data-reuses="'+ nb_reuses*/  +'" data-id="' + id +'" data-time="' + date.getTime() /*+'" data-views="' + nbViews + '" data-downloads="' + nbDownloads + '" data-records="' + nbRecords*/ + '" data-analyse="' + analyseDefault + '" data-imported="' + (lastUpdateDate !=  null ? lastUpdateDate.getTime() : '') + '" style="background: linear-gradient(rgb(255, 255, 255), rgba(255, 255, 255, 0.41)), url(' + imgBck + ') center center no-repeat; background-size: cover;" >' +
    		'<div class="box_1">' + 
				'<a href="' + fetchPrefix() + '/visualisation/?id=' + name + '' + analyseDefault + '"' + targetValue + '>' +
					'<div style="display: flex; flex-direction:row">' +
						'<div class="portail-theme">' + imageThemes + '</div>' +
						'<div class="box_4">' + 
							'<div class="inner">' + 
								'<div class="dataset-h2">' + 
									data.title + 
									// '<a href="' + fetchPrefix() + '/visualisation/?id=' + name + '' + analyseDefault + '"' + targetValue + '> ' + data.title + ' </a>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
					'</div>' +
					private +               
					'<div class="inner"><p class="data-desc">' + description + '</p>' + listeFormat + '</div>' +
					'<div class="infos inner">' + 
						// Modification custom SPOT
						//'<ul><li class="titre">Origine du site</li><li class="info" id="nomOrga">'+ data.organization.title + '</li></ul>' +
						'<ul><li class="titre">Producteur</li><li class="info" id="nomOrga">' + data.organization.title + '</li></ul>' +
						'<ul><li class="titre">Date modification</li><li class="info">' + (lastUpdateDate != null ? lastUpdateDate.toLocaleDateString() : '') + (lastUpdateDate != null ? ' ' + lastUpdateDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '') + '</ul>'+ /*li_granularite + li_reuses +*/
						datasetRecordsCount +
						datasetSize +
						'<ul class="jetons">' + tagList + '</ul>' + 
					'</div>' + 
				'</a>' +      
			'</div>'+     
			'<div class="box_2">' + rightPanel + '</div>'+
    	'</div>'
	);
}

function buildDatasetRecordsCount(data) {
	var recordsCount = data.extras.filter(function (t) { return t.key == "records_count" })[0];
	return recordsCount ? '<ul><li class="titre">Nombre de lignes</li><li class="info">' + parseInt(recordsCount.value) + '</ul>' : '';
}

function buildDatasetSize(data) {
	var size = data.extras.filter(function (t) { return t.key == "dataset_size" })[0];
	return size ? '<ul><li class="titre">Taille en mo</li><li class="info">' + size.value + '</ul>' : '';
}

function hasWMS(dataset) {
	if (dataset != undefined && dataset.resources != undefined && dataset.resources.length > 0) {
		var res = dataset.resources.filter(function (r) {
			if (r.format.toUpperCase() == "WMS") {
				return true;
			}
		});
		return res.length > 0;
	}
	return false;
}

function strip(html) {
	let doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || "";
}


function buildImageThemes(selectedThemes) {
	var imageThemes = '';

	for (var i = 0; i < selectedThemes.length; i++) {
		var theme = selectedThemes[i];

		var selectedTheme = themes.filter(function (o) { return o.title == theme; });
		if (selectedTheme.length > 0) {
			var url_img_them = selectedTheme[0].url;
		}
		else {
			var url_img_them = "";
		}

		imageThemes = imageThemes + '<div style=" background-image: url(' + url_img_them + '); margin-top: 10px;  display: inline-block; width: 30px; height: 30px; background-repeat: no-repeat; background-size: contain; vertical-align: middle; margin-right: 8px;"></div>';
	}

	return imageThemes;
}

function getUrl(name) {
	if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
		return decodeURIComponent(name[1]);
}

function dialog(titre, message) {
	if (!$('#dataConfirmModal').length) {
		$('body').append('<div id="dataConfirmModal" class="modal" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true">' +
			'<div class="modal-dialog">' +
			'<div class="modal-content">' +
			'<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="dataConfirmLabel">' + titre + '</h3></div>' +
			'<div class="modal-body"><textarea style="width:100%; height:100px; max-width:100%;min-width:100%;">' + message + '</textarea></div>' +
			'<div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Fermer</button></div></div></div></div>');
	}
	$('#dataConfirmModal').find('.modal-body').text($(this).attr('data-confirm'));
	$('#dataConfirmModal').modal({ show: true });
}

function getQueryVariable(variable) {

	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
	return undefined;
}

function initPagination(perPage, total, index) {

	var numItems = total;

	var numPages = Math.floor((numItems - 1) / perPage) + 1;

	$('.pagination').text("");
	$('.pagination').data("curr", index);

	if (numPages > 1) {
		$('<li><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>').appendTo('.pagination');
		var curr = 0;
		while (numPages > curr) {
			$('<li><a href="#" class="page_link">' + (curr + 1) + '</a></li>').appendTo('.pagination');
			curr++;
		}
		$('<li><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>').appendTo('.pagination');
	}

	$('.pagination li:nth-child(' + (2 + index) + ')').addClass('active');

	$('.pagination li:nth-child(2)').after('<li id="dotsStart" style="display:none;"><a class="disabled">...</a></li>');
	//$('<li id="dotsStart" style="display:none;"><a disabled>...</a></li>').appendTo('.pagination');

	//$('<li id="dotsSEnd" style="display:none;"><a disabled>...</a></li>').appendTo('.pagination');
	$('.pagination li:last').prev().before('<li id="dotsSEnd" style="display:none;"><a class="disabled">...</a></li>');



	if (index == 0) {
		$('.pagination li:first').addClass('disabled');
		$('.pagination li:first a').addClass('disabled');
	}

	if (index == numPages - 1) {
		$('.pagination li:last').addClass('disabled');
		$('.pagination li:last a').addClass('disabled');
	}

	//rows.slice(0, perPage).css('display', 'flex');

	$('.pagination li a').click(function () {
		if ($(this).hasClass('disabled') || $(this).html().valueOf() == "...") {
			return;
		}
		var clickedPage;
		if ($(this).children().length > 0) {
			clickedPage = $(this).children().html().valueOf();
			if (clickedPage == "»") {
				next();
			} else if (clickedPage == "«") {
				previous();
			} else {
				clickedPage = 0;
			}
		} else {
			clickedPage = $(this).html().valueOf() - 1;
			goTo(clickedPage);
		}

	});

	$('.pagination li').each(function () {
		if ($(this).children().html().valueOf() != "...") {
			$(this).show();
		}

		if (!Number.isInteger($(this).children().html().valueOf()) && $(this).children().html().valueOf() != 1 && $(this).children().html().valueOf() != numPages) {
			if ($(this).children('a').html().valueOf() < parseInt($('.pagination').data("curr")) - 1 || $(this).children('a').html().valueOf() > parseInt($('.pagination').data("curr")) + 3) {
				$(this).hide();
			}
		}
	});

	if (numPages > 6) {
		if (numPages - index > 4) $('#dotsSEnd').show();
		if (index + 1 > 4) $('#dotsStart').show();
	}

	function previous() {
		var page = parseInt($('.pagination').data("curr")) - 1;
		goTo(page);
	}

	function next() {
		var page = parseInt($('.pagination').data("curr")) + 1;
		goTo(page);
	}

	function goTo(page) {
		searchDatasets(page);
	}
}

function getPage() {
	return goToPage;
}

function loading(visible) {
	if (visible) {
		$(".d4cwidget-spinner").removeClass("hidden");
		$("#pagination").addClass("hidden");
	} else {
		$(".d4cwidget-spinner").addClass("hidden");
		$("#pagination").removeClass("hidden");
	}

}

function isMarqueBlanche() {
	return $('#marque-blanche').length;
}

function hasSelectedOrganization() {
	var selectedOrganisation = $('#selected-organization').val();
	return selectedOrganisation != null;
}
