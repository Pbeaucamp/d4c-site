//var filtreLicence = [];
var filtreProducteur = [];
var filtreTheme = [];
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

var canReplaceUrl;
var themes = [];
var orgas = [];
var features = [
	{name:"table", label: "Tableau", picto:"fa-table"},
	{name:"geo", label: "Carte", picto:"fa-globe"},
	{name:"analyze", label: "Analyse", picto:"fa-bar-chart"},
	{name:"calendar", label: "Calendrier", picto:"fa-calendar"},
	{name:"image", label: "Image", picto:"fa-picture-o"},
	{name:"wordcloud", label: "Nuage de mots", picto:"fa-cloud"},
	{name:"timeline", label: "Frise chronologique", picto:"fa-history"},
	{name:"custom_view", label: "Vue personnalisée", picto:"fa-tachometer"},
	{name:"export", label: "Export", picto:"fa-download"},
	{name:"api", label: "API", picto:"fa-cogs"}
];

var goToPage = 0;
var rows = 12;
$(document).ready(function(){
	canReplaceUrl = window.history && window.history.pushState;
	
	loadParameters();

	var selectedTheme = $('#selected-theme').val();
	filtreTheme.push(selectedTheme);
	
	searchDatasets();
	getThemes();
	//getOrgas();
	
	$("#search-form").submit(function(e) {
	   searchDatasets();
	   e.preventDefault();
	});
	
	$('#datasets ').on('click','.jetons .tag',function(){
		tag = $(this).text();
		filtreTags.push(tag);
		searchDatasets();
	});

	$('#list-producteur').on('click','li',function(){
		var prod = $(this).data('orga');
		if(filtreProducteur.indexOf(prod) != -1){
			filtreProducteur.splice(filtreProducteur.indexOf(prod));
		} else {
			filtreProducteur.push(prod);
		}
		searchDatasets();
	});
    

    $('#list-theme').on('click','li',function(){
		var theme = $(this).data('theme');
		if(filtreTheme.indexOf(theme) != -1){
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
	
	$('#list-tag').on('click','li',function(){
		var tag = $(this).data('tag');
		if(filtreTags.indexOf(tag) != -1){
			filtreTags.splice(filtreTags.indexOf(tag));
		} else {
			filtreTags.push(tag);
		}
		searchDatasets();
	});
	
	$('#list-visu').on('click','li',function(){
		var visu = $(this).data('visu');
		if(filtreVisu.indexOf(visu) != -1){
			filtreVisu.splice(filtreVisu.indexOf(visu));
		} else {
			filtreVisu.push(visu);
		}
		searchDatasets();
	});

	$('#reset-filters').on('click',function(event){
		resetFilters();
	});

	$('.jetons').on('click','span',function(){

        if(typeof $(this).parent().data("orga") != "undefined"){
			for (var j= 0; j < filtreProducteur.length; j++) {
				if(filtreProducteur[j] == $(this).parent().data('orga')){
					filtreProducteur.splice(j,1);
				}
			}
            
			$('#input-producteur').val(filtreProducteur.join(";"));
		}
        else if(typeof $(this).parent().data("theme") != "undefined"){
			for (var j= 0; j < filtreTheme.length; j++) {
				if(filtreTheme[j] == $(this).parent().data('theme')){
					filtreTheme.splice(j,1);
				}
			}
            
			$('#input-theme').val(filtreTheme.join(";"));
		} 
        /*else if(typeof $(this).parent().data("format") != "undefined"){
			for (var l= 0; l < filtreFormats.length; l++) {
				if(filtreFormats[l] == $(this).parent().data('format')){
					filtreFormats.splice(l,1);
				}
			}
			$('#input-format').val(filtreFormats.join(";"));
		} */
        else if(typeof $(this).parent().data("tag") != "undefined"){
			for (var m= 0; m < filtreTags.length; m++) {
				if(filtreTags[m] == $(this).parent().data('tag')){
					filtreTags.splice(m,1);
				}
			}
			$('#input-tag').val(filtreTags.join(";"));
		}
		else if(typeof $(this).parent().data("visu") != "undefined"){
			for (var m= 0; m < filtreVisu.length; m++) {
				if(filtreVisu[m] == $(this).parent().data('visu')){
					filtreVisu.splice(m,1);
				}
			}
			$('#input-visu').val(filtreVisu.join(";"));
		}		
		
		$(this).parent().remove();
		searchDatasets();
	});

	$('#filter select').change(function(){
		searchDatasets();
	});
    
	$('#list-cat li').on('click', function(e){ 
		var cat = $(this).data('cat');
		var req = getReq();
		window.location.href = '/api/datasets/2.0/download/' + cat + "/" + req;
	});
	
});

function loadParameters(){
	
	/* old parammeters : to keep compatibility */
    var search = getQueryVariable('search');
	var theme = getQueryVariable('theme');
	var tag = getQueryVariable('tag');
	
	/* new parameters */
	var sortReq = getQueryVariable('sort');
	var fqReq = getQueryVariable('fq');
	var qReq = getQueryVariable('q');
	var start = getQueryVariable('start');
	
	
	
	if(start != undefined){
		var page = start / rows;
		goToPage = page;
	}
	
	if(qReq != undefined || search != undefined){
		if(search != undefined){
			$('#search-form input').val(search);
		}
		
		if(qReq != undefined){
			qReq = qReq.replace("text:", "");
			$('#search-form input').val(qReq);
		}
	}

	if(sortReq != undefined){
		sortReq = sortReq.replace("%20", " ");
		if(sortReq == "title asc"){
			$('#filter select').val("alpha");
		} else if(sortReq == "title desc"){
			$('#filter select').val("alpha_reverse");
		} else if(sortReq == "metadata_modified desc"){
			$('#filter select').val("date_recent");
		} else if(sortReq == "metadata_modified asc"){
			$('#filter select').val("date_old");
		} else if(sortReq == "records_count desc"){
			$('#filter select').val("enregistrement_plus");
		} else if(sortReq == "records_count asc"){
			$('#filter select').val("enregistrement_minus");
		} else if(sortReq == "nb_download desc"){
			$('#filter select').val("telechargement_plus");
		} else if(sortReq == "nb_download asc"){
			$('#filter select').val("telechargement_minus");
		} else if(sortReq == "nb_views desc"){
			$('#filter select').val("populaire_plus");
		} else if(sortReq == "nb_views asc"){
			$('#filter select').val("populaire_minus");
		} else if(sortReq == "organization asc"){
			$('#filter select').val("producteur");
		} else if(sortReq == "imported_recent"){
			$('#filter select').val("imported_recent");
		} else if(sortReq == "imported_old"){
			$('#filter select').val("imported_old");
		}
	}
	
	if(fqReq != undefined){
		var fqArr = fqReq.split(" AND ");
		$.each(fqArr, function(i, part){
			var part = part.split(":");
			var values = part[1].replace("(","").replace(")","");
			var values = values.split(" OR ");
			if(part[0] == "organization"){
				filtreProducteur = values;
			} else if(part[0] == "tags"){
				filtreTags = values;
			} else if(part[0] == "theme"){
				filtreTheme = values;
			} else if(part[0] == "features"){
				$.each(values, function(i, v){
					values[i] = v.replace(/\*/g, "");
				});
				filtreVisu = values;
			}
		});
	} else if(theme != undefined){
		if(theme != null && theme != ""){
			filtreTheme.push(theme);
		}
	} else if(tag != undefined){
		if(tag != null && tag != ""){
			filtreTags.push(tag);
		}
	}

}

function resetFilters(){
    
		//filtreLicence = [];
		filtreProducteur = [];
		filtreGranularite = [];
		filtreFormats = [];
		filtreTags = [];
		filtreVisu = [];
		filtreTheme = [];
		searchDatasets();
}

function changeUrl(requete){
	if(canReplaceUrl){
		var url = window.location.origin + window.location.pathname + "?" + requete;
		window.history.pushState({}, null, url);
	}
}
function getThemes(){
	$.ajax('/api/themes/',
	{
		type: 'POST',
		dataType: 'json',
		cache : true,
		success: function (res) {
			themes = res;
		},
		error: function (e) {
			console.log("ERROR: ", e);
		}
	});
}

function getReq(){
	var req = "";
	var sortReq = "";
	var fqReq = "";
	var qReq = "";
	var facetReq = 'facet.field=["organization","tags","theme","features"]';

	var page = getPage();
	var start = rows * page;
	var rowsReq = "&rows="+rows;
	var startReq = "&start="+start;

	name = $('#search-form input').val();
	if(name != ""){
		name = name.toLowerCase();
		qReq = "&q=text:"+name;
	}
	
	if($('#filter select').val() != ""){
		var key = $('#filter select').val();
		if(key == "alpha"){
			sortReq = "&sort=title asc";
		} else if(key == "alpha_reverse"){
			sortReq = "&sort=title desc";
		} else if(key == "date_recent"){
			//TODO upgrade solr to query "&sort=def(date_moissonnage_last_modification, metadata_modified) desc";
			sortReq = "&sort=date_moissonnage_last_modification desc";
		} else if(key == "date_old"){
			//TODO upgrade solr to query "&sort=def(date_moissonnage_last_modification, metadata_modified) asc";
			sortReq = "&sort=date_moissonnage_last_modification asc";
		} else if(key == "enregistrement_plus"){
			sortReq = "&sort=records_count desc";
		} else if(key == "enregistrement_minus"){
			sortReq = "&sort=records_count asc";
		} else if(key == "telechargement_plus"){
			sortReq = "&sort=nb_download desc";
		} else if(key == "telechargement_minus"){
			sortReq = "&sort=nb_download asc";
		} else if(key == "populaire_plus"){
			sortReq = "&sort=nb_views desc";
		} else if(key == "populaire_minus"){
			sortReq = "&sort=nb_views asc";
		} else if(key == "producteur"){
			sortReq = "&sort=organization asc";
		} else if(key == "imported_recent"){
			sortReq = "&sort=metadata_modified desc";
		} else if(key == "imported_old"){
			sortReq = "&sort=metadata_modified asc";
		}
	}
	
	var fqArr = [];
	if(filtreProducteur.length > 0){
		fqArr.push("organization:("+ filtreProducteur.join(" OR ") +")");
	}
	if(filtreTags.length > 0){
		fqArr.push("tags:("+ filtreTags.join(" OR ") +")");
	}
	if(filtreTheme.length > 0){
		fqArr.push("theme:("+ filtreTheme.join(" OR ") +")");
	}
	if(filtreVisu.length > 0){
		fqArr.push("features:(*"+ filtreVisu.join("* OR *") +"*)");
	}
	
	if(fqArr.length > 0){
		fqReq = "&fq=" + fqArr.join(" AND ");
	}
	
	req = facetReq + rowsReq + startReq + qReq + sortReq + fqReq;
	
	return req;
}

function searchDatasets(){
	loading(true);
	
	
	var req = getReq();

	changeUrl(req);
	$.ajax('/api/datasets/2.0/search/' + req,
	{
		type: 'POST',
		dataType: 'json',
		cache : true,
		success: function (data) {
            //console.log(data);
			orgas = data.all_organizations;
			loading(false);
            renderResult(data);
		},
		error: function (e) {
			console.log("ERROR: ", e);
		}
	});
}

accentsTidy = function(s){
    var r = s.toLowerCase();
    non_asciis = {'a': '[Ã Ã¡Ã¢Ã£Ã¤Ã¥]', 'ae': 'Ã¦', 'c': 'Ã§', 'e': '[Ã¨Ã©ÃªÃ«]', 'i': '[Ã¬Ã­Ã®Ã¯]', 'n': 'Ã±', 'o': '[Ã²Ã³Ã´ÃµÃ¶]', 'oe': 'Å“', 'u': '[Ã¹ÃºÃ»Å±Ã¼]', 'y': '[Ã½Ã¿]'};
    for (i in non_asciis) { r = r.replace(new RegExp(non_asciis[i], 'g'), i); }
    return r;
};

function renderResult(json){
	$('#list-producteur').find('li').remove();
	$('#list-format').find('li').remove();
	$('#list-tag').find('li').remove();
	$('#list-theme').find('li').remove();
	$('#list-visu').find('li').remove();
	$('.alert-info').remove();
	$('#datasets').find('.dataset').each(function()
	{
		$(this).remove();
	});
	$('#filter').find('.jetons').children().remove();
	
	$('#nb_jeux').text("");
 
    var n = 0;
	var numDataset = 0;
	
	if( json == null || json.result.count == 0){
		$('#datasets').append('<div class="alert alert-info">Aucun jeu de donnÃ©es trouvÃ©</div>');
		return;
	}
    
	numDataset = json.result.count;
	$('#nb_jeux').text(numDataset);
	//datasets
	package_list = json.result.results;
	
	for (var i=package_list.length-1; i >= 0; i--) {
		createDataset(package_list[i]);
	}                       
    
	//tag facet
	var tags_facet = json.result.search_facets.tags.items;
	tags_facet.sort(function(a,b) {
		return b.count-a.count;
	});
	$.each(tags_facet, function(i, t){
		$('#list-tag').append('<li class="list-item" data-tag="' + t.name +'">' + t.name + 
			' <span class="number_element">' + t.count + '</span></li>');
	});
	
	//theme facet
	var themes_facet = json.result.search_facets.theme.items;
	themes_facet.sort(function(a,b) {
		return b.count-a.count;
	});
	$.each(themes_facet, function(i, t){
		var theme = themes.filter(function(o){ return o.title == t.name; });
		if(theme.length > 0){
			$('#list-theme').append('<li class="list-item" data-theme="' + t.name +'">' + theme[0].label + 
			' <span class="number_element">' + t.count + '</span></li>');
		}
	});
	
	//orga facet
	var orga_facet = json.result.search_facets.organization.items;
	orga_facet.sort(function(a,b) {
		return b.count-a.count;
	});
	$.each(orga_facet, function(i, t){
		var orga = orgas.filter(function(o){ return o.name == t.name; });
		if(orga.length > 0){
			$('#list-producteur').append('<li class="list-item" data-orga="' + t.name +'">' + orga[0].title + 
			' <span class="number_element">' + t.count + '</span></li>');
		}
	});
	
	//visu facet
	var visu_facet = json.result.search_facets.features.items;
	visu_facet.sort(function(a,b) {
		return b.count-a.count;
	});
	$.each(visu_facet, function(i, t){
		var feat = features.filter(function(o){ return o.name == t.name; });
		if(feat.length > 0){
			$('#list-visu').append('<li class="list-item" data-visu="' + t.name +'">' + '<i class="fa ' + feat[0].picto + '" aria-hidden="true"></i>' + feat[0].label + 
			' <span class="number_element">' + t.count + '</span></li>');
		}
	});
	
	
	//filtres actifs
	// $.each(filtreProducteur, function(i, orga){
	// 	$('#filter').find('.jetons').append('<li data-orga="' + orga + '">'+ orgas.filter(function(o){ return o.name == orga; })[0].title +' <span class="glyphicon glyphicon-remove"></span></li>');
	// });
	$.each(filtreTags, function(i, tag){
		$('#filter').find('.jetons').append('<li data-tag="' + tag + '">'+ tag +' <span class="glyphicon glyphicon-remove"></span></li>');
	});
	$.each(filtreTheme, function(i, theme){
		$('#filter').find('.jetons').append('<li data-theme="' + theme + '">'+ themes.filter(function(o){ return o.title == theme; })[0].label +' <span class="glyphicon glyphicon-remove"></span></li>');
	});
	$.each(filtreVisu, function(i, visu){
		var feat = features.filter(function(o){ return o.name == visu; });
		$('#filter').find('.jetons').append('<li data-visu="' + visu + '">'+ '<i class="fa ' + feat[0].picto + '" aria-hidden="true"></i>' + feat[0].label +' <span class="glyphicon glyphicon-remove"></span></li>');
	});
	
	initPagination(rows, numDataset, getPage());
}

function createDataset(data){
    
	var name_orga = data.organization.title;
	var id_orga = data.organization.id;
	var modif = data.metadata_modified;
	var date = new Date(Date.UTC(modif.substring(0,4),+modif.substring(5,7) - 1,+modif.substring(8,10),+modif.substring(11,13),+modif.substring(14,16)));
	var heure = (date.toLocaleTimeString()).substring(0,5);

	var imported = data.metadata_imported;
	if(imported != undefined){
		imported = new Date(Date.UTC(imported.substring(0,4),+imported.substring(5,7) - 1,+imported.substring(8,10),+imported.substring(11,13),+imported.substring(14,16)));
	} else {
		imported = new Date();
	}
		
		
	/////////////
	var tagList = "";

	for (var i = 0; i < data.tags.length; i++) 
	{
		var tag = data.tags[i].name;
		tagList += '<li class="tag">'+ tag +'</li>';		
	}

	////////////
	var id = data.id;
    
	///////////
	var description = data.notes;

	if(description.indexOf("__Origine__") != -1)
	{
		description = description.substring(0,description.indexOf("__Origine__"));
	}
	description = description.substring(0,80) + "...";
	
	var listeFormat = '<ul class="listeFormat"></ul>';
    
	//console.log(data);
    
    let analyseDefault = '';
    let imgBck ='/sites/default/files/img_backgr/default.svg';
    for(let i = 0; i<data.extras.length; i++){
        if(data.extras[i].key=='analyse_default'){
           analyseDefault = '&'+ data.extras[i].value;
        }
        
        if(data.extras[i].key=='img_backgr'){
           imgBck = data.extras[i].value;
        }
    }
    
	//visus
	
    let api_vis = '<p><a href="/visualisation/api/?id=' + id + '" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "api"; })[0].picto + '" aria-hidden="true"></i>' +features.filter(function(o){ return o.name == "api"; })[0].label + '</a></p>'; 
    let analize_vis= '<p><a href="/visualisation/analyze/?id='+id+''+analyseDefault+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "analyze"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "analyze"; })[0].label + '</a></p>';
    let table_vis ='<p><a href="/visualisation/table/?id='+id+''+analyseDefault+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "table"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "table"; })[0].label + '</a></p>';
    let timeline_vis= '<p><a href="/visualisation/timeline/?id='+id+''+analyseDefault+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "timeline"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "timeline"; })[0].label + '</a></p>';
    let map_vis= '<p><a href="/visualisation/map/?id='+id+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "geo"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "geo"; })[0].label + '</a></p>';
    let wordcloud_vis= '<p><a href="/visualisation/wordcloud/?id='+id+''+analyseDefault+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "wordcloud"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "wordcloud"; })[0].label + '</a></p>';
    let image_vis= '<p><a href="/visualisation/images/?id='+id+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "image"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "image"; })[0].label + '</a></p>';
    let calendar_vis= '<p><a href="/visualisation/calendar/?id='+id+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "calendar"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "calendar"; })[0].label + '</a></p>';
    let export_vis= '<p><a href="/visualisation/export/?id='+id+''+analyseDefault+'" target="_blank" rel="noopener noreferrer"><i class="fa ' + features.filter(function(o){ return o.name == "export"; })[0].picto + '" aria-hidden="true"></i>' + features.filter(function(o){ return o.name == "export"; })[0].label + '</a></p>';
    
   
	let rightPanel= '';
	$.each(features, function(i, f){
		if(f.name == "export"){
			rightPanel += export_vis;
		} else {
			if(data.metas != undefined && data.metas.features != undefined && data.metas.features.indexOf(f.name) != -1){
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
							let custom_view_vis = '<p><a href="/visualisation/' + encodeURIComponent(data.metas.custom_view.slug).replace('%20','+') + '/?id='+id+'" target="_blank" rel="noopener noreferrer"><i class="fa fa-'+data.metas.custom_view.icon+'" aria-hidden="true"></i>'+titleCustomView+'</a></p>';
							vis = custom_view_vis;
						}
						else {
							let custom_view_vis = '<p><a href="/visualisation/' + encodeURIComponent(data.metas.custom_view.slug).replace('%20','+') + '/?id='+id+'" target="_blank" rel="noopener noreferrer"><i class="fa fa-'+data.metas.custom_view.icon+'" aria-hidden="true"></i>Vue personnalisÃ©e</a></p>';
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

    
	var theme = data.extras.filter(function(t){ return t.key == "theme"})[0];
	var tooltipTitle;
	var link_theme;
	if(theme != undefined){
		theme = theme.value;
		tooltipTitle = theme.value;
		link_theme = theme.value;
	} else {
		theme = "default";
		tooltipTitle = "default";
		link_theme = "default"; 
	}
	
	//theme = accentsTidy(theme.replace(new RegExp(", ", 'g'),"-").replace(new RegExp(",", 'g'),"-").replace(new RegExp(" ", 'g'),"-"));
    var selectedTheme = themes.filter(function(o){ return o.title == theme; });
	if(selectedTheme.length > 0){
		 var url_img_them = selectedTheme[0].url; 
	} else {
		var url_img_them = "";
	}
   
    
    
    $('#datasets').prepend('<div div class="dataset col-md-6 col-sm-12 col-xs-12 content-body" data-theme="' + selectedTheme.title +'" data-orga="' + id_orga /*+'" data-reuses="'+ nb_reuses*/  +'" data-id="' + id +'" data-time="' + date.getTime() /*+'" data-views="' + nbViews + '" data-downloads="' + nbDownloads + '" data-records="' + nbRecords*/ + '" data-analyse="'+analyseDefault+'" data-imported="' + imported.getTime() +'" style="background: linear-gradient(rgb(255, 255, 255), rgba(255, 255, 255, 0.41)), url('+imgBck+') center center no-repeat; background-size: cover;" >'+
   
    '<div class="box_1"><div style="display: flex; flex-direction:row">'+
                '<div class="box_3"><div style=" background-image: url('+url_img_them+'); margin-top: 10px;  display: inline-block; width: 30px; height: 30px; background-repeat: no-repeat; background-size: contain; vertical-align: middle; margin-right: 8px;"></div></div>'+

				'<div class="box_4"><div class="inner"><h2><a href="/visualisation/?id=' + id + '' + analyseDefault + '" target="_blank" rel="noopener noreferrer"> ' + data.title + ' </a></h2></div></div></div>'+
                           
            '<div class="inner"><p class="data-desc">' + description + '</p>'+ listeFormat +'</div><div class="infos inner"><ul><li class="titre">Producteur</li><li class="info" id="nomOrga">'+ data.organization.title + '</li></ul><ul><li class="titre">Date modification</li><li class="info">' + date.toLocaleDateString() + '</ul>'+ /*li_granularite + li_reuses +*/'<ul class="jetons">' + tagList +'</ul></div>'               
    +'</div>'+
                           
                   
    '<div class="box_2">'+rightPanel+'</div>'+
    '</div>');

}

function getUrl(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

function dialog(titre, message){
	if (!$('#dataConfirmModal').length) {
		$('body').append('<div id="dataConfirmModal" class="modal" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true">'+
		'<div class="modal-dialog">'+
		'<div class="modal-content">'+
		'<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">Ã—</button><h3 id="dataConfirmLabel">'+ titre +'</h3></div>'+
		'<div class="modal-body"><textarea style="width:100%; height:100px; max-width:100%;min-width:100%;">'+ message +'</textarea></div>'+
		'<div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Fermer</button></div></div></div></div>');
	}
	$('#dataConfirmModal').find('.modal-body').text($(this).attr('data-confirm'));
	$('#dataConfirmModal').modal({show:true});
}

function getQueryVariable(variable) {
    
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return decodeURIComponent(pair[1]);
    }
  } 
  return undefined;
}

function initPagination(perPage, total, index) {

	var numItems = total;

	var numPages = Math.floor((numItems-1)/perPage) + 1;
	 
	$('.pagination').text("");
	$('.pagination').data("curr",index);

	$('<li><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>').appendTo('.pagination');
	var curr = 0;
	while(numPages > curr){
	  $('<li><a href="#" class="page_link">'+(curr+1)+'</a></li>').appendTo('.pagination');
	  curr++;
	}
	$('<li><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>').appendTo('.pagination');

	$('.pagination li:nth-child('+ (2+index)+ ')').addClass('active');
	
	$('.pagination li:nth-child(2)').after('<li id="dotsStart" style="display:none;"><a class="disabled">...</a></li>');
	//$('<li id="dotsStart" style="display:none;"><a disabled>...</a></li>').appendTo('.pagination');

	//$('<li id="dotsSEnd" style="display:none;"><a disabled>...</a></li>').appendTo('.pagination');
	$('.pagination li:last').prev().before('<li id="dotsSEnd" style="display:none;"><a class="disabled">...</a></li>');

	
	
	if(index == 0){
		$('.pagination li:first').addClass('disabled');
		$('.pagination li:first a').addClass('disabled');
	}
	
	if(index == numPages-1){
		$('.pagination li:last').addClass('disabled');
		$('.pagination li:last a').addClass('disabled');
	}

	//rows.slice(0, perPage).css('display', 'flex');

	$('.pagination li a').click(function(){
		if($(this).hasClass('disabled') || $(this).html().valueOf() == "...") {
			return;
		}
		var clickedPage;
		if($(this).children().length > 0) {
			clickedPage = $(this).children().html().valueOf();
			if(clickedPage == "Â»") {
				next();
			} else if(clickedPage == "Â«") {
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
	 	if(numPages - index > 4) $('#dotsSEnd').show();
	 	if(index+1 > 4) $('#dotsStart').show();
	}

	function previous(){
	  var goToPage = parseInt($('.pagination').data("curr")) - 1;
	  goTo(goToPage);
	}

	function next(){
	  goToPage = parseInt($('.pagination').data("curr")) + 1;
	  goTo(goToPage);
	}

	function goTo(page){
		goToPage = page;
		searchDatasets();
	}
}

function getPage(){
	return goToPage;
}

function loading(visible){
	if(visible){
		$(".d4cwidget-spinner").removeClass("hidden");
		$("#pagination").addClass("hidden");
	} else {
		$(".d4cwidget-spinner").addClass("hidden");
		$("#pagination").removeClass("hidden");
	} 
	
}