/*
This file uses a library under MIT Licence :

ods-widgets -- https://github.com/opendatasoft/ods-widgets
Copyright (c) 2014 - Opendatasoft

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
; ;
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' && typeof require === 'function' ? factory(require('../moment')) : typeof define === 'function' && define.amd ? define(['../moment'], factory) : factory(global.moment)
}
	(this, (function (moment) {
			'use strict';
			var fr = moment.defineLocale('fr', {
					months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
					monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
					monthsParseExact: true,
					weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
					weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
					weekdaysMin: 'di_lu_ma_me_je_ve_sa'.split('_'),
					weekdaysParseExact: true,
					longDateFormat: {
						LT: 'HH:mm',
						LTS: 'HH:mm:ss',
						L: 'DD/MM/YYYY',
						LL: 'D MMMM YYYY',
						LLL: 'D MMMM YYYY HH:mm',
						LLLL: 'dddd D MMMM YYYY HH:mm'
					},
					calendar: {
						sameDay: '[Aujourd’hui à] LT',
						nextDay: '[Demain à] LT',
						nextWeek: 'dddd [à] LT',
						lastDay: '[Hier à] LT',
						lastWeek: 'dddd [dernier à] LT',
						sameElse: 'L'
					},
					relativeTime: {
						future: 'dans %s',
						past: 'il y a %s',
						s: 'quelques secondes',
						ss: '%d secondes',
						m: 'une minute',
						mm: '%d minutes',
						h: 'une heure',
						hh: '%d heures',
						d: 'un jour',
						dd: '%d jours',
						M: 'un mois',
						MM: '%d mois',
						y: 'un an',
						yy: '%d ans'
					},
					dayOfMonthOrdinalParse: /\d{1,2}(er|)/,
					ordinal: function (number, period) {
						switch (period) {
						case 'D':
							return number + (number === 1 ? 'er' : '');
						default:
						case 'M':
						case 'Q':
						case 'DDD':
						case 'd':
							return number + (number === 1 ? 'er' : 'e');
						case 'w':
						case 'W':
							return number + (number === 1 ? 're' : 'e');
						}
					},
					week: {
						dow: 1,
						doy: 4
					}
				});
			return fr;
		}))); ;
var d4c = angular.module('d4c', ['d4c-widgets', 'd4c.core.config', 'd4c.core', 'd4c.core.form.directives', 'gettext']);
d4c.config(['$locationProvider', function ($locationProvider) {
			$locationProvider.html5Mode(true);
		}
	]);
d4c.config(function ($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist(["self", "*://www.youtube.com/embed/**", "//platform.twitter.com/widgets.js", "*://player.vimeo.com/video/**"]);
});
d4c.config(function (D4CCurrentDomainProvider) {
	D4CCurrentDomainProvider.setDomain('d4c');
});
d4c.config(function (D4CWidgetsConfigProvider, ModuleLazyLoaderProvider) {
	$.ajax({
		//url: fetchPrefix() + "/d4c/api/maps/layers/?type=tile", 
		url: fetchPrefix() + "/d4c/api/maps/layers/", 
		success: function(result){
			try{
				var res = JSON.parse(result);
				D4C.basemaps = res.layers;
				D4C.default_bbox = res.default_bbox;
			} catch(e){
				D4C.basemaps = result.layers;
				D4C.default_bbox = result.default_bbox;
			}
			/*console.log(D4CWidgetsConfigProvider.customConfig);
			D4CWidgetsConfigProvider.setConfig({
				basemaps: result
			});		
			
			console.log(D4CWidgetsConfigProvider.customConfig);*/
		},
		error:function(error){
			
		}
	});
	D4CWidgetsConfigProvider.setConfig({
		disqusShortname: "",
		basemaps: function(){ 
			try{
				return JSON.parse(D4C.basemaps);
			} catch(e){
				return D4C.basemaps;
			}
		 
		},
		/*basemaps: [{
				"provider": "osm",
				"minZoom": 0,
				"maxZoom": 19,
				"label": "Plan"
			}, //{"provider":"mapbox.streets","mapbox_access_token":"pk.eyJ1Ijoib3BlbmRhdGFzb2Z0IiwiYSI6Im9taEJndlkifQ.gN6NtnubxT8HJ-AUY2o_rg","id":"mapbox.streets","label":"Plan"},{"label":"Satellite","mapbox_access_token":"pk.eyJ1Ijoib3BlbmRhdGFzb2Z0IiwiYSI6Im9taEJndlkifQ.gN6NtnubxT8HJ-AUY2o_rg","id":"mapbox.streets-satellite","provider":"mapbox.streets-satellite"},{
			//	"strictTMS": false,
			//	"attribution": "IGN",
			//	"url": "https://wxs.ign.fr/fhin710pkh2je8gy310xxrm0/geoportail/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}",
			//	"label": "Ortho",
			//	"minZoom": 0,
			//	"provider": "custom",
			//	"maxZoom": 20,
			//	"id": "a83676"
			//} //,{"jawg_apikey":"4cKtE4Rze1HrvxWa9a7mdolSk10lVThTFC8zadQYMIMxTjkpTeIDJAAmhReDGnCH","label":"Light","id":"jawg.light","jawg_d4cdomain":"cdalarochelle","provider":"jawg.light"}],*/
		mapGeobox: true,
		//chartColors: ["#FF515A", "#1B6698", "#FCD23B", "#41CFC5", "#0B81A3", "#DCE169", "#FF9810", "#C5CED9", "#00B57A"],
		language: "fr",
		themes: {
			"Education, Formation, Recherche, Enseignement": {
				"url": "img/set-v2/college.svg",
				"color": "#162583"
			},
			"Justice, S\u00e9curit\u00e9, Police, Crime": {
				"url": "img/set-v2/justice.svg",
				"color": "#311357"
			},
			"Services, Social": {
				"url": "img/set-v2/social.svg",
				"color": "#F9811E"
			},
			"Environnement": {
				"url": "img/set-v2/leaf.svg",
				"color": "#8CCA1F"
			},
			"default": {
				"url": "img/themes/d4clogo.svg",
				"color": "#000000"
			},
			"Am\u00e9nagement du territoire, Urbanisme, B\u00e2timents, Equipements, Logement": {
				"url": "img/set-v2/townplanning.svg",
				"color": "#35BBE8"
			},
			"Culture, Patrimoine": {
				"url": "img/set-v2/culture.svg",
				"color": "#0944B8"
			},
			"H\u00e9bergement, Restauration": {
				"url": "img/set-v2/accommodation.svg",
				"color": "#7A0316"
			},
			"Economie, Business, PME, D\u00e9veloppement \u00e9conomique, Emploi": {
				"url": "img/set-v2/economy.svg",
				"color": "#149D72"
			},
			"Administration, Gouvernement, Finances publiques, Citoyennet\u00e9": {
				"url": "img/set-v2/administration.svg",
				"color": "#0944B8"
			},
			"Transports, D\u00e9placements": {
				"url": "img/set-v2/transport.svg",
				"color": "#8F44C0"
			},
			"Sant\u00e9": {
				"url": "img/set-v2/health.svg",
				"color": "#167935"
			},
			"Sport, Loisirs": {
				"url": "img/set-v2/sport.svg",
				"color": "#F82618"
			}
		},
		basePath: fetchPrefix() + '/sites/default/files/api/portail_d4c/',
		websiteName: "data4citizen.com",
		mapPrependAttribution: '',
		//defaultMapLocation: "9,46.14559,-1.10138", //La Rochelle
		//defaultMapLocation: "12,48.85218,2.36996", //Paris
		//defaultMapLocation: "1,37.16032,-49.21875", //Monde
		//defaultMapLocation: "5,46.85218,2.36996",  //France
		//defaultMapLocation: "11,48.68958,6.18517",  //Nancy
		defaultMapLocation: function(){ return (D4C.default_bbox != null )? D4C.default_bbox : "5,46.85218,2.36996";},
		appendedURLQuerystring: ""
	});
	var loadingConfig = ModuleLazyLoaderProvider.getConfig();
	loadingConfig.highcharts.js = [["lib/chartjs/chart.min.js"],["lib/highcharts/highcharts.js"], ["lib/highcharts/no-data-to-display.js"], ["lib/highcharts-i18n/fr.js", "lib/highcharts/highcharts-more.js", "lib/highcharts/treemap.js", "lib/highcharts/funnel.js"]];
	loadingConfig['swagger-ui'] = {
		'css': ['lib/swagger-ui/css/typography.css', 'lib/swagger-ui/css/screen.css', 'lib/swagger-ui/css/reset.css', 'lib/swagger-ui/css/style.css'],
		'js': [['lib/swagger-ui/lib/jquery.slideto.min.js', 'lib/swagger-ui/lib/jquery.wiggle.min.js', 'lib/swagger-ui/lib/jquery.ba-bbq.min.js', 'lib/swagger-ui/lib/handlebars-2.0.0.js', 'lib/swagger-ui/lib/underscore-min.js', 'lib/swagger-ui/lib/backbone-min.js', 'lib/swagger-ui/lib/highlight.7.3.pack.js', 'lib/swagger-ui/lib/marked.js', 'lib/swagger-ui/lib/swagger-oauth.js', 'SwaggerTranslator@lib/swagger-ui/lang/translator.js', 'lib/swagger-ui/lang/fr.js'], ['swaggerUi@lib/swagger-ui/swagger-ui.min.js']]
	};
	loadingConfig['simple-statistics'] = {
		'css': [],
		'js': ['ss@lib/simple-statistics/simple-statistics.js']
	};
	loadingConfig['html-entities'] = {
		'css': [],
		'js': ['he@lib/he/he.js']
	};
	loadingConfig.leaflet = {
		'css': [
			"lib/leaflet/leaflet.css", 
			"lib/map-fullscreen/map-fullscreen.css", 
			"lib/leaflet-locatecontrol/L.Control.Locate.css", 
			"lib/leaflet-control-geocoder/Control.Geocoder.css", 
			"lib/vectormarker/vectormarker.css", 
			"lib/clustermarker/clustermarker.css",
			"lib/leaflet-draw/leaflet.draw.css", 
			"lib/leaflet-markercluster/MarkerCluster.css", 
			"lib/leaflet-markercluster/MarkerCluster.Default.css", 
			"lib/leaflet-measure/leaflet-measure.css"
		],
		'js': [
			[
				"L@lib/leaflet/leaflet.js"
			], 
			[
				"L.Control.D4CMapFullscreen@lib/map-fullscreen/map-fullscreen.js", 
				"L.Control.Locate@lib/leaflet-locatecontrol/L.Control.Locate.min.js",
				"L.D4CMap@lib/map/map.js", 
				"L.D4CTileLayer@lib/map/tilelayer.js", 
				"L.Control.Geocoder@lib/leaflet-control-geocoder/Control.Geocoder.js", 
				"L.VectorMarker@lib/vectormarker/vectormarker.js", 
				"L.ClusterMarker@lib/clustermarker/clustermarker.js", 
				"L.UtfGrid@lib/leaflet-utfgrid/leaflet.utfgrid.js", 
				"L.Draw@lib/leaflet-draw/leaflet.draw.js", 
				"L.BundleTileLayer@lib/bundletilelayer/bundletilelayer.js", 
				"L.HeatLayer@lib/leaflet-heat/leaflet-heat.js", 
				"L.MarkerClusterGroup@lib/leaflet-markercluster/leaflet.markercluster.js",
				"L.Control.BrowserPrint@lib/leaflet-browser-print/leaflet.browser.print.min.js",
				"L.Control.EasyPrint@lib/leaflet-easyprint/bundle.js",
				"L.Control.Measure@lib/leaflet-measure/leaflet-measure.fr.js"
			],
			[
				'lib/leaflet-proj4js/GpPluginLeaflet.js',
				'lib/dom-to-image/dom-to-image.min.js'
			]
		]
	};
	loadingConfig.vega.js = ['lib/vega-4.2.0/vega.min.js', 'lib/vega-lite-3.0.0-rc3/vega-lite.min.js', 'lib/vega-tooltip-0.13.0/vega-tooltip.min.js', ];
});
d4c.filter('isocode_to_language', function () {
	var languages = {
		"fr": "Fran\u00e7ais",
		"en": "Anglais",
		"nl": "N\u00e9erlandais",
		"pt": "Portugais",
		"ca": "Catalan",
		"de": "Allemand",
		"it": "Italien",
		"sv": "Su\u00e9dois",
		"ar": "Arabe",
		"eu": "Basque",
		"es": "Espagnol"
	};
	return function (code) {
		if (!code) {
			return code;
		}
		if (angular.isDefined(languages[code])) {
			return languages[code];
		} else {
			return code;
		}
	};
});
d4c.run(['gettextCatalog', 'DebugLogger', '$http', function (gettextCatalog, DebugLogger, $http) {
			var translations = {
				"'Geographic area' option in the publish interface information tab": {
					"$$noContext": "Option 'Zone géographique' dans l'onglet information de l'interface de publication "
				},
				"'shapeprecision' cannot be defined without 'clusterprecision'": {
					"API error message": "'shapeprecision' ne peut pas être utilisé sans 'clusterprecision'"
				},
				"(Hide JSON)": {
					"$$noContext": "(Cacher le JSON)"
				},
				"(More than 20 values, only the first 20 will be used)": {
					"$$noContext": "(Plus de 20 valeurs, seules les 20 premières vont être utilisées)"
				},
				"(Show JSON)": {
					"$$noContext": "(Afficher le JSON)"
				},
				"(active)": {
					"$$noContext": "(actif)"
				},
				"(default basemap)": {
					"$$noContext": "(fond par défaut)"
				},
				"(limited to the first {{RECORD_LIMIT}} records)": {
					"$$noContext": "(limité aux {{RECORD_LIMIT}} premiers enregistrements)"
				},
				"(none)": {
					"$$noContext": "(aucun)"
				},
				"(optional) An URL or an image which illustrates your work": {
					"$$noContext": "(facultatif) Une URL ou une image pour présenter votre travail"
				},
				"(via group)": {
					"$$noContext": "(via un groupe)"
				},
				"(will be updated automatically)": {
					"$$noContext": "(mise à jour automatique)"
				},
				"(with an optional icon)": {
					"$$noContext": "(avec une icône optionnelle)"
				},
				"(yourself)": {
					"$$noContext": "(vous-même)"
				},
				"({{ $count }} value)": {
					"$$noContext": ["({{ $count }} valeur)", "({{ $count }} valeurs différentes)"]
				},
				", Longitude": {
					"$$noContext": ", Longitude"
				},
				"10 tiers maximum.": {
					"$$noContext": "10 intervalles maximum."
				},
				"2 tiers minimum.": {
					"$$noContext": "2 intervalles minimum."
				},
				"2-letters language code for linguistic text features": {
					"$$noContext": "Code langue de 2 lettres"
				},
				"5 color spectrum": {
					"$$noContext": "Spectre de 5 couleurs"
				},
				"7 color spectrum": {
					"$$noContext": "Spectre de 7 couleurs"
				},
				"<a href=\"http://www.thunderforest.com/\">Thunderforest</a> is a provider of beautiful basemaps, among which the OpenCycleMap basemap.": {
					"$$noContext": "<a href=\"http://www.thunderforest.com/\">Thunderforest</a> est un fournisseur de beaux fonds de carte, dont notamment le fond de carte OpenCycleMap."
				},
				"<a d4c-tooltip=\"{{ partialDataLayers }}\" d4c-tooltip-direction=\"top\">Some layers</a> show partial results for performance reasons. Try zooming in.": {
					"$$noContext": "<a d4c-tooltip=\"{{ partialDataLayers }}\" d4c-tooltip-direction=\"top\">Certaines couches</a> sont affichées partiellement pour des raisons de performance. Essayez de zoomer. "
				},
				"<i>Data Ecosystem News</i>": {
					"$$noContext": "Actualités de l'Ecosystème Data"
				},
				"<i>Product News</i>": {
					"$$noContext": "Actualités du Produit"
				},
				"<span style=\"color: {color}\">{name}</span>: <b style=\"display: inline-block\">{value}</b>": {
					"$$noContext": "<span style=\"color: {color}\">{name}</span> : <b style=\"display: inline-block\">{value}</b>"
				},
				"A \"public\" application is an application where the client secret can be present outside of a controlled environment; for example a mobile application holds the client secret inside its code, which is installed on users' smartphones, therefore it is a public application.": {
					"$$noContext": "Une application \"publique\" est une application dont le secret client peut être présent dans un environnement non maîtrisé; par exemple, une application mobile contient le secret client dans son code qui est présent sur les smartphones des utilisateurs, c'est donc une application publique."
				},
				"A WGS84 point and a distance in meters indicating a geo position for geo filtering": {
					"$$noContext": "Un point WGS84 et une distance en mètres pour le géopositionnement"
				},
				"A dataset slug is required": {
					"$$noContext": "Le slug de dataset est obligatoire"
				},
				"A few sentences describing what your portal is about. This text helps search engines and social networks understand the content of your portal and sometimes shows up in search results and link descriptions.": {
					"$$noContext": "Quelques phrases qui décrivent le contenu de votre portail. Ce texte permet aux moteurs de recherche et aux réseaux sociaux de comprendre le contenu de votre portail et apparaît parfois dans les résultats de recherche et les descriptions de liens. "
				},
				"A filter with this parameter for this field already exists": {
					"$$noContext": "Un filtre existe déjà pour ce paramètre"
				},
				"A harvest can be a one time operation or a regularly scheduled one. Whether you're migrating a portal or updating datasets from an external source, all your needs are covered.": {
					"$$noContext": "Un moissonnage peut être une opération ponctuelle ou planifiée pour être répétée régulièrement. Suivant que vous soyez en train de migrer un portail ou de mettre à jour un jeu de données depuis une source externe, le moissonnage répond à tous vos besoins."
				},
				"A harvest can be a one time operation or a regularly scheduled one. Whether you're migrating a portal or updating datasets, all your needs are covered.": {
					"$$noContext": "Un moissonnage peut être une opération ponctuelle ou planifiée pour être répétée régulièrement. Suivant que vous soyez en train de migrer un portail ou de mettre à jour un jeu de données depuis une source externe, le moissonnage répond à tous vos besoins."
				},
				"A harvester fetches data from a remote source and updates your data catalog.": {
					"$$noContext": "Un moissonneur récupère les données depuis une source externe et crée un jeu de données à partir de celle-ci."
				},
				"A harvester has a critical error": {
					"$$noContext": ["Un moissonneur a une erreur critique", "{{ $count }} moissonneurs ont une erreur critique"]
				},
				"A local user can't unlink its identity": {
					"API error message": "Un utilisateur local ne peut pas détacher son identité"
				},
				"A longer description of what you achieved using this dataset (max. 1000 characters)": {
					"$$noContext": "Une description de ce que vous avez fait en utilisant ce jeu de données (max. 1000 caractères)"
				},
				"A description about the using this dataset": {
					"$$noContext": "Une description de l'utilisation de ce jeu de données"
				},
				"A parameter with this name already exists.": {
					"$$noContext": "Un paramètre avec ce nom existe déjà."
				},
				"A polygon, expressed as a list of WGS84 points (only one path polygons supported at the moment)": {
					"$$noContext": "Un polygone formé par une liste de points WGS84 (un seul polygone pour le moment)"
				},
				"A preview of 5 datasets will appear here": {
					"$$noContext": "Une prévisualisation de 5 jeux de données apparaitra ici"
				},
				"A problem during your visit, a question about a feature or our APIs? Contact us.": {
					"$$noContext": "Un problème pendant votre visite, une question à propos d'une fonctionnalité ou de nos APIs ? Contactez nous. "
				},
				"A query that is used to limit the data available to the user.": {
					"$$noContext": "Une requête utilisée pour limiter les données accessibles à l'utilisateur"
				},
				"A recap of your portal alerts and news (sent everyday at 9AM CET).": {
					"$$noContext": "Un récapitulatif des informations et alertes de votre portail (envoyé chaque jour à 09h00 CET)."
				},
				"A subdomain is a child domain for your domain, called parent domain. A parent domain can have several child subdomains but a subdomain can be attached to one and only one parent domain.": {
					"$$noContext": "Un sous-domaine est un domaine enfant de votre domaine, appelé domaine parent. Un domaine parent peut avoir plusieurs domaines enfants mais un sous-domaine ne peut être attaché à un et un seul domaine parent."
				},
				"A template to rule them all": {
					"$$noContext": "Un modèle pour tous les gouverner"
				},
				"A valid email address is required.": {
					"$$noContext": "Une adresse email valide est requise."
				},
				"A valid url is required": {
					"$$noContext": "une URL valide est requise"
				},
				"A-Z": {
					"$$noContext": "De A à Z"
				},
				"API": {
					"$$noContext": "API"
				},
				"API Key": {
					"$$noContext": "Clé d'API"
				},
				"API Key is required": {
					"$$noContext": "Une clé d'API est nécessaire"
				},
				"API Preview": {
					"$$noContext": "Aperçu de l'API"
				},
				"API calls": {
					"$$noContext": "Appels d'API"
				},
				"API calls quota": {
					"$$noContext": "Quota d'appels API"
				},
				"API description url": {
					"$$noContext": "URL de description de l'API"
				},
				"API key": {
					"$$noContext": "Clé d'API"
				},
				"API keys": {
					"$$noContext": "Clés d'API"
				},
				"API proxy": {
					"$$noContext": "Proxy d'API"
				},
				"API type": {
					"$$noContext": "Type d'API"
				},
				"Abort": {
					"$$noContext": "Annuler"
				},
				"Abort harvester": {
					"$$noContext": "Interrompre le moissonneur"
				},
				"Aborting": {
					"$$noContext": "Annulation"
				},
				"Aborting processing": {
					"$$noContext": "Annulation du traitement"
				},
				"Accepted methods": {
					"$$noContext": "Méthodes acceptées"
				},
				"Access Token URL": {
					"$$noContext": "URL du jeton d'accès"
				},
				"Access granted to anybody with access to the portal": {
					"$$noContext": "Accès autorisé à toute personne ayant accès au portail"
				},
				"Access policy": {
					"$$noContext": "Politique d'accès"
				},
				"Access request approved!": {
					"$$noContext": "Demande d'accès approuvée"
				},
				"Access request rejected!": {
					"$$noContext": "Demande d'accès rejetée "
				},
				"Access restricted to allowed users and groups": {
					"$$noContext": "Accès limité aux utilisateurs et groupes autorisés"
				},
				"Access subdomain": {
					"$$noContext": "Accéder au sous-domaine"
				},
				"Account avatar": {
					"$$noContext": "Avatar du compte"
				},
				"Accrual periodicity": {
					"$$noContext": "Fréquence de mise à jour"
				},
				"Acre": {
					"$$noContext": "Acre anglo-saxonne"
				},
				"Active filters": {
					"$$noContext": "Filtres actifs"
				},
				"Activity": {
					"$$noContext": "Activité"
				},
				"Add": {
					"$$noContext": "Ajouter"
				},
				"Add a dataset": {
					"$$noContext": "Ajouter un jeu de données"
				},
				"Add a dataset from the Data4Citizen network": {
					"$$noContext": "Ajouter un jeu de données du réseau Data4Citizen"
				},
				"Add a dataset to this chart": {
					"$$noContext": "Ajouter un jeu de données à ce graphe"
				},
				"Add a dataset to this map": {
					"$$noContext": "Ajouter un jeu de données à cette carte"
				},
				"Add a data layer": {
					"$$noContext": "Ajouter une couche de données"
				},
				"Add a data serie": {
					"$$noContext": "Ajouter une série de données"
				},
				"Add a page": {
					"$$noContext": "Ajouter une page"
				},
				"Add a parameter": {
					"$$noContext": "Ajouter un paramètre"
				},
				"Add a processor": {
					"$$noContext": "Ajouter un processeur"
				},
				"Add a realtime source": {
					"$$noContext": "Ajouter une source temps réel"
				},
				"Add a serie": {
					"$$noContext": "Ajouter une série"
				},
				"Add a source": {
					"$$noContext": "Ajouter une source"
				},
				"Add a threshold": {
					"$$noContext": "Ajouter un seuil"
				},
				"Add all": {
					"$$noContext": "Ajouter tout"
				},
				"Add an API Proxy": {
					"$$noContext": "Ajouter un proxy d'API"
				},
				"Add an entry": {
					"$$noContext": "Ajouter une entrée"
				},
				"Add an entry point": {
					"$$noContext": "Ajouter un point d'entrée"
				},
				"Add basemap": {
					"$$noContext": "Ajouter un fond de carte"
				},
				"Add custom theme": {
					"$$noContext": "Ajouter un thème personnalisé"
				},
				"Add filter": {
					"$$noContext": "Ajouter un filtre"
				},
				"Add group": {
					"$$noContext": "Ajouter un groupe"
				},
				"Add group permissions": {
					"$$noContext": "Ajouter des permissions de groupe"
				},
				"Add metadata": {
					"$$noContext": "Ajouter une métadonnée"
				},
				"Add new value": {
					"$$noContext": "Ajouter une nouvelle valeur"
				},
				"Add parameter": {
					"$$noContext": "Ajouter un paramètre"
				},
				"Add permission": {
					"$$noContext": "Ajouter une permission"
				},
				"Add schedule": {
					"$$noContext": "Ajouter une planification"
				},
				"Add tag": {
					"$$noContext": "Ajouter un tag"
				},
				"Add tag...": {
					"$$noContext": "Ajouter un tag..."
				},
				"Add to a group": {
					"$$noContext": "Ajouter à un groupe"
				},
				"Add user permissions": {
					"$$noContext": "Ajouter des permissions utilisateur"
				},
				"Add value": {
					"$$noContext": "Ajouter une valeur"
				},
				"Added {{ $count }} processor": {
					"$$noContext": ["Ajouter {{ $count }} processeur", "Ajouter {{ $count }} processeurs"]
				},
				"Adding users to group": {
					"$$noContext": "Ajout des utilisateurs au groupe"
				},
				"Additional data processing components": {
					"$$noContext": "Composants additionnels de traitement de données"
				},
				"Additional styles for the portal": {
					"$$noContext": "Règles de style supplémentaires pour le portail"
				},
				"Addresses": {
					"inspire metadata template": "Adresses"
				},
				"Administrative units": {
					"inspire metadata template": "Unités administratives"
				},
				"Administrator email address": {
					"$$noContext": "Adresse e-mail de l'administrateur"
				},
				"Advanced pages": {
					"$$noContext": "Pages complexes"
				},
				"After setting the harvester, click <em>preview</em> to get a quick peek at some datasets": {
					"$$noContext": "Après avoir configuré un moissonneur, cliquez sur <em>prévisualisation</em> pour avoir un aperçu rapide de quelques jeux de données."
				},
				"Aggregate series in a single dataset": {
					"$$noContext": "Agréger les séries dans un seul jeu de données"
				},
				"Aggregation on a field": {
					"$$noContext": "Agrégation sur un champ"
				},
				"Aggregation operation": {
					"$$noContext": "Opération d'agrégation"
				},
				"Aggregation operations": {
					"$$noContext": "Opérations d'agrégation"
				},
				"Agricultural and aquaculture facilities": {
					"inspire metadata template": "Installations agricoles et aquacoles"
				},
				"Align month with label": {
					"$$noContext": "Aligner le mois avec le label"
				},
				"All available data": {
					"$$noContext": "Toutes les données disponibles"
				},
				"All datasets": {
					"$$noContext": "Tous les jeux de données"
				},
				"All datasets being published have the queued status": {
					"$$noContext": "Tous les jeux de données en cours de publication sont en file d'attente"
				},
				"All dates and times are in {{tz}} time.": {
					"$$noContext": "Toutes les dates et heures sont affichées dans le fuseau horaire {{tz}}."
				},
				"All dates and times for dataset {{datasetId}} are in {{tz}} time.": {
					"$$noContext": "Toutes les dates et heures du jeu de données {{datasetId}} sont affichées dans le fuseau horaire {{tz}}."
				},
				"All distributed datasets are restricted by default.": {
					"$$noContext": "Tous les jeux de données sont distribués en accès restreint par défaut."
				},
				"All done!": {
					"$$noContext": "C'est fait !"
				},
				"All dots and shapes are displayed, in a single color": {
					"$$noContext": "Tous les points et formes sont affichés dans une couleur unique"
				},
				"All fields are required.": {
					"$$noContext": "Tous les champs sont obligatoires."
				},
				"All invitations sent successfully. You can now give rights to these users.": {
					"$$noContext": "Toutes les invitations ont été envoyées. Vous pouvez donner des droits à ces utilisateurs. "
				},
				"All subdomains": {
					"$$noContext": "Tous les sous-domaines"
				},
				"All usages on the subdomain will also be counted in your usage and so cannot be set above your own usage limits. They represent the maximum usage by all users of the subdomain.": {
					"$$noContext": "Tous les usages sur le sous-domaine seront aussi comptés dans votre usage et ne peuvent pas dépasser vos limites. Ils représentent l'usage maximum autorisé par tous les utilisateurs du sous-domaine."
				},
				"All users added to the group": {
					"$$noContext": "Tous les utilisateurs ajoutés au groupe"
				},
				"All your datasets at a glance": {
					"$$noContext": "Tous vos jeux de données en un coup d'oeil"
				},
				"All your harvesters at a glance": {
					"$$noContext": "Vision globale sur tous vos moissonneurs"
				},
				"Allow multiple selection": {
					"$$noContext": "Autoriser la sélection multiple"
				},
				"Allow multiple selection in filters": {
					"$$noContext": "Sélection multiple dans les filtres"
				},
				"Allow users to sign up": {
					"$$noContext": "Autoriser les utilisateurs à s'inscrire au domaine"
				},
				"Alphabetical order": {
					"$$noContext": "Ordre alphabétique"
				},
				"Alphabetically": {
					"$$noContext": "Alphabétique"
				},
				"Alphanumeric ascending": {
					"$$noContext": "Alphanumérique ascendant"
				},
				"Alphanumeric descending": {
					"$$noContext": "Alphanumérique descendant"
				},
				"Alternate serie title": {
					"$$noContext": "Titre de la série"
				},
				"Alternative exports": {
					"$$noContext": "Exports alternatifs"
				},
				"Ampere": {
					"$$noContext": "Ampère"
				},
				"An API key is required": {
					"$$noContext": "Une clé d'API est nécessaire"
				},
				"An URL where your work can be accessed publicly": {
					"$$noContext": "Une URL où votre travail est accessible publiquement"
				},
				"An analysis request hit the maximum number of results limit. Returned data is incomplete and not trustworthy.": {
					"$$noContext": "Une requête d'analyse a atteint le nombre limite de résultats. Les données renvoyées sont incomplètes et non fiables. "
				},
				"An application name is required": {
					"$$noContext": "Le nom de l'application est nécessaire"
				},
				"An e-mail change was requested less than 15 minutes ago. Try again later.": {
					"API error message": "Un changement d'email a été demandé il y a moins de 15 minutes. Réessayez plus tard."
				},
				"An email has been sent to your new address to confirm the change.": {
					"$$noContext": "Un email de confirmation a été envoyé sur votre nouvelle adresse"
				},
				"An error occurred when creating the domain.": {
					"$$noContext": "Une erreur est apparue lors de la création du domaine."
				},
				"An error occurred while adding permission '{permission}' to group {group}.": {
					"$$noContext": "Une erreur est survenue lors de l'ajout de '{permission}' au groupe {group}."
				},
				"An error occurred while adding permission '{permission}' to user {username}.": {
					"$$noContext": "Une erreur est survenue lors de l'ajout de '{permission}' à l'utilisateur {username}."
				},
				"An error occurred while adding {username} to group {group}.": {
					"$$noContext": "Une erreur est survenue lors de l'ajout de {username} au groupe {group}."
				},
				"An error occurred while removing all permissions from group {group}.": {
					"$$noContext": "Une erreur est survenue lors de la suppression des permissions du groupe {group}."
				},
				"An error occurred while removing all permissions from user {username}.": {
					"$$noContext": "Une erreur est survenue lors de la suppression des permissions de l'utilisateur {username}."
				},
				"An error occurred while removing the '{permission}' permission from group {group}.": {
					"$$noContext": "Une erreur est survenue lors de la suppression de la permission '{permission}' du groupe {group}."
				},
				"An error occurred while removing the '{permission}' permission from user {username}.": {
					"$$noContext": "Une erreur est survenue lors de la suppression de la permission '{permission}' de l'utilisateur {username}."
				},
				"An error occurred while removing {username} from group {group}.": {
					"$$noContext": "Une erreur est survenue lors de la suppression de {username} du groupe {group}."
				},
				"An unknown error occurred while trying to delete the group {group}. Please contact the support for assistance.": {
					"$$noContext": "Une erreur inconnue est survenue lors de la suppression du groupe {group}. Contactez le support pour obtenir de l'aide. "
				},
				"An unknown error occurred while trying to delete the group. Please contact the support for assistance.": {
					"$$noContext": "Une erreur inconnue est survenue lors de la suppression du groupe. Contactez le support pour obtenir de l'aide. "
				},
				"An unknown error occurred while trying to delete the reuse. Please contact the support for assistance.": {
					"$$noContext": "Une erreur inconnue est survenue lors de la suppression de la réutilisation. Contactez le support pour obtenir de l'aide. "
				},
				"An unknown error occurred while trying to delete the user {username}. Please contact the support for assistance.": {
					"$$noContext": "Une erreur inconnue est survenue lors de la suppression de l'utilisateur {username}. Contactez le support pour obtenir de l'aide. "
				},
				"An unknown error occurred while trying to delete the user. Please contact the support for assistance.": {
					"$$noContext": "Une erreur inconnue est survenue lors de la suppression de l'utilisateur. Contactez le support pour obtenir de l'aide. "
				},
				"An unknown error occurred while trying to reject the reuse. Please contact the support for assistance.": {
					"$$noContext": "Une erreur inconnue est survenue lors du rejet de la réutilisation. Contactez le support pour obtenir de l'aide. "
				},
				"An unknown error occurred while trying to send your message. Please try again later or send it directly to support@data4citizen.com": {
					"$$noContext": "Une erreur inconnue s'est produite lors de l'envoi de votre message. Veuillez réessayer plus tard ou l'envoyer directement à support@data4citizen.com"
				},
				"Analyze": {
					"$$noContext": "Analyse"
				},
				"Any": {
					"$$noContext": "Tous"
				},
				"Api key parameter name": {
					"$$noContext": "Nom du paramètre de clé d'API"
				},
				"Appearance": {
					"$$noContext": "Apparence"
				},
				"Applications": {
					"$$noContext": "Applications"
				},
				"Apply": {
					"$$noContext": "Appliquer"
				},
				"Approve this access request": {
					"$$noContext": "Accepter cette demande d'accès"
				},
				"Approve this reuse": {
					"$$noContext": "Approuver la réutilisation"
				},
				"Apr": {
					"$$noContext": "avr"
				},
				"April": {
					"$$noContext": "avril"
				},
				"Arcgis server response is invalid": {
					"$$noContext": "La réponse du serveur Arcgis est invalide"
				},
				"Archived feedback": {
					"$$noContext": "Contributions archivées"
				},
				"Are you sure you want to delete permanently this attachment?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer cette pièce jointe ?"
				},
				"Are you sure you want to delete permanently this export?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer cet export ?"
				},
				"Are you sure you want to delete this snapshot?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer ce snapshot ?"
				},
				"Are you sure you want to delete your dataset and everything in it?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer votre jeu de données et tout ce qu'il contient ?"
				},
				"Are you sure you want to proceed with this action?": {
					"$$noContext": "Êtes vous sûr de vouloir continuer ?"
				},
				"Are you sure you want to reject this reuse? If so please enter a reason below.": {
					"$$noContext": "Êtes-vous sûr de vouloir refuser cette réutilisation ? Si oui, vous pouvez préciser la raison ci-dessous."
				},
				"Are you sure you want to remove \"{username}\" from all groups?": {
					"$$noContext": "Etes-vous sûr de vouloir supprimer \"{username}\" de tous les groupes ?"
				},
				"Are you sure you want to remove \"{username}\" from the group \"{group}\"?": {
					"$$noContext": "Etes-vous sûr de vouloir supprimer \"{username}\" du groupe \"{group}\" ?"
				},
				"Are you sure you want to remove all permissions from \"{username}\"?": {
					"$$noContext": "Etes-vous sûr de vouloir supprimer toutes les permissions de \"{username}\" ?"
				},
				"Are you sure you want to remove all permissions from group \"{group}\"?": {
					"$$noContext": "Etes-vous sûr de vouloir supprimer toutes les permissions du groupe \"{group}\" ?"
				},
				"Are you sure you want to remove the application \"{application}\"?": {
					"$$noContext": "Êtes vous sûr de vouloir supprimer l'application \"{application}\" ?"
				},
				"Are you sure you want to remove the page from the subdomain?": {
					"$$noContext": "Êtes vous sûr de vouloir retirer la page du sous-domaine ?"
				},
				"Are you sure you want to remove the permission \"{permission}\" for user \"{username}\"?": {
					"$$noContext": "Etes-vous sûr de vouloir supprimer la permission \"{permission}\" de l'utilisateur \"{username}\" ?"
				},
				"Are you sure you want to remove the permission \"{permission}\" from group \"{group}\"?": {
					"$$noContext": "Etes-vous sûr de vouloir supprimer la permission \"{permission}\" du groupe \"{group}\" ?"
				},
				"Are you sure you want to remove this dataset from the subdomain?": {
					"$$noContext": "Êtes vous sûr de vouloir retirer ce jeu de données du sous-domaine ?"
				},
				"Are you sure you want to remove this identity?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer cette identité ?"
				},
				"Are you sure you want to revoke the application \"{application}\"? This application will no longer be able to access the platform on your behalf.": {
					"$$noContext": "Êtes vous sûr de vouloir révoquer l'application \"{application}\" ? Cette application ne pourra plus accéder à la plateforme en votre nom."
				},
				"Are you sure you want to revoke this API key?": {
					"$$noContext": "Êtes vous sûr de vouloir révoquer cette clé d'API ?"
				},
				"Are you sure you want to unpublish this dataset?": {
					"$$noContext": "Êtes-vous sûr de vouloir dépublier votre jeu de données ?"
				},
				"Are you sure?": {
					"$$noContext": "Êtes-vous sûr ?"
				},
				"Area": {
					"$$noContext": "Zone"
				},
				"Area charts": {
					"$$noContext": "aires"
				},
				"Area management/restriction/regulation zones and reporting units": {
					"inspire metadata template": "Zones de gestion, de restriction ou de réglementation et unités de déclaration"
				},
				"Area spline": {
					"$$noContext": "Zone et courbe"
				},
				"As a developer, you can register an application on this domain; you will be provided with a client identifier and a client secret that you can use to provide OAuth2 authorization.": {
					"$$noContext": "Si vous êtes un développeur, vous pouvez enregister une application sur ce domaine; il vous sera alors fourni un ID client et un secret client que vous pourrez utiliser pour proposer l'autorisation par OAuth2 dans votre application."
				},
				"Ascending order": {
					"$$noContext": "Ordre ascendant"
				},
				"At this minute": {
					"$$noContext": "À cette minute"
				},
				"At this time": {
					"$$noContext": "À cette heure"
				},
				"Atmospheric conditions": {
					"inspire metadata template": "Conditions atmosphériques"
				},
				"Attachments": {
					"$$noContext": "Pièces jointes"
				},
				"Attribution": {
					"$$noContext": "Attribution"
				},
				"Attributions": {
					"$$noContext": "Attributions"
				},
				"Aug": {
					"$$noContext": "août"
				},
				"August": {
					"$$noContext": "août"
				},
				"Authenticate URL": {
					"$$noContext": "URL d'authentification"
				},
				"Authenticated domain users": {
					"$$noContext": "Utilisateurs du domaine authentifiés"
				},
				"Authentication type": {
					"$$noContext": "Type d'authentification"
				},
				"Authorize": {
					"$$noContext": "Autoriser"
				},
				"Authorized applications": {
					"$$noContext": "Applications autorisées"
				},
				"Authorized parameters": {
					"$$noContext": "Paramètres autorisés"
				},
				"Auto-geolocation": {
					"$$noContext": "Géolocalisation automatique"
				},
				"Automatically computes the geographic area covered by the dataset": {
					"$$noContext": "Calculer automatiquement la zone géographique couverte par le jeu de données"
				},
				"Automatically granted": {
					"$$noContext": "Attribuée automatiquement"
				},
				"Automatically guess facets (experimental)": {
					"$$noContext": "Déterminer les facettes automatiquement (expérimental)"
				},
				"Available entry points": {
					"$$noContext": "Points d'entrée disponibles"
				},
				"Available fields": {
					"$$noContext": "Champs disponibles"
				},
				"Average": {
					"$$noContext": "Moyenne"
				},
				"Axis Precision": {
					"$$noContext": "Précision de l'axe"
				},
				"Axis step": {
					"$$noContext": "Pas sur l'axe"
				},
				"B": {
					"$$noContext": "o"
				},
				"Back": {
					"$$noContext": "Retour"
				},
				"Back to catalog": {
					"$$noContext": "Retour au catalogue"
				},
				"Bad request: please retry the request later or contact the administrator.": {
					"$$noContext": "Mauvaise requête : réessayez la requête plus tard ou contactez un administrateur. "
				},
				"Bar": {
					"$$noContext": "Bar"
				},
				"Bar chart": {
					"$$noContext": "Barres"
				},
				"Bar charts": {
					"$$noContext": "Barres"
				},
				"Base URL": {
					"$$noContext": "URL de base"
				},
				"Base URL is required": {
					"$$noContext": "L'URL de base est obligatoire"
				},
				"Base shape color on": {
					"$$noContext": "Baser la couleur de la forme sur"
				},
				"Basemap": {
					"$$noContext": "Fond de carte"
				},
				"Basic authentication": {
					"$$noContext": "Authentification simple"
				},
				"Before downloading this resource, you need to read and accept the <a href=\"/conditions/\" target=\"_blank\">terms and conditions</a>.": {
					"$$noContext": "Avant de télécharger cette ressource, vous devez lire et accepter les <a href=\"/conditions/\" target=\"_blank\">conditions générales d'utilisation</a>."
				},
				"Better overview of your datasets": {
					"$$noContext": "Un meilleur résumé de vos jeux de données"
				},
				"Bio-geographical regions": {
					"inspire metadata template": "Régions biogéographiques"
				},
				"Black": {
					"$$noContext": "Noir"
				},
				"Blue - Red": {
					"$$noContext": "Bleu - Rouge"
				},
				"Boost": {
					"$$noContext": "Boost"
				},
				"Bound value can't be higher than next top bound value or max value.": {
					"$$noContext": "Une borne ne peut être supérieure à la borne suivante ou à la valeur maximum."
				},
				"Bound value can't be lower than previous top bound value or min value.": {
					"$$noContext": "Une borne ne peut être inférieure à la borne supérieure précédente ou à la valeur minimum."
				},
				"Boxplot": {
					"$$noContext": "Boîte à moustaches"
				},
				"Boxplot charts": {
					"$$noContext": "Boîtes à moustaches"
				},
				"Break down series": {
					"$$noContext": "Ventiler les séries"
				},
				"Buildings": {
					"inspire metadata template": "Bâtiments"
				},
				"By default, the new subdomain will not be open to anonymous users. Choose this option to inherit this setting from the parent domain.": {
					"$$noContext": "Par défaut, le nouveau sous domaine ne sera pas ouvert aux utilisateurs anonymes. Activer cette option pour copier cette configuration du domaine principal."
				},
				"By modifying the dataset identifier, you will potentially break any third-party application using it, and any past embedded visualization from it won't work anymore.": {
					"$$noContext": "En modifiant l'identifiant du jeu de données, les applications tierces l'utilisant risquent de ne plus fonctionner, et toute intégration de visualisation effectuée par le passé deviendra inopérante."
				},
				"By subscribing to this dataset, you can receive email notifications from the dataset's publisher if important changes happen.": {
					"$$noContext": "En vous abonnant à ce jeu de données, vous pourrez recevoir des notifications par email de la part du producteur de ce jeu de données si des changements importants ont lieu."
				},
				"Byte": {
					"$$noContext": "Octets"
				},
				"CKAN Group": {
					"$$noContext": "Groupe CKAN"
				},
				"CSS Style": {
					"$$noContext": "Style CSS"
				},
				"CSV File resource field": {
					"$$noContext": "Champs contenant le nom du fichier CSV"
				},
				"CSV uses semicolon (;) as a separator.": {
					"$$noContext": "Le CSV utilise le point-virgule (;) comme séparateur."
				},
				"CSW URL": {
					"$$noContext": "URL CSW"
				},
				"CSW URL is required": {
					"$$noContext": "L'URL CSW est requise"
				},
				"Cadastral parcels": {
					"inspire metadata template": "Parcelles cadastrales"
				},
				"Calendar": {
					"$$noContext": "Calendrier"
				},
				"Can be either jpeg or png.": {
					"$$noContext": "Peut être soit du jpeg, soit du png."
				},
				"Can not create Geopoint": {
					"$$noContext": "Impossible de créer un point géo"
				},
				"Can only contain alphanumerical characters and hyphens": {
					"$$noContext": "Ne peut contenir que des caractères alphanumériques et des tirets"
				},
				"Can only contain lowercase alphanumerical characters and hyphens.": {
					"$$noContext": "Ne peut contenir que des caractères minuscules alphanumériques et des tirets."
				},
				"Can't find someone?": {
					"$$noContext": "Impossible de trouver quelqu'un ?"
				},
				"Cancel": {
					"$$noContext": "Annuler"
				},
				"Cancel area filter": {
					"$$noContext": "Annuler le filtre par zone"
				},
				"Cancel editing, discards all changes.": {
					"$$noContext": "Annuler les modifications."
				},
				"Cannot extract data": {
					"$$noContext": "Impossible d'extraire les données"
				},
				"Cannot geocode": {
					"$$noContext": "Impossible de géocoder"
				},
				"Cannot geocode: address + city must not exceed 200 characters": {
					"$$noContext": "Impossible de géocoder : le champ adresse + ville ne peut pas dépasser 200 caractères"
				},
				"Cannot geocode: record too big for the BAN API": {
					"$$noContext": "Impossible de géocoder : l'enregistrement est trop gros pour l'API de la BAN"
				},
				"Caption": {
					"$$noContext": "Légende"
				},
				"Catalog RSS feed": {
					"$$noContext": "Flux RSS du catalogue"
				},
				"Catalog card": {
					"$$noContext": "Carte de catalogue"
				},
				"Catalog export (CSV)": {
					"$$noContext": "Export du catalogue (CSV)"
				},
				"Catalog export (RDF Turtle)": {
					"$$noContext": "Export du catalogue (RDF turle)"
				},
				"Catalog export (RDF XML)": {
					"$$noContext": "Export du catalogue (RDF XML)"
				},
				"Catalog export (XLS)": {
					"$$noContext": "Export du catalogue (XLS)"
				},
				"Categories": {
					"$$noContext": "Catégories"
				},
				"Categories palette": {
					"$$noContext": "Palette des catégories"
				},
				"Celsius": {
					"$$noContext": "Celsius"
				},
				"Centimeter": {
					"$$noContext": "Centimètre"
				},
				"Change": {
					"$$noContext": "Changer"
				},
				"Change email address / username": {
					"$$noContext": "Changer l'adresse email / identifiant"
				},
				"Change filter": {
					"$$noContext": "Changer le filtre"
				},
				"Change my email address": {
					"$$noContext": "Changer mon adresse email"
				},
				"Change my information": {
					"$$noContext": "Changez mes informations"
				},
				"Change my password": {
					"$$noContext": "Changer mon mot de passe"
				},
				"Change template": {
					"$$noContext": "Changer le modèle"
				},
				"Changed attachments": {
					"$$noContext": "Modification des pièces jointes"
				},
				"Changed dataset schema": {
					"$$noContext": "Modification du schéma"
				},
				"Changed federation parameters": {
					"$$noContext": "Modification des paramètres de fédération"
				},
				"Changed metadata": {
					"$$noContext": "Métadonnées modifiées"
				},
				"Changed processors configuration": {
					"$$noContext": "Modification de la configuration des processeurs"
				},
				"Changed resources": {
					"$$noContext": "Modification des ressources"
				},
				"Changes saved": {
					"$$noContext": "Modifications sauvegardées"
				},
				"Chart Title": {
					"$$noContext": "Titre du graphique"
				},
				"Chart title": {
					"$$noContext": "Titre du graphique"
				},
				"Choose a password": {
					"$$noContext": "Choisissez un mot de passe"
				},
				"Choose a template": {
					"$$noContext": "Choisir un modèle"
				},
				"Choose template": {
					"$$noContext": "Choix du modèle"
				},
				"Choropleth": {
					"$$noContext": "Choroplèthe"
				},
				"Choropleth palette": {
					"$$noContext": "Palette choroplèthe"
				},
				"CitadelJSON is a format developed by the <a href=\"http://www.citadelonthemove.eu/\" target=\"_blank\">Citadel On The Move project</a> to easily reuse data inside applications. More information is available <a href=\"https://github.com/CitadelOnTheMove/agt/wiki\" target=\"_blank\">on the CitadelJSON wiki</a>.": {
					"$$noContext": "CitadelJSON est un format développé par le <a href=\"http://www.citadelonthemove.eu/\" target=\"_blank\">projet Citadel On The Move</a> afin de pouvoir facilement réutiliser les données dans des applications. Plus d'information disponible sur le <a href=\"https://github.com/CitadelOnTheMove/agt/wiki\" target=\"_blank\">wiki CitadelJSON</a>."
				},
				"Clean cache": {
					"$$noContext": "Nettoyer le cache"
				},
				"Clean the resource cache": {
					"$$noContext": "Nettoyer le cache de la ressource"
				},
				"Clear": {
					"$$noContext": "Effacer"
				},
				"Clear all": {
					"$$noContext": "Tout effacer"
				},
				"Clear all of the user's permissions": {
					"$$noContext": "Effacer toutes les permissions de l'utilisateur"
				},
				"Clear filter": {
					"$$noContext": "Enlever le filtre"
				},
				"Clear recurring runs": {
					"$$noContext": "Supprimer les planifications"
				},
				"Clear search box.": {
					"$$noContext": "Vider le champ de recherche."
				},
				"Click and drag to draw circle": {
					"$$noContext": "Cliquer-glisser pour dessiner un cercle"
				},
				"Click and drag to draw rectangle": {
					"$$noContext": "Cliquer-glisser pour dessiner un rectangle"
				},
				"Click cancel to undo changes": {
					"$$noContext": "Cliquez sur annuler pour annuler les modifications"
				},
				"Click first point to close this shape": {
					"$$noContext": "Cliquez sur le premier point pour fermer la forme"
				},
				"Click here to create a subdomain in minutes and start distributing data right away!": {
					"$$noContext": "Cliquez ici pour créer un sous-domaine en quelques minutes et commencez à distribuer vos données ! "
				},
				"Click last point to finish line": {
					"$$noContext": "Cliquez sur le dernier point pour compléter la ligne"
				},
				"Click map to place marker": {
					"$$noContext": "Cliquez sur la carte pour placer un marqueur"
				},
				"Click on <em>Edit my filters list</em> and choose exactly which filters will be displayed.": {
					"$$noContext": "Cliquez sur <em>Éditer ma liste de filtre</em> et choisissez exactement les filtres que vous voulez afficher."
				},
				"Click on a shape to delete it, then apply": {
					"$$noContext": "Cliquez sur une forme pour la supprimer et appliquez"
				},
				"Click to collapse": {
					"$$noContext": "Cliquez pour replier"
				},
				"Click to continue drawing line": {
					"$$noContext": "Cliquez pour continuer à dessiner la ligne"
				},
				"Click to continue drawing shape": {
					"$$noContext": "Cliquez pour continuer à dessiner la forme"
				},
				"Click to expand": {
					"$$noContext": "Cliquez pour déplier"
				},
				"Click to fold": {
					"$$noContext": "Cliquez pour replier"
				},
				"Click to go to the datasets": {
					"$$noContext": "Cliquez pour aller aux jeux de données"
				},
				"Click to go to the harvested datasets": {
					"$$noContext": "Cliquez pour aller à la liste des jeux de données moissonnés"
				},
				"Click to start drawing line": {
					"$$noContext": "Cliquez pour commencer à dessiner la ligne"
				},
				"Click to start drawing shape": {
					"$$noContext": "Cliquez pour commencer à dessiner la forme"
				},
				"Click to unfold": {
					"$$noContext": "Cliquez pour déplier"
				},
				"Client ID": {
					"$$noContext": "ID client"
				},
				"Client Secret": {
					"$$noContext": "Secret client"
				},
				"Client secret": {
					"$$noContext": "Secret client"
				},
				"Close": {
					"$$noContext": "Fermer"
				},
				"Close color picker": {
					"$$noContext": "Fermer le sélecteur de couleurs"
				},
				"Close icon picker": {
					"$$noContext": "Fermer le sélecteur d'icône"
				},
				"Close menu": {
					"$$noContext": "Fermer le menu"
				},
				"Cluster": {
					"$$noContext": "Cluster"
				},
				"Cluster border": {
					"$$noContext": "Bordure des clusters"
				},
				"Cluster border color": {
					"$$noContext": "Couleur des bordures du cluster"
				},
				"Cluster color": {
					"$$noContext": "Couleur du cluster"
				},
				"Cluster size calculation": {
					"$$noContext": "Calcul des tailles de clusters"
				},
				"Cluster style": {
					"$$noContext": "Style des clusters"
				},
				"Collapse panel": {
					"$$noContext": "Replier le panneau"
				},
				"Collapse the search bar": {
					"$$noContext": "Replier la barre de recherche"
				},
				"Color": {
					"$$noContext": "Couleur"
				},
				"Color by category": {
					"$$noContext": "Couleur par catégorie"
				},
				"Color thresholds": {
					"$$noContext": "Seuil de couleur"
				},
				"Color wheel": {
					"$$noContext": "Roue colorimétrique"
				},
				"Colors": {
					"$$noContext": "Couleurs"
				},
				"Colors range": {
					"$$noContext": "Gamme de couleurs"
				},
				"Column chart": {
					"$$noContext": "Colonnes"
				},
				"Column range": {
					"$$noContext": "Plage de colonnes"
				},
				"Combination of clusterprecision and distance parameter is too high. Try with lower clusterprecision and/or higher distance.": {
					"API error message": "La combinaison des paramètres clusterprecision et distance est trop haute. Essayez avec un paramètre clusterprecision plus bas et/ou une distance plus importante."
				},
				"Comments": {
					"$$noContext": "Commentaires"
				},
				"Complete dataset": {
					"$$noContext": "Jeu de données entier"
				},
				"Computed from data": {
					"$$noContext": "Calculée automatiquement à partir des données"
				},
				"Computing": {
					"$$noContext": "Calcul"
				},
				"Computing mode": {
					"$$noContext": "Mode de calcul"
				},
				"Concentration": {
					"$$noContext": "Concentration"
				},
				"Confidential": {
					"$$noContext": "Confidentiel"
				},
				"Configuration": {
					"$$noContext": "Configuration"
				},
				"Configuration :": {
					"$$noContext": "Configuration: "
				},
				"Configure": {
					"$$noContext": "Configurer"
				},
				"Configuring your harvester": {
					"$$noContext": "Configurez votre moissonneur"
				},
				"Confirm new password": {
					"$$noContext": "Confirmation du mot de passe"
				},
				"Confirm password": {
					"$$noContext": "Confirmation du mot de passe"
				},
				"Connection Error : {msg}": {
					"Exception message": "Erreur de connexion : {msg}"
				},
				"Connection identifier": {
					"$$noContext": "Identifiant de connexion"
				},
				"Connection identifier is required": {
					"$$noContext": "L'identifiant de connexion est obligatoire"
				},
				"Constant value": {
					"$$noContext": "Valeur constante"
				},
				"Constraint language": {
					"$$noContext": "Contraindre la langue"
				},
				"Contact address": {
					"$$noContext": "Adresse du contact"
				},
				"Contact email": {
					"$$noContext": "Email du contact"
				},
				"Contact form": {
					"$$noContext": "Formulaire de contact"
				},
				"Contact name": {
					"$$noContext": "Nom du contact"
				},
				"Contact page": {
					"$$noContext": "Page de contact"
				},
				"Contact position": {
					"$$noContext": "Poste du contact"
				},
				"Content": {
					"$$noContext": "Contenu"
				},
				"Content distribution in progress": {
					"$$noContext": "Distribution de contenu en cours"
				},
				"Contributor": {
					"$$noContext": "Contributeur"
				},
				"Coordinate reference systems": {
					"inspire metadata template": "Systèmes de référence de coordonnées"
				},
				"Copied": {
					"$$noContext": "Copié"
				},
				"Copy": {
					"$$noContext": "Copier"
				},
				"Copy to clipboard": {
					"$$noContext": "Copier dans le presse-papier"
				},
				"Could not delete group": {
					"$$noContext": "Impossible de supprimer le groupe"
				},
				"Could not delete reuse": {
					"$$noContext": "Impossible de supprimer la réutilisation"
				},
				"Could not delete user": {
					"$$noContext": "Impossible de supprimer l'utilisateur"
				},
				"Could not reject reuse": {
					"$$noContext": "Impossible de rejeter la réutilisation"
				},
				"Could not send message to the support": {
					"$$noContext": "Impossible d'envoyer le message au support"
				},
				"Count": {
					"$$noContext": "Compte"
				},
				"Count ascending": {
					"$$noContext": "Compte ascendant"
				},
				"Count descending": {
					"$$noContext": "Compte descendant"
				},
				"Create a new snapshot": {
					"$$noContext": "Créer un nouveau snapshot"
				},
				"Create a subdomain in a few clicks": {
					"$$noContext": "Créez un sous-domaine en quelques clics"
				},
				"Create my account": {
					"$$noContext": "Créer mon compte utilisateur"
				},
				"Created": {
					"$$noContext": "Créé"
				},
				"Creation": {
					"$$noContext": "Création"
				},
				"Creator": {
					"$$noContext": "Créateur"
				},
				"Cubic centimeter": {
					"$$noContext": "Centimètre cube"
				},
				"Cubic meter": {
					"$$noContext": "Mètre cube"
				},
				"Cubic meter per day": {
					"$$noContext": "Mètre cube par jour"
				},
				"Cubic meter per hour": {
					"$$noContext": "Mètre cube par heure"
				},
				"Cubic meter per second": {
					"$$noContext": "Mètre cube par seconde"
				},
				"Cumulative": {
					"$$noContext": "Cumulative"
				},
				"Currency": {
					"$$noContext": "Monnaie"
				},
				"Current API calls usage": {
					"$$noContext": "Usage actuel d'appels d'API"
				},
				"Current action:": {
					"$$noContext": "Action en cours :"
				},
				"Current datasets usage": {
					"$$noContext": "Usage actuel de jeux de données"
				},
				"Current icon is {iconName}. Open icon picker": {
					"$$noContext": "L'icône courante est {iconName}. Ouvrir le sélecteur d'icône"
				},
				"Current password": {
					"$$noContext": "Mot de passe actuel"
				},
				"Current password is incorrect.": {
					"$$noContext": "Le mot de passe actuel ne correspond pas."
				},
				"Current records usage": {
					"$$noContext": "Usage actuel d'enregistrements"
				},
				"Current usage": {
					"$$noContext": "Usage actuel"
				},
				"Currently editing language": {
					"$$noContext": "Langage d'édition"
				},
				"Currently not published": {
					"$$noContext": "Actuellement non publié"
				},
				"Currently published": {
					"$$noContext": "Actuellement publié"
				},
				"Custom": {
					"$$noContext": "Personnalisé"
				},
				"Custom (WMS)": {
					"$$noContext": "Personnalisé (WMS)"
				},
				"Custom CSS and HTML": {
					"$$noContext": "Customisation CSS et HTML"
				},
				"Custom HTML tooltip": {
					"$$noContext": "Infobulle personnalisée en HTML"
				},
				"Custom expression": {
					"$$noContext": "Expression"
				},
				"Custom frequency": {
					"$$noContext": "Fréquence personnalisée"
				},
				"Custom metadata": {
					"$$noContext": "Métadonnées personnalisées"
				},
				"Custom palette based on a field's values": {
					"$$noContext": "Utiliser une palette personnalisée à partir des valeurs d'un champ"
				},
				"Custom size": {
					"$$noContext": "Taille personnalisée"
				},
				"Custom tab preview": {
					"$$noContext": "Prévisualiser"
				},
				"Custom tooltip code returned an error": {
					"$$noContext": "Le code de l'infobulle personnalisée a renvoyé une erreur"
				},
				"Custom value": {
					"$$noContext": "Valeur pers."
				},
				"Custom view": {
					"$$noContext": "Vue personnalisée"
				},
				"Custom zoom (optional)": {
					"$$noContext": "Zoom personnalisé (optionnel)"
				},
				"DCAT metadata": {
					"$$noContext": "Métadonnées DCAT"
				},
				"Daily reports": {
					"$$noContext": "Rapports quotidiens"
				},
				"Dark blue": {
					"$$noContext": "Bleu foncé"
				},
				"Dark cherry": {
					"$$noContext": "Cerise foncé"
				},
				"Dark fuchsia": {
					"$$noContext": "Fuschia foncé"
				},
				"Dark green": {
					"$$noContext": "Vert foncé"
				},
				"Dark grey": {
					"$$noContext": "Gris foncé"
				},
				"Dark oil": {
					"$$noContext": "Pétrole foncé"
				},
				"Dark orange": {
					"$$noContext": "Orange foncé"
				},
				"Dark purple": {
					"$$noContext": "Violet foncé"
				},
				"Dark royal blue": {
					"$$noContext": "Bleu roi foncé"
				},
				"Dark slate": {
					"$$noContext": "Ardoise foncé"
				},
				"Dark vermilion": {
					"$$noContext": "Vermillon foncé"
				},
				"Dark yellow": {
					"$$noContext": "Jaune foncé"
				},
				"Data": {
					"$$noContext": "Données"
				},
				"Data bonanza": {
					"$$noContext": "Aubaine sur les données"
				},
				"Data is aggregated to represent density based on a variable": {
					"$$noContext": "Les données sont agrégées pour représenter la densité basée sur une variable"
				},
				"Data is clustered, with an aggregation option": {
					"$$noContext": "Les données sont regroupées, avec une possibilité d'agrégation"
				},
				"Data is displayed using a color scale based on a variable": {
					"$$noContext": "Les données sont affichées par une échelle de couleur basée sur une variable"
				},
				"Data is displayed using a text — color mapping": {
					"$$noContext": "Les données sont affichées par une correspondance texte — couleur"
				},
				"Data is not visible": {
					"$$noContext": "Données non visibles"
				},
				"Data is visible": {
					"$$noContext": "Données visibles"
				},
				"Data preview": {
					"$$noContext": "Aperçu des données"
				},
				"Data processed": {
					"$$noContext": "Données traitées"
				},
				"Data quality": {
					"$$noContext": "Qualité des données"
				},
				"Dataset": {
					"$$noContext": "Jeu de données"
				},
				"Dataset ID": {
					"$$noContext": "ID du jeu de données"
				},
				"Dataset Identifier": {
					"$$noContext": "Identifiant du jeu de données"
				},
				"Dataset catalog statistics": {
					"$$noContext": "Statistiques du catalogue de jeux de données"
				},
				"Dataset expowsrt ({{ formatLabel }})": {
					"$$noContext": "Export du jeu de données ({{ formatLabel }})"
				},
				"Dataset field": {
					"$$noContext": "Champ jeu de données"
				},
				"Dataset of datasets": {
					"$$noContext": "Jeu de données des jeux de données"
				},
				"Dataset schema": {
					"$$noContext": "Modèle de données"
				},
				"Dataset source or processors have changed.": {
					"$$noContext": "La source du jeu de données ou les processeurs ont été modifiés."
				},
				"Datasets": {
					"$$noContext": "Jeux de données"
				},
				"Datasets published": {
					"$$noContext": "Jeux de données publiés"
				},
				"Datasets unpublished": {
					"$$noContext": "Jeux de données dépubliés"
				},
				"Datasets visibility": {
					"$$noContext": "Visibilité des jeux de données"
				},
				"Datasets with warnings are not harvested and won’t appear on your portal": {
					"$$noContext": "Les jeux de données en erreur ne sont pas moissonnés et n'apparaitront pas sur votre portail"
				},
				"Date (ascending)": {
					"$$noContext": "Date croissante"
				},
				"Date (descending)": {
					"$$noContext": "Date décroissante"
				},
				"Date of the latest data update": {
					"$$noContext": "Date de la dernière mise à jour des données"
				},
				"Dates handling": {
					"$$noContext": "Traitement des dates"
				},
				"Day": {
					"$$noContext": "Jour"
				},
				"Day of month": {
					"$$noContext": "Jour du mois"
				},
				"Day of week": {
					"$$noContext": "Jour de la semaine"
				},
				"Day of year": {
					"$$noContext": "Jour de l'année"
				},
				"Days": {
					"$$noContext": "Jours"
				},
				"Dec": {
					"$$noContext": "déc"
				},
				"December": {
					"$$noContext": "décembre"
				},
				"Decibel": {
					"$$noContext": "Décibel"
				},
				"Deep sea": {
					"$$noContext": "Haute mer"
				},
				"Default : All entry points will be displayed": {
					"$$noContext": "Défaut : Tous les points d'entrée seront affichés"
				},
				"Default : All fields will be displayed": {
					"$$noContext": "Par défaut: tous les champs seront affichés"
				},
				"Default : All media fields will be displayed": {
					"$$noContext": "Par défaut : tous les champs de type média seront affichés"
				},
				"Default metadata": {
					"$$noContext": "Métadonnées par défaut"
				},
				"Default ordering": {
					"$$noContext": "Tri par défaut"
				},
				"Define at which zoom levels the layer should be visible.": {
					"$$noContext": "Choisissez les niveaux de zoom auxquels la couche doit être visible "
				},
				"Define here your subdomain distribution parameters, and you will be able to set the corresponding value for each subdomain": {
					"$$noContext": "Définissez ici vos paramètres de distribution aux sous-domaines et vous serez capable d'attribuer les valeurs correspondantes pour chaque sous-domaine. "
				},
				"Degree": {
					"$$noContext": "Degré"
				},
				"Delete": {
					"$$noContext": "Supprimer"
				},
				"Delete ({{ selectedItemsCount }})": {
					"$$noContext": "Supprimer ({{ selectedItemsCount }})"
				},
				"Delete area filter.": {
					"$$noContext": "Effacer le filtre par zone."
				},
				"Delete chart?": {
					"$$noContext": "Supprimer le graphique ?"
				},
				"Delete dataset": {
					"$$noContext": "Supprimer le jeu de données"
				},
				"Delete font": {
					"$$noContext": "Supprimer la police"
				},
				"Delete font?": {
					"$$noContext": "Supprimer la police ? "
				},
				"Delete harvester": {
					"$$noContext": "Supprimer le moissonneur"
				},
				"Delete image": {
					"$$noContext": "Supprimer l'image"
				},
				"Delete image?": {
					"$$noContext": "Supprimer l'image ?"
				},
				"Delete last point": {
					"$$noContext": "Effacer le dernier point"
				},
				"Delete map": {
					"$$noContext": "Supprimer la carte"
				},
				"Delete map?": {
					"$$noContext": "Supprimer la carte ?"
				},
				"Delete parameter": {
					"$$noContext": "Supprimer le paramètre"
				},
				"Delete selection": {
					"$$noContext": "Supprimer la sélection"
				},
				"Delete this basemap": {
					"$$noContext": "Supprimer ce fond de carte"
				},
				"Delete this dataset theme": {
					"$$noContext": "Supprimer ce thème de jeu de données"
				},
				"Delete this group": {
					"$$noContext": "Supprimer ce groupe"
				},
				"Delete this reuse": {
					"$$noContext": "Supprimer cette réutilisation"
				},
				"Delete this visualization": {
					"$$noContext": "Supprimer cette visualisation"
				},
				"Deleted {{ $count }} processor": {
					"$$noContext": ["Ajouter {{ $count }} processeur", "Ajouter {{ $count }} processeurs"]
				},
				"Deleting": {
					"$$noContext": "Suppression"
				},
				"Deleting harvester": {
					"$$noContext": "Suppression du moissonneur"
				},
				"Deletion": {
					"$$noContext": "Suppression"
				},
				"Density": {
					"$$noContext": "Densité"
				},
				"Depending on the number of datasets, publishing could take some time": {
					"$$noContext": "Suivant le nombre de jeux de données, la publication peut prendre du temps"
				},
				"Depending on the number of datasets, unpublishing could take some time": {
					"$$noContext": "Suivant le nombre de jeux de données, la dépublication peut prendre du temps"
				},
				"Descending order": {
					"$$noContext": "Ordre descendant"
				},
				"Description": {
					"$$noContext": "Description"
				},
				"Design pages on your domain and distribute read-only versions to the subdomains": {
					"$$noContext": "Concevez les pages sur votre domaine et distribuez des versions en lecture seule à vos sous-domaines"
				},
				"Details": {
					"$$noContext": "Détails"
				},
				"Digest about the data world: articles, events, featured datasets and more.": {
					"$$noContext": "Condensé à propos du monde de la data : des articles, des évènements, des jeux de données et plus encore. "
				},
				"Digital information": {
					"$$noContext": "Information digitale"
				},
				"Direct link": {
					"$$noContext": "Lien direct"
				},
				"Direct link and embed": {
					"$$noContext": "Lien direct et intégration"
				},
				"Disable push": {
					"$$noContext": "Désactiver le push"
				},
				"Discard": {
					"$$noContext": "Abandonner"
				},
				"Discard changes": {
					"$$noContext": "Effacer les modifications"
				},
				"Display": {
					"$$noContext": "Affichage"
				},
				"Display caption for this dataset": {
					"$$noContext": "Afficher une légende pour ce jeu de données"
				},
				"Display dataset information card": {
					"$$noContext": "Afficher un volet d'information"
				},
				"Display date-range filter": {
					"$$noContext": "Afficher le filtre de plage de dates"
				},
				"Display fullscreen in view mode": {
					"$$noContext": "Afficher le mode plein écran en mode vue"
				},
				"Display layers and groups visibility control": {
					"$$noContext": "Afficher le contrôle de visibilité des calques et groupes"
				},
				"Display mode selection list.": {
					"$$noContext": "Liste de sélection du type d'affichage."
				},
				"Display modification date": {
					"$$noContext": "Afficher la date de modification"
				},
				"Display only in select zoom levels": {
					"$$noContext": "Afficher uniquement aux niveaux de zoom choisis"
				},
				"Display search box": {
					"$$noContext": "Afficher le champ de recherche"
				},
				"Display the graph legend": {
					"$$noContext": "Afficher la légende du graphe"
				},
				"Display, hide and order filters using drag and drop or your keyboard.": {
					"$$noContext": "Afficher, cacher et réordonner les filtres au clavier ou à la souris."
				},
				"Displays the unit defined in the dataset for the selected field. If no unit has been set by the publisher, nothing is displayed.": {
					"$$noContext": "Affiche l'unité définie dans le jeu de données pour le champ sélectionné. Si aucune unité n'a été associé au champ par l'éditeur, rien n'est affiché."
				},
				"Distance or size": {
					"$$noContext": "Distance ou taille"
				},
				"Distribute": {
					"$$noContext": "Distribuer"
				},
				"Distribute complete or filtered datasets, match parameters between the subdomain's parameters and the datasets' records": {
					"$$noContext": "Distribuez des jeux de données complets ou filtrés, associez des paramètres entre les paramètres des sous-domaines et les enregistrements des jeux de données"
				},
				"Distribute content ({{ selectedItemsCount }})": {
					"$$noContext": "Distribuer du contenu ({{ selectedItemsCount }})"
				},
				"Distribute datasets": {
					"$$noContext": "Distribuer des jeux de données"
				},
				"Distribute pages": {
					"$$noContext": "Distribuer des pages"
				},
				"Distribution options": {
					"$$noContext": "Options de distribution"
				},
				"Distribution parameter": {
					"$$noContext": "Paramètre de distribution"
				},
				"Do you really want to delete this font?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer cette police ?"
				},
				"Do you really want to delete this map?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer cette carte ?"
				},
				"Do you really want to remove all filters for this dataset? Removing all filters will display all records for the distributed dataset.": {
					"$$noContext": "Voulez vous vraiment enlever tous les filtres de ce jeu de données ? Dans ce cas, tous les enregistrements seront disponibles pour le jeu de données distribué."
				},
				"Do your really want to delete this image?": {
					"$$noContext": "Êtes-vous sûr de vouloir supprimer cette image ?"
				},
				"Dollar per kilogram": {
					"$$noContext": "Dollar par kilogramme"
				},
				"Domain": {
					"$$noContext": "Domaine"
				},
				"Domain ID is required": {
					"$$noContext": "L'ID de domaine est requis"
				},
				"Domain ID or URL": {
					"$$noContext": "Identifiant ou URL du domaine"
				},
				"Domain currently under maintenance": {
					"$$noContext": "Domaine en cours de maintenance"
				},
				"Domain distribution parameters": {
					"$$noContext": "Paramètres de distribution de domaine"
				},
				"Domain groups": {
					"$$noContext": "Groupes du domaine"
				},
				"Domain property value": {
					"$$noContext": "Valeur de la propriété du domaine"
				},
				"Done": {
					"$$noContext": "OK"
				},
				"Dot": {
					"$$noContext": "Point"
				},
				"Dots": {
					"$$noContext": "Points"
				},
				"Dots (recommended for high-density datasets)": {
					"$$noContext": "Points (recommandé pour les jeux de données à haute densité)"
				},
				"Dots and shapes": {
					"$$noContext": "Points et formes"
				},
				"Dots are recommended for high density datasets. Icons and marker are recommended for low density datasets.": {
					"$$noContext": "Les points sont recommandés pour les jeux de données à forte densité. Les icônes et les marqueurs sont recommandés pour l'affichage de jeux de données dont la densité est faible."
				},
				"Dots style": {
					"$$noContext": "Style des points"
				},
				"Download": {
					"$$noContext": "Télécharger"
				},
				"Download image": {
					"$$noContext": "Télécharger l'image"
				},
				"Download original file": {
					"$$noContext": "Télécharger le fichier original"
				},
				"Download resources instead of attaching them via URL": {
					"$$noContext": "Télécharger les ressources au lieu de les attacher directement"
				},
				"Download the data": {
					"$$noContext": "Télécharger les données"
				},
				"Download {{ getRecordTitle(image.record) }} - {{ image.index + 1 }} out of {{ images.length }}": {
					"$$noContext": "Télécharger {{ getRecordTitle(image.record) }} - {{ image.index + 1 }} sur {{ images.length }}"
				},
				"Downloads": {
					"$$noContext": "Téléchargements"
				},
				"Drag and drop file here or <button class=\"button button--link\" ng-click=\"triggerInputClick()\"> browse </button>": {
					"$$noContext": "Glissez-déposer le fichier ici ou <button class=\"button button--link\" ng-click=\"triggerInputClick()\">sélectionnez le</button>"
				},
				"Drag and drop files here or <button class=\"button button--link\" ng-click=\"triggerInputClick()\"> browse </button>": {
					"$$noContext": "Glissez-déposer le fichier ici ou <button class=\"button button--link\" ng-click=\"triggerInputClick()\">sélectionnez le</button>"
				},
				"Drag and drop to reorder layers": {
					"$$noContext": "Glissez-déposez pour réordonner les couches"
				},
				"Drag and drop to reorder or add/remove filters": {
					"$$noContext": "Glisser et déposer pour réordonner ou ajouter et supprimer des filtres"
				},
				"Drag handles to edit shape, then apply": {
					"$$noContext": "Déplacer les poignées pour éditer la forme et appliquez"
				},
				"Draw a circle to filter on": {
					"$$noContext": "Dessiner un cercle pour filtrer"
				},
				"Draw a polygon on a map to define the area.": {
					"$$noContext": "Definissez la zone en dessinant un polygone sur une carte."
				},
				"Draw a polygon to filter on": {
					"$$noContext": "Dessiner un polygone pour filtrer"
				},
				"Draw a rectangle to filter on": {
					"$$noContext": "Dessiner un rectangle pour filtrer"
				},
				"Drawn area on the map": {
					"$$noContext": "Zone dessinée sur la carte"
				},
				"Duplicate": {
					"$$noContext": "Dupliquer"
				},
				"Duplicate dataset": {
					"$$noContext": "Dupliquer le jeu de données"
				},
				"Duration": {
					"$$noContext": "Durée"
				},
				"Eastbound longitude": {
					"$$noContext": "Longitude Est"
				},
				"Edit": {
					"$$noContext": "Modifier"
				},
				"Edit area filter.": {
					"$$noContext": "Modifier le filtre par zone."
				},
				"Edit in expert mode": {
					"$$noContext": "Modifier en mode expert"
				},
				"Edit my filters list": {
					"$$noContext": "Éditer ma liste de filtres"
				},
				"Edit my filters list...": {
					"$$noContext": "Éditer ma liste de filtres..."
				},
				"Edit palette": {
					"$$noContext": "Éditer la palette"
				},
				"Edition": {
					"$$noContext": "Édition"
				},
				"Either come back to this page and publish all datasets at once (that means no reviewing).": {
					"$$noContext": "Vous pouvez soit revenir sur cette page et publier tous les jeux de données en une fois (donc pas de revue individuelle). "
				},
				"Elevation": {
					"inspire metadata template": "Altitude"
				},
				"Email": {
					"$$noContext": "Email"
				},
				"Email address": {
					"$$noContext": "Adresse email"
				},
				"Email address can't be used to invite users": {
					"$$noContext": "L'adresse e-mail ne peut être utilisée pour inviter des utilisateurs"
				},
				"Email address is invalid": {
					"$$noContext": "Cette adresse email n'est pas valide"
				},
				"Email adresses": {
					"$$noContext": "Adresses email"
				},
				"Email or username": {
					"$$noContext": "Email ou identifiant"
				},
				"Embed": {
					"$$noContext": "Intégrer"
				},
				"Embed map": {
					"$$noContext": "Carte intégrée"
				},
				"Empty": {
					"$$noContext": "Vide"
				},
				"Enable an additional value for other values": {
					"$$noContext": "Activer une valeur additionnelle correspondant à toutes les autres valeurs"
				},
				"Enable analyze view": {
					"$$noContext": "Activer la vue analyse"
				},
				"Enable calendar view": {
					"$$noContext": "Activer la vue calendrier"
				},
				"Enable custom view": {
					"$$noContext": "Activer la vue personnalisée"
				},
				"Enable images view": {
					"$$noContext": "Activer la vue images"
				},
				"Enable map view": {
					"$$noContext": "Activer la vue carte"
				},
				"Enable push": {
					"$$noContext": "Activer le push"
				},
				"Enable user feedback on this dataset": {
					"$$noContext": "Activer les contributions d'utilisateurs"
				},
				"Enable zooming in and out with the mouse wheel": {
					"$$noContext": "Activer le zoom via la molette de la souris"
				},
				"Enabled": {
					"$$noContext": "Activé"
				},
				"End time": {
					"$$noContext": "Heure de fin"
				},
				"Energy": {
					"$$noContext": "Energie"
				},
				"Energy resources": {
					"inspire metadata template": "Sources d'énergie"
				},
				"Enforce the number of decimals to display": {
					"$$noContext": "Forcer le nombre de décimales à afficher"
				},
				"Enforced parameters": {
					"$$noContext": "Paramètres forcés"
				},
				"English": {
					"$$noContext": "Anglais"
				},
				"Enigma API key": {
					"$$noContext": "Clé d'API Enigma"
				},
				"Enjoy discovering your data!": {
					"$$noContext": "Vous pouvez maintenant explorer vos données !"
				},
				"Enter a URL": {
					"$$noContext": "Saisissez une URL"
				},
				"Enter an image URL": {
					"$$noContext": "Saisir l'URL d'une image"
				},
				"Entered E-mail or username is incorrect": {
					"$$noContext": "L'adresse e-mail ou identifiant est incorrect."
				},
				"Entry Points": {
					"$$noContext": "Points d'entrée"
				},
				"Environmental monitoring facilities": {
					"inspire metadata template": "Installations de suivi environnemental"
				},
				"Error": {
					"$$noContext": "Erreur"
				},
				"Error :": {
					"$$noContext": "Erreur : "
				},
				"Error during processing": {
					"$$noContext": "Erreur lors du traitement"
				},
				"Error type and message": {
					"$$noContext": "Type d'erreur et message associé"
				},
				"Error while adding permission": {
					"$$noContext": "Erreur lors de l'ajout de permission"
				},
				"Error while adding to group": {
					"$$noContext": "Erreur lors de l'ajout au groupe"
				},
				"Error while contacting the service.": {
					"$$noContext": "Erreur lors de l'appel au service."
				},
				"Error while removing all permissions": {
					"$$noContext": "Erreur lors de la suppression des permissions"
				},
				"Error while removing from group": {
					"$$noContext": "Erreur lors de la suppression du groupe"
				},
				"Error while removing permission": {
					"$$noContext": "Erreur de la suppression des permissions"
				},
				"Error:": {
					"$$noContext": "Erreur"
				},
				"Errors": {
					"$$noContext": "Erreurs"
				},
				"Errors & warnings": {
					"$$noContext": "Erreurs et avertissements"
				},
				"Euro per kilogram": {
					"$$noContext": "Euro par kilogramme"
				},
				"Event settings.": {
					"$$noContext": "Paramètres des événements"
				},
				"Every": {
					"$$noContext": "Tous les"
				},
				"Every day": {
					"$$noContext": "Tous les jours"
				},
				"Every month": {
					"$$noContext": "Tous les mois"
				},
				"Every week": {
					"$$noContext": "Toutes les semaines"
				},
				"Everything": {
					"$$noContext": "Tout"
				},
				"Exclusions to apply": {
					"$$noContext": "Exclusions à prendre en compte"
				},
				"Existing feedback that has already been collected will be conserved even if you disable this feature.": {
					"$$noContext": "Les contributions déjà collectées seront conservées même si la fonctionnalité est désactivée."
				},
				"Existing snapshots": {
					"$$noContext": "Snapshots existants"
				},
				"Exit Fullscreen": {
					"$$noContext": "Sortir du plein écran"
				},
				"Expand panel": {
					"$$noContext": "Étendre le panneau"
				},
				"Expand the search bar": {
					"$$noContext": "Étendre la barre de recherche"
				},
				"Explore": {
					"$$noContext": "Explorer"
				},
				"Explore data": {
					"$$noContext": "Explorer les données"
				},
				"Explore the {{ $count }} dataset": {
					"$$noContext": ["Explorer le jeu de données", "Explorer les {{ $count }} jeux de données"]
				},
				"Export": {
					"$$noContext": "Export"
				},
				"Export geographical coordinates as:": {
					"$$noContext": "Exporter les coordonnées géographiques en :"
				},
				"FRED API key": {
					"$$noContext": "Clé d'API FRED"
				},
				"FTP URL is required": {
					"$$noContext": "L'URL FTP est requise"
				},
				"FTP password is required": {
					"$$noContext": "Le mot de passe FTP est requis"
				},
				"FTP username is required": {
					"$$noContext": "Le nom d'utilisateur FTP est requis"
				},
				"Facet name": {
					"$$noContext": "Nom de la facette"
				},
				"Fahrenheit": {
					"$$noContext": "Fahrenheit"
				},
				"Feb": {
					"$$noContext": "fév"
				},
				"February": {
					"$$noContext": "février"
				},
				"Federated": {
					"$$noContext": "Fédéré"
				},
				"Federated source": {
					"$$noContext": "Source fédérée"
				},
				"Feedback": {
					"$$noContext": "Contributions"
				},
				"Feedback sent!": {
					"$$noContext": "Contribution soumise !"
				},
				"Fewest downloads first": {
					"$$noContext": "Le - de téléchargements"
				},
				"Fewest records first": {
					"$$noContext": "Le - d'enregistrements"
				},
				"Field": {
					"$$noContext": "Champ"
				},
				"Field name": {
					"$$noContext": "Nom du champ"
				},
				"File": {
					"$$noContext": "Fichier"
				},
				"File identifier": {
					"$$noContext": "Identificateur de ressource unique"
				},
				"File too large": {
					"$$noContext": "Fichier trop grand"
				},
				"Filename is too long": {
					"$$noContext": "Le nom de fichier est trop long"
				},
				"Fill information": {
					"$$noContext": "Remplir les informations"
				},
				"Fill template": {
					"$$noContext": "Remplir le modèle"
				},
				"Filter": {
					"$$noContext": "Filtre"
				},
				"Filter by authentication provider": {
					"$$noContext": "Filtrer par fournisseur d'identité"
				},
				"Filter by permission": {
					"$$noContext": "Filtrer par permission"
				},
				"Filter data": {
					"$$noContext": "Filtrer les données"
				},
				"Filter parameter name": {
					"$$noContext": "Nom du paramètre de filtre"
				},
				"Filter parameter value": {
					"$$noContext": "Valeur du paramètre de filtre"
				},
				"Filter query": {
					"$$noContext": "Requête de filtre"
				},
				"Filter the data to what you see on the map": {
					"$$noContext": "Filtrer les données sur la zone affichée"
				},
				"Filtered by {fieldLabel}: {value}": {
					"$$noContext": "Filtré par {fieldLabel} : {value}"
				},
				"Filtered with: {filter}": {
					"$$noContext": "Filtré avec : {filter}"
				},
				"Filtering in a breeze": {
					"$$noContext": "Filtrer en un clin d'oeil"
				},
				"Filters": {
					"$$noContext": "Filtres"
				},
				"Filters help you find your datasets.": {
					"$$noContext": "Les filtres vous aident à retrouver vos jeux de données."
				},
				"Filters stay the same but have a more compact look.": {
					"$$noContext": "Les filtres restent les mêmes mais gagnent un aspect plus compact."
				},
				"Find a dataset...": {
					"$$noContext": "Trouver un jeu de données..."
				},
				"Find a place...": {
					"$$noContext": "Trouver un lieu..."
				},
				"Find...": {
					"$$noContext": "Trouver..."
				},
				"First name": {
					"$$noContext": "Prénom"
				},
				"First name (optional)": {
					"$$noContext": "Prénom (optionnel)"
				},
				"Five least popular datasets in this domain": {
					"$$noContext": "Cinq jeux de données les moins populaires du domaine"
				},
				"Five most popular datasets in this domain": {
					"$$noContext": "Cinq jeux de données les plus populaires du domaine"
				},
				"Flat file formats": {
					"$$noContext": "Formats de fichiers plats"
				},
				"Follow": {
					"$$noContext": "Suivre les mises à jour"
				},
				"Font files only (.ttf, .woff, etc.), max {size}": {
					"$$noContext": "Fichier de polices uniquement (.ttf, .woff, etc.), maximum {size}"
				},
				"Fonts": {
					"$$noContext": "Polices de caractères"
				},
				"Foot": {
					"$$noContext": "Pied"
				},
				"Footer": {
					"$$noContext": "Pied de page"
				},
				"For both documents, you can either link to pages on a different website or write your Terms and Conditions and Privacy Policy using the provided templates or your own content.": {
					"$$noContext": "Pour les deux documents, vous pouvez soit définir un lien vers une page ou écrire vos conditions d'utilisation et votre politique de confidentialité en vous aidant des modèles fournis."
				},
				"For dataset with <strong>remote resources</strong>, you can schedule automatic republishing.": {
					"$$noContext": "Pour un jeu de données avec <strong>des ressources distantes</strong>, vous pouvez planifier une republication automatique."
				},
				"For value that are spread from a very large spectrum": {
					"$$noContext": "Pour les valeurs réparties sur une large plage"
				},
				"For values evenly spread from the min to the max": {
					"$$noContext": "Pour les valeurs réparties régulièrement entre le minimum et le maximum"
				},
				"Forgot password?": {
					"$$noContext": "Mot de passe oublié ?"
				},
				"FranceConnect users": {
					"$$noContext": "Utilisateurs FranceConnect"
				},
				"Fred databases may be huge, a number of datasets is required to limit the number of queries": {
					"$$noContext": "Les bases de données FRED peuvent être volumineuses, vous devez définir un nombre de jeux de données pour limiter le nombre de requête"
				},
				"French": {
					"$$noContext": "Français"
				},
				"Frequency": {
					"$$noContext": "Fréquence"
				},
				"Fri": {
					"$$noContext": "ven"
				},
				"Friday": {
					"$$noContext": "vendredi"
				},
				"From": {
					"$$noContext": "Du"
				},
				"From dataset:": {
					"$$noContext": "Jeu de données :"
				},
				"From the harvester name to the default metadata, these parameters adapt to fit for the task at hand.": {
					"$$noContext": "Du nom du moissonneur aux métadonnées par défaut, ces paramètres s'adaptent en fonction de la tâche."
				},
				"Ftp username is required": {
					"$$noContext": "Le nom d'utilisateur FTP est requis"
				},
				"Full-text query": {
					"$$noContext": "Requête en texte intégral"
				},
				"Funnel chart": {
					"$$noContext": "Entonnoir"
				},
				"GB": {
					"$$noContext": "Go"
				},
				"Generate attachment": {
					"$$noContext": "Générer une pièce jointe"
				},
				"Generate configuration": {
					"$$noContext": "Générer la configuration"
				},
				"Generate new key": {
					"$$noContext": "Générer une nouvelle clé"
				},
				"Generate privacy policy": {
					"$$noContext": "Générer la politique de confidentialité"
				},
				"Generate terms and conditions": {
					"$$noContext": "Générer les conditions d'utilisation"
				},
				"Generated with colors contained in a field": {
					"$$noContext": "Généré à partir des couleurs contenus dans un champ"
				},
				"Generic API": {
					"$$noContext": "API Générique"
				},
				"Generic operations": {
					"$$noContext": "Traitements génériques"
				},
				"Geographic area": {
					"$$noContext": "Zone géographique"
				},
				"Geographic area description": {
					"$$noContext": "Description de la zone géographique"
				},
				"Geographic file formats": {
					"$$noContext": "Formats de fichiers géographiques"
				},
				"Geographical area": {
					"$$noContext": "Zone géographique"
				},
				"Geographical grid systems": {
					"inspire metadata template": "Systèmes de maillage géographique"
				},
				"Geographical mapping": {
					"$$noContext": "Traitements géographiques"
				},
				"Geographical names": {
					"inspire metadata template": "Dénominations géographiques"
				},
				"Geolocation": {
					"$$noContext": "Géolocalisation"
				},
				"Geology": {
					"inspire metadata template": "Géologie"
				},
				"Gigabyte": {
					"$$noContext": "Gigaoctets"
				},
				"Gigawatt": {
					"$$noContext": "Gigawatt"
				},
				"Gigawatt hour": {
					"$$noContext": "Gigawatt-heure"
				},
				"Glacier": {
					"$$noContext": "Glacier"
				},
				"Global configuration": {
					"$$noContext": "Configuration globale"
				},
				"Go back to the harvesters page.": {
					"$$noContext": "Retour à la page des moissonneurs "
				},
				"Google Cloud Platform project identifier": {
					"$$noContext": "Identifiant du projet Google Cloud Platform"
				},
				"Google Cloud Platform project identifier is required": {
					"$$noContext": "L'identifiant du projet Google Cloud Platform"
				},
				"Got it": {
					"$$noContext": "Compris"
				},
				"Gradient Style": {
					"$$noContext": "Style du gradient"
				},
				"Gradient type": {
					"$$noContext": "Type de gradient"
				},
				"Gram": {
					"$$noContext": "Gramme"
				},
				"Gram per liter": {
					"$$noContext": "Gramme par litre"
				},
				"Grant these permissions": {
					"$$noContext": "Accorder ces permissions"
				},
				"Granularity": {
					"$$noContext": "Granularité"
				},
				"Graph": {
					"$$noContext": "Graphe"
				},
				"Group": {
					"$$noContext": "Groupe",
					"mapbuilder": "Grouper"
				},
				"Group color": {
					"$$noContext": "Couleur du groupe"
				},
				"Group deleted": {
					"$$noContext": "Groupe supprimé"
				},
				"Group layers": {
					"$$noContext": "Groupe de couches"
				},
				"Group name": {
					"$$noContext": "Nom du groupe"
				},
				"Group permissions": {
					"$$noContext": "Permissions de groupe"
				},
				"Groups": {
					"$$noContext": "Groupes"
				},
				"HTML": {
					"$$noContext": "HTML"
				},
				"HTML code for the portal's catalog cards": {
					"$$noContext": "Code HTML pour les cartes de catalogue du portail "
				},
				"HTML code for the portal's footer": {
					"$$noContext": "Code HTML pour le pied de page du portail"
				},
				"HTML code for the portal's header": {
					"$$noContext": "Code HTML pour l'en-tête du portail"
				},
				"Habitats and biotopes": {
					"inspire metadata template": "Habitats et biotopes"
				},
				"Harvester deleted": {
					"$$noContext": "Moissonneur supprimé"
				},
				"Harvester started": {
					"$$noContext": "Moissonneur démarré"
				},
				"Harvesters come in different flavors, you will need to choose the appropriate harvester for your operation.": {
					"$$noContext": "Les moissonneurs sont disponibles en plusieurs variantes, vous devrez choisir le moissonneur adapté à votre opération."
				},
				"Header": {
					"$$noContext": "En-tête"
				},
				"Heatmap": {
					"$$noContext": "Carte de chaleur"
				},
				"Heatmap palette": {
					"$$noContext": "Palette de heatmap"
				},
				"Hectare": {
					"$$noContext": "Hectare"
				},
				"Hectoliter": {
					"$$noContext": "Hectolitre"
				},
				"Height": {
					"$$noContext": "Hauteur"
				},
				"Height is required.": {
					"$$noContext": "La hauteur est requise."
				},
				"Height must be at least 100px.": {
					"$$noContext": "La hauteur doit être supérieure à 100px."
				},
				"Hi, what can we help you with?": {
					"$$noContext": "Bonjour, comment pouvons nous vous aider ?"
				},
				"Hidden filters": {
					"$$noContext": "Filtres cachés"
				},
				"Hide errors": {
					"$$noContext": "Cacher les erreurs"
				},
				"Hide or display layer": {
					"$$noContext": "Cacher ou afficher la couche"
				},
				"Hierarchical": {
					"$$noContext": "Hiérarchique"
				},
				"Hierarchy level": {
					"$$noContext": "Niveau hiérarchique"
				},
				"Hierarchy level name": {
					"$$noContext": "Nom du niveau hiérarchique"
				},
				"High": {
					"$$noContext": "Fort"
				},
				"History": {
					"$$noContext": "Historique"
				},
				"Hit Enter after each keyword": {
					"$$noContext": "Appuyez sur Entrée après chaque mot clé"
				},
				"Hit save to apply": {
					"$$noContext": "Appuyez sur Enregistrer pour appliquer"
				},
				"Hit save to apply reset": {
					"$$noContext": "Appuyez sur Enregistrer pour réinitialiser"
				},
				"Host": {
					"$$noContext": "Hôte"
				},
				"Hour": {
					"$$noContext": "Heure"
				},
				"Hour of day": {
					"$$noContext": "Heure du jour"
				},
				"Hour per weekday": {
					"$$noContext": "Heure des jours de la semaine"
				},
				"Hours": {
					"$$noContext": "Heures"
				},
				"Human health and safety": {
					"inspire metadata template": "Santé et sécurité des personnes"
				},
				"Hydrography": {
					"inspire metadata template": "Hydrographie"
				},
				"I accept": {
					"$$noContext": "J'accepte"
				},
				"I accept the <a ng-href=\"{{ tos_page_url }}\" target=\"_blank\">Terms and conditions</a>": {
					"$$noContext": "J'accepte les <a ng-href=\"{{ tos_page_url }}\" target=\"_blank\">conditions d'utilisation</a>"
				},
				"I accept the portal's terms of use and the license applicable to the dataset.": {
					"$$noContext": "J'accepte les conditions générales du portail et la licence applicable au jeu de données."
				},
				"I don't accept": {
					"$$noContext": "Je n'accepte pas"
				},
				"ID of the series or query to match series against.": {
					"$$noContext": "ID des séries ou requête permettant de restreindre les séries."
				},
				"INSPIRE metadata": {
					"$$noContext": "Métadonnées INSPIRE"
				},
				"Icon": {
					"$$noContext": "Icône"
				},
				"Icons (not recommended for high-density datasets)": {
					"$$noContext": "Icônes (déconseillé pour les jeux de données à haute densité)"
				},
				"Icons style": {
					"$$noContext": "Style des icônes"
				},
				"Identifier": {
					"$$noContext": "Identifiant"
				},
				"Identities": {
					"$$noContext": "Identités"
				},
				"Identity attributes": {
					"$$noContext": "Attributs de l'identité"
				},
				"Idle": {
					"$$noContext": "Prêt"
				},
				"If portal has multilingual metadata support, choose one language, eg. 'fr'": {
					"$$noContext": "Si le portail supporte les métadonnées multi langue, choisissez une langue, par exemple 'fr'"
				},
				"If the portal requires authentication, the API Key": {
					"$$noContext": "La clé d'API si le portail requiert une authentification"
				},
				"If the source datasets are deleted on the harvested portal, delete them on this Data4Citizen portal too": {
					"$$noContext": "Si les jeux de données source du portail moissonné sont supprimés, les supprimer aussi de ce portail Data4Citizen"
				},
				"If you are doing it after the original dataset publication, consider warning your users.": {
					"$$noContext": "Si vous effectuez la modification après que le jeu de donnée ait été publié, pensez à prévenir vos utilisateurs."
				},
				"If you are getting internal errors reports while harvesting, it means our harvester encountered an unforeseen condition on the remote portal that needs to be fixed internally.": {
					"$$noContext": "Si vous obtenez des rapports d'erreurs internes pendant le moissonnage, cela signifie que notre moissonneur a rencontré une condition imprévue sur le portail cible, il faut la régler sur la plateforme"
				},
				"If you can't see datasets, you should review your harvester configuration. If you see datasets, your harvester should work fine and you're good to go.": {
					"$$noContext": "Si vous ne pouvez pas voir les jeux de données, vous devriez revoir votre configuration de moissonneur. Si vous voyez des jeux de données, votre moissonneur devrait fonctionner sans problème et tout est prêt. "
				},
				"If you enable user feedback on this dataset, users will be able to contribute by submitting comments on a specific record; they may also suggest new values.": {
					"$$noContext": "Si vous activez les contributions, les utilisateurs pourront soumettre des commentaires sur chaque enregistrement, et éventuellement suggérer de nouvelles valeurs."
				},
				"If you want to attach resources as attachments instead of using them as sources": {
					"$$noContext": "Si vous souhaitez utiliser les ressources en temps que pièce jointe et non en temps que sources"
				},
				"If you want to prepare a page for subdomain distribution, you can use parameters in your html code.": {
					"$$noContext": "Si vous souhaitez préparer une page pour la distribution aux sous-domaines, vous pouvez utiliser des paramètres dans votre code HTML. "
				},
				"If you want to upload a larger file, you can try to compress it (ZIP), or you can split it in multiple files": {
					"$$noContext": "Si vous voulez charger un fichier plus gros, vous pouvez essayer de le compresser (ZIP) ou de le découper en plusieurs fichiers"
				},
				"If you wish to use Thunderforest basemaps, you'll have to <a href=\"http://www.thunderforest.com/pricing/\">subscribe to one of their plans</a> in order to remove the watermark.": {
					"$$noContext": "Si vous souhaitez utiliser les fonds de carte Thunderforest, vous devez <a href=\"http://www.thunderforest.com/pricing/\">souscrire à l'un de leurs abonnements</a> pour effacer le filigrane."
				},
				"If your data is not related to any location.": {
					"$$noContext": "Si vos données ne sont pas liées à une position."
				},
				"Image": {
					"$$noContext": "Image"
				},
				"Image files only (.png, .jpeg, etc.), max {size}": {
					"$$noContext": "Fichiers image uniquement (.png, .jpeg, etc.), maximum {size}"
				},
				"Images": {
					"$$noContext": "Images"
				},
				"In order to access this API": {
					"$$noContext": "Pour accéder à cette API"
				},
				"In order to download this dataset": {
					"$$noContext": "Pour télécharger ce jeu de données"
				},
				"In order to have a map tab, your dataset must have a geographical field (Geo point 2D or Geo Shape).": {
					"$$noContext": "Afin d'avoir un onglet carte, votre jeu de données doit avoir un champ géographique (Geo point 2D ou Geo Shape)"
				},
				"In order to have an analyze tab, your dataset must have at least one date field or one facet.": {
					"$$noContext": "Afin d'avoir un onglet analyse, votre jeu de données doit avoir au moins un champ date ou une facette."
				},
				"In order to have an images tab, your dataset must have a file field.": {
					"$$noContext": "Afin d'avoir un onglet images, votre jeu de données doit avoir un champ de type fichier."
				},
				"In the meantime, you can continue to edit this map even before you log in for the first time.": {
					"$$noContext": "Pendant ce temps, vous pouvez continuer à éditer cette carte même avant de vous authentifier pour la première fois."
				},
				"In this table you will find all your datasets in an orderly fashion.": {
					"$$noContext": "Vous trouverez dans ce tableau tous vos jeux de données bien ordonnés."
				},
				"In this timezone": {
					"$$noContext": "Sur ce fuseau horaire"
				},
				"Inch": {
					"$$noContext": "Pouce"
				},
				"Index of the first result to return (use for pagination)": {
					"$$noContext": "Index du premier résultat renvoyé (utilisé pour la pagination)"
				},
				"InfoItems limit": {
					"$$noContext": "Limite d'infoitems"
				},
				"Information": {
					"$$noContext": "Informations"
				},
				"Information panel customization": {
					"$$noContext": "Personnalisation du panneau d'information"
				},
				"Information panel preview": {
					"$$noContext": "Aperçu du panneau d'information"
				},
				"Inherit anonymous access setting": {
					"$$noContext": "Copier la configuration de l'accès anonyme"
				},
				"Inherited - Distributed pages will have the same visibility as their parent": {
					"$$noContext": "Hérité - Les pages distribuées auront la même visibilité que leur parent"
				},
				"Inject this content pack into my domain": {
					"$$noContext": "Importer ce pack de contenu sur votre domaine"
				},
				"Inner circle size:": {
					"$$noContext": "Rayon du cercle interne:"
				},
				"Input text": {
					"$$noContext": "Saisir du texte"
				},
				"Internal error": {
					"$$noContext": "Erreur interne"
				},
				"Invalid URL": {
					"$$noContext": "URL invalide"
				},
				"Invalid character": {
					"$$noContext": "Caractère invalide"
				},
				"Invalid date format": {
					"$$noContext": "Format de date invalide"
				},
				"Invalid encoding": {
					"$$noContext": "Encodage invalide"
				},
				"Invalid escape character": {
					"$$noContext": "Caractère d'échappement invalide"
				},
				"Invalid first row number": {
					"$$noContext": "Valeur de première ligne invalide"
				},
				"Invalid host {host} resolution for url {url} : host is {type}": {
					"Exception message": "Hôte non valide {host} résolution de l'URL {url} : l'hôte est {type}"
				},
				"Invalid layer": {
					"$$noContext": "Couche invalide"
				},
				"Invalid number of datasets.": {
					"$$noContext": "Nombre de jeux de données invalide."
				},
				"Invalid password or this user has not been activated": {
					"$$noContext": "Le mot de passe est invalide ou cet utilisateur n'a pas été activé"
				},
				"Invalid projection": {
					"$$noContext": "Projection invalide"
				},
				"Invalid scheme change from {scheme_from} to {scheme_to}": {
					"Exception message": "Modification de schema invalide de {scheme_from} vers {scheme_to}"
				},
				"Invalid sheet number": {
					"$$noContext": "Numéro de feuille invalide"
				},
				"Invalid url format": {
					"$$noContext": "Format d'URL invalide"
				},
				"Invalid value for 3Words": {
					"$$noContext": "Valeur invalide pour 3Words"
				},
				"Invalid value for parameter '{parameter_name}'.": {
					"API error message": "Valeur incorrecte pour le paramètre '{parameter_name}'"
				},
				"Invitations sent!": {
					"$$noContext": "Invitations envoyées "
				},
				"Invite him/her to your portal first!": {
					"$$noContext": "Commencez par l'inviter sur votre portail !"
				},
				"Invite users": {
					"$$noContext": "Inviter des utilisateurs"
				},
				"Issued": {
					"$$noContext": "Publié"
				},
				"It doesn't match your password": {
					"$$noContext": "Cela ne correspond pas à votre mot de passe"
				},
				"It must contain at least a letter, at least a number, be at least 8 chars long and at most 256 chars long.": {
					"$$noContext": "Doit contenir au moins une lettre, un nombre, faire au moins 8 caractères et au plus 256 caractères."
				},
				"It must match your password": {
					"$$noContext": "Doit correspondre à votre mot de passe"
				},
				"Item": {
					"$$noContext": "Element"
				},
				"Item count (ascending)": {
					"$$noContext": "Nombre de résultats croissant"
				},
				"Item count (descending)": {
					"$$noContext": "Nombre de résultats décroissant"
				},
				"JSON Schema": {
					"$$noContext": "Schéma JSON"
				},
				"Jan": {
					"$$noContext": "jan"
				},
				"January": {
					"$$noContext": "janvier"
				},
				"Jul": {
					"$$noContext": "juil"
				},
				"July": {
					"$$noContext": "juillet"
				},
				"Jun": {
					"$$noContext": "juin"
				},
				"Junar URL is required": {
					"$$noContext": "L'URL Junar est requise"
				},
				"June": {
					"$$noContext": "juin"
				},
				"KB": {
					"$$noContext": "Ko"
				},
				"Keep an eye on the quotas": {
					"$$noContext": "Gardez un oeil sur les quotas"
				},
				"Key value": {
					"$$noContext": "Valeur de la clé"
				},
				"Keyword": {
					"$$noContext": "Mot clé"
				},
				"Keywords": {
					"$$noContext": "Mots clés"
				},
				"Keywords thesaurus": {
					"$$noContext": "Mots clés thésaurus"
				},
				"Kiloampere": {
					"$$noContext": "Kiloampère"
				},
				"Kilobyte": {
					"$$noContext": "Kilooctets"
				},
				"Kilogram": {
					"$$noContext": "Kilogramme"
				},
				"Kilogram per cubic meter": {
					"$$noContext": "Kilogramme par mètre cube"
				},
				"Kilometer": {
					"$$noContext": "Kilomètre"
				},
				"Kilometer per hour": {
					"$$noContext": "Kilomètre par heure"
				},
				"Kilometer per second": {
					"$$noContext": "Kilomètre par seconde"
				},
				"Kilovolt": {
					"$$noContext": "Kilovolt"
				},
				"Kilovolt-Ampere": {
					"$$noContext": "Kilovolt-Ampère"
				},
				"Kilowatt": {
					"$$noContext": "Kilowatt"
				},
				"Kilowatt hour": {
					"$$noContext": "Kilowatt-heure"
				},
				"L/d": {
					"$$noContext": "L/J"
				},
				"Label": {
					"$$noContext": "Label"
				},
				"Labels max length": {
					"$$noContext": "Longueur maximum des labels"
				},
				"Labels position:": {
					"$$noContext": "Position des labels:"
				},
				"Land cover": {
					"inspire metadata template": "Occupation des terres"
				},
				"Land use": {
					"inspire metadata template": "Usage des sols"
				},
				"Language": {
					"$$noContext": "Langue"
				},
				"Last 12 months": {
					"$$noContext": "12 derniers mois"
				},
				"Last 24 hours": {
					"$$noContext": "Dernière 24 heures"
				},
				"Last 4 weeks": {
					"$$noContext": "4 dernières semaines"
				},
				"Last 7 days": {
					"$$noContext": "7 derniers jours"
				},
				"Last datasets": {
					"$$noContext": "Derniers jeux de données"
				},
				"Last harvesting led to a critical error": {
					"$$noContext": "Le dernier moissonnage a provoqué une erreur critique"
				},
				"Last modification": {
					"$$noContext": "Dernière modification"
				},
				"Last modification date": {
					"$$noContext": "Date de dernière modification"
				},
				"Last modifications": {
					"$$noContext": "Dernières modifications"
				},
				"Last modified": {
					"$$noContext": "Dernière modification"
				},
				"Last name": {
					"$$noContext": "Nom"
				},
				"Last name (optional)": {
					"$$noContext": "Nom de famille (optionnel)"
				},
				"Last processing": {
					"$$noContext": "Dernier traitement"
				},
				"Last published": {
					"$$noContext": "Dernière publication"
				},
				"Last reuses": {
					"$$noContext": "Dernières réutilisations"
				},
				"Latitude": {
					"$$noContext": "Latitude"
				},
				"Launch the harvesting, wait for a few minutes to gather all data and process it and your portal should be filled with brand new datasets": {
					"$$noContext": "Lancer le moissonnage, attendre quelques minutes que les données soient rassemblées et indexées et votre portail devrait être rempli de nouveaux jeux de données"
				},
				"Layer color": {
					"$$noContext": "Couleur de la couche"
				},
				"Layers": {
					"$$noContext": "Calques"
				},
				"Layers (required)": {
					"$$noContext": "Calques (requis)"
				},
				"Layout options": {
					"$$noContext": "Options de mise en page"
				},
				"Learn more about distribution using parameters": {
					"$$noContext": "Plus d'informations sur la distribution avec des paramètres "
				},
				"Least popular first": {
					"$$noContext": "Les - populaires"
				},
				"Least recently modified first": {
					"$$noContext": "Anciennement modifiés "
				},
				"Less": {
					"$$noContext": "Moins"
				},
				"Let's go!": {
					"$$noContext": "C'est parti !"
				},
				"License": {
					"$$noContext": "Licence"
				},
				"Light blue": {
					"$$noContext": "Bleu clair"
				},
				"Light cherry": {
					"$$noContext": "Cerise clair"
				},
				"Light fuchsia": {
					"$$noContext": "Fuschia clair"
				},
				"Light green": {
					"$$noContext": "Vert clair"
				},
				"Light grey": {
					"$$noContext": "Gris clair"
				},
				"Light oil": {
					"$$noContext": "Pétrole clair"
				},
				"Light orange": {
					"$$noContext": "Orange clair"
				},
				"Light purple": {
					"$$noContext": "Violet clair"
				},
				"Light royal blue": {
					"$$noContext": "Bleu roi clair"
				},
				"Light slate": {
					"$$noContext": "Ardoise clair"
				},
				"Light vermilion": {
					"$$noContext": "Vermillon clair"
				},
				"Light yellow": {
					"$$noContext": "Jaune clair"
				},
				"Limit reached": {
					"$$noContext": "Limite atteinte"
				},
				"Limits the number of infoitems harvested.": {
					"$$noContext": "Limite le nombre d'infoitems a moissonner."
				},
				"Line": {
					"$$noContext": "Ligne"
				},
				"Line thickness": {
					"$$noContext": "Épaisseur de ligne"
				},
				"Linear": {
					"$$noContext": "Linéaire"
				},
				"Link example:": {
					"$$noContext": "Exemple de lien:"
				},
				"Link your account to a SAML account on this domain.": {
					"$$noContext": "Lier votre compte à un compte SAML sur ce domaine."
				},
				"Linked identities": {
					"$$noContext": "Identités liées"
				},
				"Links language": {
					"$$noContext": "Langue des liens"
				},
				"List of comma separated dataset IDs (bea-fa2004-section1-101-a, ecb-bop, ...).": {
					"$$noContext": "Liste des IDs de jeux de données séparés par des virgules (bea-fa2004-section1-101-a, ecb-bop, ...)"
				},
				"Liter": {
					"$$noContext": "Litre"
				},
				"Liter per day": {
					"$$noContext": "Litre par jour"
				},
				"Liter per hour": {
					"$$noContext": "Litre par heure"
				},
				"Liter per second": {
					"$$noContext": "Litre par seconde"
				},
				"Loading": {
					"$$noContext": "Chargement en cours"
				},
				"Local path": {
					"$$noContext": "Chemin d'accès local"
				},
				"Local time ({{timezone}})": {
					"$$noContext": "Heure locale ({{timezone}})"
				},
				"Lock map's zoom and position": {
					"$$noContext": "Figer la position et le zoom de la carte"
				},
				"Log scale": {
					"$$noContext": "Echelle log."
				},
				"Logarithmic": {
					"$$noContext": "Logarithmique"
				},
				"Login": {
					"$$noContext": "Connexion"
				},
				"Login and save map": {
					"$$noContext": "S'identifier et sauvegarder la carte"
				},
				"Login link label": {
					"$$noContext": "Label du lien de connexion"
				},
				"Long dashes": {
					"$$noContext": "Traits longs"
				},
				"Low": {
					"$$noContext": "Faible"
				},
				"Lower boundary:": {
					"$$noContext": "Borne basse :"
				},
				"Lower quartile:": {
					"$$noContext": "Quartile inférieur :"
				},
				"MB": {
					"$$noContext": "Mo"
				},
				"Main block + right column": {
					"$$noContext": "Bloc simple + colonne à droite"
				},
				"Main information": {
					"$$noContext": "Informations principales"
				},
				"Make the visibility of newly harvested datasets restricted (does not update visibility of existing datasets)": {
					"$$noContext": "Restreindre la visibilité des jeux de données nouvellement moissonnés (la visibilité des jeux de données existants n'est pas modifiée)"
				},
				"Mandatory": {
					"$$noContext": "Obligatoire"
				},
				"Manually drawn on a map": {
					"$$noContext": "Dessinée à la main sur une carte"
				},
				"Map": {
					"$$noContext": "Carte"
				},
				"Map ID": {
					"$$noContext": "ID de la map"
				},
				"Map ID is required.": {
					"$$noContext": "L'ID de la map est requis."
				},
				"Map customization": {
					"$$noContext": "Personnalisation de la carte"
				},
				"Map filter": {
					"$$noContext": "Filtre géographique"
				},
				"Map marker": {
					"$$noContext": "Marqueur"
				},
				"Map size (in pixels)": {
					"$$noContext": "Taille de la carte (en pixels)"
				},
				"Mar": {
					"$$noContext": "mars"
				},
				"March": {
					"$$noContext": "mars"
				},
				"Marker display": {
					"$$noContext": "Affichage des marqueurs"
				},
				"Markers style": {
					"$$noContext": "Style des marqueurs"
				},
				"Markers with an optional icon": {
					"$$noContext": "Marqueur avec une icône optionnelle"
				},
				"Match parameters": {
					"$$noContext": "Associer les paramètres"
				},
				"Max requests": {
					"$$noContext": "Nombre de requêtes maximum"
				},
				"Max requests :": {
					"$$noContext": "Maximum de requêtes :"
				},
				"Max size": {
					"$$noContext": "Taille max."
				},
				"Max value must be higher than min value.": {
					"$$noContext": "La valeur maximum doit être supérieure à la valeur minimum."
				},
				"Max value on axis": {
					"$$noContext": "Valeur max. de l'axe"
				},
				"Max zoom": {
					"$$noContext": "Zoom max"
				},
				"Max. number of points": {
					"$$noContext": "Nombre de points max."
				},
				"Maximum": {
					"$$noContext": "Maximum"
				},
				"Maximum 240Mb per file": {
					"$$noContext": "Maximum 240 Mo par fichier"
				},
				"Maximum dimensions": {
					"$$noContext": "Dimensions maximum"
				},
				"Maximum layer zoom visibility.": {
					"$$noContext": "Niveau de zoom maximum visible"
				},
				"Maximum number of API calls for this user": {
					"$$noContext": "Nombre maximum d'appels d'API pour cet utilisateur"
				},
				"Maximum number of API calls per user": {
					"$$noContext": "Nombre maximum d'appels d'API par utilisateur"
				},
				"Maximum number of rows": {
					"$$noContext": "Nombre maximum de lignes "
				},
				"Maximum number of rows is required": {
					"$$noContext": "Le nombre maximum de lignes est obligatoire"
				},
				"Maximum number of tables": {
					"$$noContext": "Nombre maximum de tables"
				},
				"Maximum number of tables is required": {
					"$$noContext": "Le nombre maximum de tables est obligatoire"
				},
				"Maximum number of users for this portal exceeded": {
					"$$noContext": "Vous avez dépassé le nombre maximum d'utilisateurs pour un portail"
				},
				"Maximum results": {
					"$$noContext": "Nombre maximum de résultats"
				},
				"Maximum size": {
					"$$noContext": "Taille maximum"
				},
				"Maximum value": {
					"$$noContext": "Valeur maximum"
				},
				"Maximum value: {{ parentDomain.license.quota.datasets }} datasets": {
					"$$noContext": "Valeur maximum : {{ parentDomain.license.quota.datasets }} jeux de données"
				},
				"Maximum value: {{ parentDomain.license.quota.records }} records": {
					"$$noContext": "Valeur maximum : {{ parentDomain.license.quota.records }} enregistrements"
				},
				"Maximum value: {{ parentDomain.license.quota.records_by_dataset }} records by dataset": {
					"$$noContext": "Valeur maximum : {{ parentDomain.license.quota.records_by_dataset }} enregistrements par jeu de données"
				},
				"Maximum:": {
					"$$noContext": "Maximum :"
				},
				"May": {
					"$$noContext": "mai"
				},
				"Median:": {
					"$$noContext": "Médiane :"
				},
				"Medium - short": {
					"$$noContext": "Moyen - court"
				},
				"Medium blue": {
					"$$noContext": "Bleu moyen"
				},
				"Medium cherry": {
					"$$noContext": "Cerise moyen"
				},
				"Medium dashes": {
					"$$noContext": "Traits moyens"
				},
				"Medium fuchsia": {
					"$$noContext": "Fuchsia moyen"
				},
				"Medium green": {
					"$$noContext": "Vert moyen"
				},
				"Medium oil": {
					"$$noContext": "Pétrole moyen"
				},
				"Medium orange": {
					"$$noContext": "Orange moyen"
				},
				"Medium purple": {
					"$$noContext": "Violet moyen"
				},
				"Medium royal blue": {
					"$$noContext": "Bleu roi moyen"
				},
				"Medium slate": {
					"$$noContext": "Ardoise moyen"
				},
				"Medium vermilion": {
					"$$noContext": "Vermillon moyen"
				},
				"Medium yellow": {
					"$$noContext": "Jaune moyen"
				},
				"Megabyte": {
					"$$noContext": "Mégaoctets"
				},
				"Megawatt": {
					"$$noContext": "Mégawatt"
				},
				"Megawatt hour": {
					"$$noContext": "Mégawatt-heure"
				},
				"Member of groups:": {
					"$$noContext": "Membre des groupes:"
				},
				"Merge Y axes": {
					"$$noContext": "Fusionner les axes Y"
				},
				"Message": {
					"$$noContext": "Message"
				},
				"Meta": {
					"$$noContext": "Méta"
				},
				"Metadata CSV filename": {
					"$$noContext": "Nom du fichier de métadonnées"
				},
				"Metadata CSV resource column": {
					"$$noContext": "Colonne du fichier CSV de métadonnées pointant sur la ressource"
				},
				"Metadata CSV resource field is required": {
					"$$noContext": "La colonne des ressources est requise"
				},
				"Metadata CSV schema column": {
					"$$noContext": "Colonne du fichier CSV de métadonnées pointant sur le schéma"
				},
				"Metadata name": {
					"$$noContext": "Nom de la métadonnée"
				},
				"Metadata processed": {
					"$$noContext": "Métadonnées traitées"
				},
				"Metadata value": {
					"$$noContext": "Valeur de la métadonnée"
				},
				"Metadatas": {
					"$$noContext": "Métadonnées"
				},
				"Meteorological geographical features": {
					"inspire metadata template": "Caractéristiques géographiques météorologiques"
				},
				"Meter": {
					"$$noContext": "Mètre"
				},
				"Meter per second": {
					"$$noContext": "Mètre par seconde"
				},
				"Microgram per cubic meter": {
					"$$noContext": "Microgramme par mètre cube"
				},
				"Microgram per liter": {
					"$$noContext": "Microgramme par litre"
				},
				"Mile": {
					"$$noContext": "Mille international"
				},
				"Miles per hour": {
					"$$noContext": "Miles par heure"
				},
				"Millibar": {
					"$$noContext": "Millibar"
				},
				"Milligram per liter": {
					"$$noContext": "Milligramme par litre"
				},
				"Millimeter": {
					"$$noContext": "Millimètre"
				},
				"Min can't be equal to max.": {
					"$$noContext": "Le minimum ne peut être égal au maximum."
				},
				"Min size": {
					"$$noContext": "Taille min."
				},
				"Min value must be lower than max value.": {
					"$$noContext": "La valeur minimum doit être inférieure à la valeur maximum."
				},
				"Min value on axis": {
					"$$noContext": "Valeur min. de l'axe"
				},
				"Min zoom": {
					"$$noContext": "Zoom min"
				},
				"Mineral resources": {
					"inspire metadata template": "Ressources minérales"
				},
				"Minimum": {
					"$$noContext": "Minimum"
				},
				"Minimum layer zoom visibility.": {
					"$$noContext": "Niveau de zoom minimum visible"
				},
				"Minimum:": {
					"$$noContext": "Minimum :"
				},
				"Mininum value": {
					"$$noContext": "Valeur minimum"
				},
				"Minute": {
					"$$noContext": "Minute"
				},
				"Minutes": {
					"$$noContext": "Minutes"
				},
				"Missing privacy policy link": {
					"$$noContext": "Lien vers la politique de confidentialité manquante"
				},
				"Missing privacy policy text": {
					"$$noContext": "Politique de confidentialité manquante"
				},
				"Missing terms and conditions and privacy policy links": {
					"$$noContext": "Liens vers la politique de confidentialité et les conditions d'utilisation manquants"
				},
				"Missing terms and conditions and privacy policy texts": {
					"$$noContext": "La politique de confidentialité et les conditions d'utilisation sont manquants"
				},
				"Missing terms and conditions link": {
					"$$noContext": "Lien vers les conditions d'utilisation manquant"
				},
				"Missing terms and conditions text": {
					"$$noContext": "Conditions d'utilisation manquantes"
				},
				"Missing values": {
					"$$noContext": "Valeurs manquantes"
				},
				"Modified": {
					"$$noContext": "Modifié"
				},
				"Modify": {
					"$$noContext": "Modifier"
				},
				"Modify identifier": {
					"$$noContext": "Modifier l'identifiant"
				},
				"Mon": {
					"$$noContext": "lun"
				},
				"Monday": {
					"$$noContext": "lundi"
				},
				"Monitoring Entry Points": {
					"$$noContext": "Point d'entrée à surveiller"
				},
				"Monochrome": {
					"$$noContext": "Monochrome"
				},
				"Monolayer": {
					"$$noContext": "Mono-couche"
				},
				"Month": {
					"$$noContext": "Mois"
				},
				"Month of year": {
					"$$noContext": "Mois de l'année"
				},
				"Months": {
					"$$noContext": "Mois"
				},
				"More": {
					"$$noContext": "Plus"
				},
				"More Actions": {
					"$$noContext": "Autres actions"
				},
				"More about JSON schema": {
					"$$noContext": "Pour en savoir plus sur JSON schema"
				},
				"More compact and search-friendly, it's designed to make your life easier.": {
					"$$noContext": "Plus compact et plus simple à utiliser, il a été pensé pour vous faciliter la vie. "
				},
				"More datasets at a glance": {
					"$$noContext": "Plus de jeux de données en un coup d'oeil"
				},
				"More filters": {
					"$$noContext": "Plus de filtres"
				},
				"Most downloads first": {
					"$$noContext": "Le + de téléchargements"
				},
				"Most popular data": {
					"$$noContext": "Jeux de données les plus populaires"
				},
				"Most popular first": {
					"$$noContext": "Les + populaires "
				},
				"Most recent first": {
					"$$noContext": "Plus récents"
				},
				"Most records first": {
					"$$noContext": "Le + d'enregistrements"
				},
				"Most relevant first": {
					"$$noContext": "Les + pertinents"
				},
				"Most used themes": {
					"$$noContext": "Thèmes les plus utilisés"
				},
				"Multilayer": {
					"$$noContext": "Multi-couche"
				},
				"Multiple selection": {
					"$$noContext": "Sélection multiple"
				},
				"Multiple values are allowed and must be on different lines": {
					"$$noContext": "Les valeurs multiples sont autorisées et doivent être sur des lignes différentes"
				},
				"Multivalued": {
					"$$noContext": "Multivalué"
				},
				"Must be separated by a comma, a semi-colon, a space or a line return": {
					"$$noContext": "Doit être séparé par des virgules, point-virgules, espaces ou retour à la ligne"
				},
				"Must begin with http or https.": {
					"$$noContext": "Doit commencer par http ou https"
				},
				"Must contain at least a letter and a number": {
					"$$noContext": "Doit contenir au moins une lettre et un chiffre"
				},
				"My maps": {
					"$$noContext": "Mes cartes"
				},
				"Name": {
					"$$noContext": "Nom"
				},
				"Name (ascending)": {
					"$$noContext": "Ordre alphabétique croissant"
				},
				"Name (descending)": {
					"$$noContext": "Ordre alphabétique décroissant"
				},
				"Name (identifier)": {
					"$$noContext": "Nom (identifiant)"
				},
				"Name of facets to enable in the results": {
					"$$noContext": "Nom des facettes à activer dans les résultats"
				},
				"Name of the CKAN group you want to harvest.": {
					"$$noContext": "Nom du groupe CKAN à moissonner"
				},
				"Name of the parameter you want to pass to the data.gouv.fr API to filter the request that will be performed": {
					"$$noContext": "Nom du paramètre à passer à l'API data.gouv.fr pour filtrer la requête"
				},
				"Natural risk zones": {
					"inspire metadata template": "Zones à risque naturel"
				},
				"Need help?": {
					"$$noContext": "Besoin d'aide ?"
				},
				"New features and various tips and tricks on the product.": {
					"$$noContext": "Nouvelles fonctionnalités et trucs et astuces sur le produit."
				},
				"New map": {
					"$$noContext": "Nouvelle carte"
				},
				"New page": {
					"$$noContext": "Nouvelle page"
				},
				"New password": {
					"$$noContext": "Nouveau mot de passe"
				},
				"New snapshot": {
					"$$noContext": "Nouveau snapshot"
				},
				"Next": {
					"$$noContext": "Suivant"
				},
				"Nice colors": {
					"$$noContext": "Jolies couleurs"
				},
				"No": {
					"$$noContext": "Non"
				},
				"No Page found": {
					"$$noContext": "Aucune page trouvée"
				},
				"No active filters": {
					"$$noContext": "Aucun filtre actif"
				},
				"No area filter to delete.": {
					"$$noContext": "Aucun filtre par zone à effacer."
				},
				"No area filter to edit.": {
					"$$noContext": "Aucun filtre par zone à modifier."
				},
				"No authentication": {
					"$$noContext": "Pas d'authentication"
				},
				"No data available yet": {
					"$$noContext": "Données pas encore disponibles"
				},
				"No datasets distributed to this subdomain": {
					"$$noContext": "Aucun jeu de données distribué à ce sous-domaine"
				},
				"No description available for this field.": {
					"$$noContext": "Aucune description n'est disponible pour ce champ."
				},
				"No description available.": {
					"$$noContext": "Aucune description disponible."
				},
				"No errors": {
					"$$noContext": "Pas d'erreur"
				},
				"No extractor has been found to extract this data": {
					"$$noContext": "Aucun extracteur n’a été trouvé pour l’extraction de ces données"
				},
				"No feedback to display": {
					"$$noContext": "Aucune contribution à afficher"
				},
				"No field for the selected dataset": {
					"$$noContext": "Pas de champ pour le jeu de données sélectionné"
				},
				"No filter": {
					"$$noContext": "Aucun filtre"
				},
				"No filter available": {
					"$$noContext": "Aucun filtre disponible"
				},
				"No filter for this dataset": {
					"$$noContext": "Aucun filtre pour ce jeu de données"
				},
				"No group found": {
					"$$noContext": "Aucun groupe trouvé"
				},
				"No icon": {
					"$$noContext": "Pas d'icône"
				},
				"No image (default image)": {
					"$$noContext": "Pas d'image (image par défaut)"
				},
				"No information available": {
					"$$noContext": "Pas d'information disponible"
				},
				"No legend available": {
					"$$noContext": "Aucune légende disponible"
				},
				"No map found.": {
					"$$noContext": "Aucune carte trouvée"
				},
				"No maps": {
					"$$noContext": "Aucune carte"
				},
				"No name": {
					"$$noContext": "Sans nom"
				},
				"No pages available": {
					"$$noContext": "Aucune page disponible"
				},
				"No pages distributed to this subdomain": {
					"$$noContext": "Aucune page distribuée à ce sous-domaine"
				},
				"No parameter available": {
					"$$noContext": "Aucun paramètre disponible"
				},
				"No parameter specified for this domain.": {
					"$$noContext": "Pas de paramètre spécifié pour ce domaine"
				},
				"No parameter specified for this subdomain.": {
					"$$noContext": "Pas de paramètre spécifié pour ce sous-domaine"
				},
				"No parameter with value available.": {
					"$$noContext": "Aucun paramètre disponible avec une valeur."
				},
				"No permissions": {
					"$$noContext": "Aucune permission"
				},
				"No points are available in this dataset.": {
					"$$noContext": "Aucun point n'existe dans ce jeu de données."
				},
				"No results": {
					"$$noContext": "Aucun résultat"
				},
				"No results found for your search. Maybe you want to <a href=\"\" ng-click=\"search=''\">reset your search?</a>": {
					"$$noContext": "Aucun résultat pour votre recherche. Vous souhaitez peut-être <a ng-click=\"search=''\" href=\"\">la réinitialiser ?</a>"
				},
				"No shapes are available in this dataset.": {
					"$$noContext": "Aucune forme n'existe dans ce jeu de données."
				},
				"No snapshots created yet.": {
					"$$noContext": "Pas encore de snapshots créés"
				},
				"No spatial reference found in Shapefile": {
					"$$noContext": "Pas de référence spatiale dans le Shapefile"
				},
				"No specific group permissions defined yet": {
					"$$noContext": "Pas encore de permissions de groupe"
				},
				"No specific user permissions defined yet": {
					"$$noContext": "Pas encore de permissions utilisateur"
				},
				"No stack": {
					"$$noContext": "Pas d'empilement"
				},
				"No subdomain left": {
					"$$noContext": "Plus aucun sous-domaine disponible"
				},
				"No title for this page": {
					"$$noContext": "Pas de titre pour cette page"
				},
				"No user found": {
					"$$noContext": "Aucun utilisateur trouvé"
				},
				"No value set in remote dataset": {
					"$$noContext": "Pas de valeur définie sur le jeu de données distant"
				},
				"None": {
					"$$noContext": "Aucune"
				},
				"None of the users could be added to the group. If the problem persists, contact the support.": {
					"$$noContext": "Aucun des utilisateurs n'a pu être ajouté au groupe. Merci de contacter le support si le problème persiste."
				},
				"Normal": {
					"$$noContext": "Normal"
				},
				"Northbound latitude": {
					"$$noContext": "Latitude Nord"
				},
				"Not a valid email address": {
					"$$noContext": "L'adresse email n'est pas valide"
				},
				"Not published": {
					"$$noContext": "Non publié"
				},
				"Note that all data will be taken into account for this computation regardless of security parameters.": {
					"$$noContext": "Attention : lors du calcul, tous les enregistrements seront pris en compte sans tenir compte des paramètres de sécurité."
				},
				"Nothing found.": {
					"$$noContext": "Aucun résultat."
				},
				"Notifications": {
					"$$noContext": "Notifications"
				},
				"Nov": {
					"$$noContext": "nov"
				},
				"November": {
					"$$noContext": "novembre"
				},
				"Number of colors": {
					"$$noContext": "Nombre de couleurs"
				},
				"Number of datasets": {
					"$$noContext": "Nombre de jeux de données"
				},
				"Number of elements": {
					"$$noContext": "Nombre d'éléments"
				},
				"Number of modified datasets": {
					"$$noContext": "Nombre de jeux de données modifiés"
				},
				"Number of records per dataset": {
					"$$noContext": "Nombre d'enregistrements par jeu de données"
				},
				"Number of rows in the result (default: 10)": {
					"$$noContext": "Nombre de lignes de résultat (10 par défaut)"
				},
				"Numeric ascending": {
					"$$noContext": "Numérique ascendant"
				},
				"Numeric descending": {
					"$$noContext": "Numérique descendant"
				},
				"Numerical operations": {
					"$$noContext": "Opérations numériques"
				},
				"OAuth2": {
					"$$noContext": "OAuth2"
				},
				"OAuth2 Scope": {
					"$$noContext": "Scope OAuth2"
				},
				"OData v4 API": {
					"$$noContext": "API OData v4"
				},
				"OK": {
					"$$noContext": "OK"
				},
				"OMI Node root URL": {
					"$$noContext": "URL racine du noeud OMI"
				},
				"OMI Node version": {
					"$$noContext": "Version de Node OMI"
				},
				"Oceanographic geographical features": {
					"inspire metadata template": "Caractéristiques géographiques océanographiques"
				},
				"Oct": {
					"$$noContext": "oct"
				},
				"October": {
					"$$noContext": "octobre"
				},
				"Offset": {
					"$$noContext": "Nombre à sauter"
				},
				"Older first": {
					"$$noContext": "Plus anciens"
				},
				"On this page, you will be able to configure the harvester parameters.": {
					"$$noContext": "Sur cette page, vous serez en mesure de configurer les paramètres des moissonneurs."
				},
				"On this page, you will be able to fill in your distribution parameters, distribute datasets and pages and set your quotas.": {
					"$$noContext": "Sur cette page, vous serez capable de remplir vos paramètres de distribution, de distribuer des jeux de données et des pages et de définir vos quotas."
				},
				"On those days": {
					"$$noContext": "Ces jours "
				},
				"Once set, distribution parameters can be used to match your fields' values on the dataset, effectively filtering your data.": {
					"$$noContext": "Une fois remplis, les paramètres de distribution peuvent être utilisés pour être associer avec les valeurs des champs dans le jeu de données, ce qui filtrera vos données."
				},
				"One or more datasets associated with this group of layers are unknown. Some data may not appear on the map.": {
					"$$noContext": "Un ou plusieurs jeux de données associés à ce groupe de couches sont introuvables. Certaines données peuvent ne pas apparaître sur la carte."
				},
				"One or more datasets used in this map are not available. Check if they are not deleted, unpublished or restricted to use this map as a widget. You can also delete the associated layers in the mapbuilder edit mode.": {
					"$$noContext": "Un ou plusieurs jeux de données utilisés sur cette carte sont introuvables. Vérifiez qu'ils n'ont pas été supprimé, dépublié ou restreint pour utiliser cette carte en tant que widget. Vous pouvez aussi supprimer les couches associées dans le mode édition de l'éditeur de carte."
				},
				"Only available if the dataset has a Geo Point field!": {
					"$$noContext": "Disponible seulement si le jeu de données contient un champ Point Géo !"
				},
				"Only download metadata and link to actual data": {
					"$$noContext": "Télécharger uniquement les métadonnées et le lien vers les données"
				},
				"Only one layer displayed at a time": {
					"$$noContext": "Une seule couche affichée à la fois"
				},
				"Only retrieve a certain amount of datasets. 0 means unlimited.": {
					"$$noContext": "Récupère seulement un certain nombre de jeux de données. 0 pour illimité."
				},
				"Only retrieve metadata and ignore records": {
					"$$noContext": "Récupérer uniquement les métadonnées et ignorer les enregistrements"
				},
				"Only the {{ nhits }} selected records": {
					"$$noContext": "Seulement les {{ nhits }} enregistrements sélectionnés"
				},
				"Only visible to administrators.": {
					"$$noContext": "Visible uniquement par les administrateurs."
				},
				"Opacity": {
					"$$noContext": "Opacité"
				},
				"Open categories palette modal": {
					"$$noContext": "Ouvrir la modale de choix des couleurs par catégorie"
				},
				"Open choropleth configuration modal": {
					"$$noContext": "Ouvrir la modale de configuration du choropleth"
				},
				"Open color picker": {
					"$$noContext": "Ouvrir le sélecteur de couleurs"
				},
				"Open menu": {
					"$$noContext": "Ouvrir le menu"
				},
				"Open page": {
					"$$noContext": "Ouvrir la page"
				},
				"Data4Citizen user accounts": {
					"$$noContext": "Comptes utilisateurs Data4Citizen"
				},
				"Data4Citizen's monthly newsletters": {
					"$$noContext": "Les lettres d'information mensuelles d'Data4Citizen"
				},
				"Operation": {
					"$$noContext": "Opération"
				},
				"Options": {
					"$$noContext": "Options"
				},
				"Or go to your datasets catalog page to review and publish them individually.": {
					"$$noContext": "Ou vous pouvez retourner à la page de catalogue des jeux de données pour les revoir et les publier individuellement."
				},
				"Order and groups": {
					"$$noContext": "Ordres et groupes"
				},
				"Orders and groups": {
					"$$noContext": "Ordres et groupes"
				},
				"Organization ID": {
					"$$noContext": "ID de l'organisation"
				},
				"Orthoimagery": {
					"inspire metadata template": "Ortho-imagerie"
				},
				"Other": {
					"$$noContext": "Autre"
				},
				"Other values": {
					"$$noContext": "Autres valeurs"
				},
				"Others": {
					"$$noContext": "Autres"
				},
				"Ounce": {
					"$$noContext": "Once"
				},
				"Out of bounds values": {
					"$$noContext": "Valeurs en dehors des bornes"
				},
				"Out of bounds {{ selectedLayer.properties.legendLabel }}": {
					"$$noContext": "{{ selectedLayer.properties.legendLabel }} en dehors des bornes"
				},
				"Override": {
					"$$noContext": "Surcharger"
				},
				"Override the DCAT metadata": {
					"$$noContext": "Surcharger les métadonnées DCAT"
				},
				"Override the INSPIRE metadata": {
					"$$noContext": "Surcharger les métadonnées INSPIRE"
				},
				"Override the custom metadata": {
					"$$noContext": "Surcharger les métadonnées personnalisées"
				},
				"Override the default metadata": {
					"$$noContext": "Surcharger les métadonnées par défaut"
				},
				"Overview of your datasets": {
					"$$noContext": "Résumé de vos jeux de données"
				},
				"Page": {
					"$$noContext": "Page"
				},
				"Page URL": {
					"$$noContext": "URL de la page"
				},
				"Page name...": {
					"$$noContext": "Nom de la page..."
				},
				"Page selection": {
					"$$noContext": "Sélection de la page"
				},
				"Page sharing": {
					"$$noContext": "Partage de page"
				},
				"Page size (in pixels)": {
					"$$noContext": "Taille de la page (en pixels)"
				},
				"Page title": {
					"$$noContext": "Titre des pages"
				},
				"Pages": {
					"$$noContext": "Pages"
				},
				"Pale blue": {
					"$$noContext": "Bleu pâle"
				},
				"Pale cherry": {
					"$$noContext": "Cerise pâle"
				},
				"Pale fuchsia": {
					"$$noContext": "Fuchsia pâle"
				},
				"Pale green": {
					"$$noContext": "Vert pâle"
				},
				"Pale oil": {
					"$$noContext": "Pétrole pâle"
				},
				"Pale orange": {
					"$$noContext": "Orange pâle"
				},
				"Pale purple": {
					"$$noContext": "Violet pâle"
				},
				"Pale royal blue": {
					"$$noContext": "Bleu roi pâle"
				},
				"Pale slate": {
					"$$noContext": "Ardoise pâle"
				},
				"Pale vermilion": {
					"$$noContext": "Vermillon pâle"
				},
				"Pale yellow": {
					"$$noContext": "Jaune pâle"
				},
				"Palette": {
					"$$noContext": "Palette"
				},
				"Parameter '{parameter_name}' is mandatory.": {
					"API error message": "Le paramètre '{parameter_name}' est obligatoire."
				},
				"Parameter '{parameter_name}' only accepts one value, but {num_values} values were provided.": {
					"API error message": "Le paramètre '{parameter_name}' n'accepte qu'une valeur mais {num_values} ont été fournies."
				},
				"Parameter name": {
					"$$noContext": "Nom du paramètre"
				},
				"Part per million": {
					"$$noContext": "Partie par million"
				},
				"Pascal": {
					"$$noContext": "Pascal"
				},
				"Password": {
					"$$noContext": "Mot de passe"
				},
				"Passwords don't match": {
					"$$noContext": "Les mots de passe ne sont pas identiques"
				},
				"Paste a JSON datapackage": {
					"$$noContext": "Collez un datapackage JSON"
				},
				"Paste data": {
					"$$noContext": "Collez des données"
				},
				"Paste here a GeoJSON content": {
					"$$noContext": "Collez ici votre object GeoJSON"
				},
				"Paste this code in a webpage to embed your map": {
					"$$noContext": "Coller ce code dans une page web pour y intégrer votre carte."
				},
				"Paste this code in a webpage to embed your page.": {
					"$$noContext": "Coller ce code dans une page web pour l'intégrer à celle-ci."
				},
				"Pasted geojson shape": {
					"$$noContext": "Objet GeoJSON"
				},
				"Pattern": {
					"$$noContext": "Motif"
				},
				"Percent": {
					"$$noContext": "Pourcent"
				},
				"Percentile": {
					"$$noContext": "Percentile"
				},
				"Permissions": {
					"$$noContext": "Permissions"
				},
				"Person or organisation that publishes the data": {
					"$$noContext": "Personne ou organisation qui publie les données"
				},
				"Petabyte": {
					"$$noContext": "Pétaoctets"
				},
				"Pie chart": {
					"$$noContext": "Camembert"
				},
				"Pie charts": {
					"$$noContext": "Camemberts"
				},
				"Please <a href=\"user/login/\">login</a> to submit a new reuse.": {
					"$$noContext": "<a href=\"user/login/\">Connectez-vous</a> pour proposer une réutilisation."
				},
				"Please <a href=\"mailto:support@data4citizen.com?Subject=[Harvesters][{{ config.DOMAIN_ID }}][{{ harvester.harvester_id }}]Error report\">contact us</a> to get help with these errors.": {
					"$$noContext": "Merci de <a href=\"mailto:support@data4citizen.com?Subject=[Harvesters][{{ config.DOMAIN_ID }}][{{ harvester.harvester_id }}]Error report\">contacter le support</a> pour obtenir de l'aide sur ces erreurs."
				},
				"Please confirm": {
					"$$noContext": "Confirmez"
				},
				"Please describe your issue": {
					"$$noContext": "Merci de décrire votre problème"
				},
				"Please select": {
					"$$noContext": "Sélectionnez"
				},
				"Please wait while we prepare your portal...": {
					"$$noContext": "Merci de patienter pendant que nous préparons votre domaine..."
				},
				"Point opacity": {
					"$$noContext": "Opacité des points"
				},
				"Polar chart": {
					"$$noContext": "Polaire"
				},
				"Popular": {
					"$$noContext": "Populaires "
				},
				"Population distribution - demography": {
					"inspire metadata template": "Répartition de la population - démographie"
				},
				"Portal Terms and Conditions and Privacy Policy": {
					"$$noContext": "Conditions d'utilisation du portail et politique de confidentialité"
				},
				"Position": {
					"$$noContext": "Emplacement"
				},
				"Pound": {
					"$$noContext": "Livre"
				},
				"Power or intensity": {
					"$$noContext": "Puissance ou intensité"
				},
				"Precision": {
					"$$noContext": "Précision"
				},
				"Preparing to publish...": {
					"$$noContext": "Préparation de la publication..."
				},
				"Preparing to unpublish...": {
					"$$noContext": "Préparation de la dépublication..."
				},
				"Press enter to collapse panel": {
					"$$noContext": "Appuyez sur entrée pour refermer le panneau"
				},
				"Press enter to expand panel": {
					"$$noContext": "Appuyez sur entrée pour ouvrir le panneau"
				},
				"Pressure": {
					"$$noContext": "Pression"
				},
				"Preview": {
					"$$noContext": "Aperçu"
				},
				"Preview data": {
					"$$noContext": "Aperçu"
				},
				"Preview privacy policy": {
					"$$noContext": "Prévisualiser la politique de confidentialité"
				},
				"Preview terms and conditions": {
					"$$noContext": "Prévisualiser les conditions d'utilisation"
				},
				"Previous": {
					"$$noContext": "Précédent"
				},
				"Price": {
					"$$noContext": "Prix"
				},
				"Privacy Policy": {
					"$$noContext": "Politique de confidentialité"
				},
				"Privacy policy link": {
					"$$noContext": "Lien vers la politique de confidentialité"
				},
				"Privacy policy link to display in <strong>{{ language | uppercase }}</strong>": {
					"$$noContext": "Lien vers la politique de confidentialité en <strong>{{ language | uppercase }}</strong>"
				},
				"Private access": {
					"$$noContext": "Accès privé"
				},
				"Private datasets": {
					"$$noContext": "Jeux de données privés"
				},
				"Processing": {
					"$$noContext": "Traitement"
				},
				"Processing aborted": {
					"$$noContext": "Traitement annulé"
				},
				"Processing alerts": {
					"$$noContext": "Alertes de traitement"
				},
				"Production and industrial facilities": {
					"inspire metadata template": "Lieux de production et sites industriels"
				},
				"Progression": {
					"$$noContext": "Progression"
				},
				"Properties": {
					"$$noContext": "Propriétés"
				},
				"Protected sites": {
					"inspire metadata template": "Sites protégés"
				},
				"Provider:": {
					"$$noContext": "Fournisseur :"
				},
				"Public": {
					"$$noContext": "Public"
				},
				"Public - All pages will be distributed as visible": {
					"$$noContext": "Publique - Toutes les pages distribuées seront visibles"
				},
				"Public Domain": {
					"default metadata template": "Domaine public"
				},
				"Public access": {
					"$$noContext": "Accès public"
				},
				"Public datasets": {
					"$$noContext": "Jeux de données publics"
				},
				"Publish": {
					"$$noContext": "Publier"
				},
				"Publish all of your harvested datasets": {
					"$$noContext": "Publier tous les datasets moissonnés "
				},
				"Publish harvester's datasets": {
					"$$noContext": "Publier les jeux de données du moissonneur"
				},
				"Publish your dataset to update your visualizations.": {
					"$$noContext": "Publiez votre jeu de données pour mettre à jour les visualisations."
				},
				"Published": {
					"$$noContext": "Publié"
				},
				"Producer": {
					"$$noContext": "Producteur"
				},
				"Publisher": {
					"$$noContext": "Organisation"
				},
				"Publishing in progress, collecting potential errors...": {
					"$$noContext": "Publication en cours, collecte des éventuelles erreurs..."
				},
				"Publishing queued, potential errors will be collected once it resumes.": {
					"$$noContext": "Publication en attente. Les éventuelles erreurs seront collectées lorsque celle-ci commencera."
				},
				"Purpose": {
					"$$noContext": "Objectif"
				},
				"Push API URL:": {
					"$$noContext": "URL de l'API de push :"
				},
				"Pyramid charts": {
					"$$noContext": "Graphiques pyramidaux"
				},
				"Quandl API key": {
					"$$noContext": "Clé API Quandl"
				},
				"Quandl databases may be huge, a number of datasets is required to limit the number of queries": {
					"$$noContext": "Les bases de données Quandl peuvent être énormes, un nombre de jeux de données est obligatoire pour limiter le nombre de requêtes"
				},
				"Query": {
					"$$noContext": "Requête"
				},
				"Queued": {
					"$$noContext": "En attente"
				},
				"Quota": {
					"$$noContext": "Quota"
				},
				"Quota alerts": {
					"$$noContext": "Alertes de quota"
				},
				"Quota exceeded": {
					"$$noContext": "Quota dépassé"
				},
				"Quota per": {
					"$$noContext": "Quota par"
				},
				"Quota used for domain": {
					"$$noContext": "Quota utilisé pour le domaine"
				},
				"Radius": {
					"$$noContext": "Rayon"
				},
				"Range": {
					"$$noContext": "Enveloppe"
				},
				"Range spline": {
					"$$noContext": "Enveloppe courbe"
				},
				"Receive monthly newsletters in:": {
					"$$noContext": "Recevoir les lettres d'information mensuelles en : "
				},
				"Recently modified first": {
					"$$noContext": "Récemment modifiés"
				},
				"Recommended length: 50 to 300 characters.": {
					"$$noContext": "Taille recommandée : 50 à 300 caractères "
				},
				"Record": {
					"$$noContext": "Enregistrement"
				},
				"Records": {
					"$$noContext": "Enregistrements"
				},
				"Records limit reached": {
					"$$noContext": "Limite d'enregistrements atteinte"
				},
				"Recover data": {
					"$$noContext": "Récupérer les données"
				},
				"Recovering realtime records": {
					"$$noContext": "Restauration du temps réel"
				},
				"Recovery": {
					"$$noContext": "Récupération"
				},
				"Redirecting to the new group's page, please wait.": {
					"$$noContext": "Redirection vers la page du nouveau groupe, merci de patienter."
				},
				"Redirecting to the new harvester's page, please wait.": {
					"$$noContext": "Redirection vers la page du nouveau moissonneur, merci de patienter."
				},
				"Redirection URL": {
					"$$noContext": "URL de redirection"
				},
				"Redo": {
					"$$noContext": "Refaire"
				},
				"Reference": {
					"$$noContext": "Référence"
				},
				"Refinements to apply": {
					"$$noContext": "Refinements à prendre en compte"
				},
				"Refines": {
					"$$noContext": "Filtres"
				},
				"Refresh URL": {
					"$$noContext": "URL de mise à jour"
				},
				"Refresh token": {
					"$$noContext": "Mettre à jour le jeton"
				},
				"Register": {
					"$$noContext": "Enregistrer"
				},
				"Register a new OAuth2 application": {
					"$$noContext": "Enregistrer une nouvelle application OAuth2"
				},
				"Registered OAuth2 applications": {
					"$$noContext": "Applications OAuth2 enregistrées "
				},
				"Reject this access request": {
					"$$noContext": "Décliner cette demande d'accès"
				},
				"Reject this reuse": {
					"$$noContext": "Rejeter la réutilisation"
				},
				"Release mouse to finish drawing": {
					"$$noContext": "Relâchez la souris pour terminer le dessin"
				},
				"Remote API auto discovery": {
					"$$noContext": "Génération automatique de la configuration"
				},
				"Remote base url": {
					"$$noContext": "base de l'URL distante"
				},
				"Remote path": {
					"$$noContext": "Chemin d'accès distant"
				},
				"Remove": {
					"$$noContext": "Supprimer"
				},
				"Remove all": {
					"$$noContext": "Enlever tout"
				},
				"Remove all filters for this dataset": {
					"$$noContext": "Supprimer tous les filtres pour ce jeu de données"
				},
				"Remove all filters?": {
					"$$noContext": "Supprimer tous les filtres ?"
				},
				"Remove all of the group's permissions": {
					"$$noContext": "Enlever toutes les permissions du groupe"
				},
				"Remove application": {
					"$$noContext": "Supprimer l'application"
				},
				"Remove application ?": {
					"$$noContext": "Supprimer l'application ?"
				},
				"Remove custom asset?": {
					"$$noContext": "Supprimer la ressource ?"
				},
				"Remove dataset": {
					"$$noContext": "Retirer le jeu de données"
				},
				"Remove dataset from the map": {
					"$$noContext": "Retirer le jeu de données de la carte"
				},
				"Remove facet": {
					"$$noContext": "Supprimer la facette"
				},
				"Remove filter": {
					"$$noContext": "Supprimer le filtre"
				},
				"Remove filters": {
					"$$noContext": "Supprimer les filtres"
				},
				"Remove group permissions": {
					"$$noContext": "Supprimer les permissions de groupe"
				},
				"Remove layer": {
					"$$noContext": "Supprimer la couche"
				},
				"Remove page?": {
					"$$noContext": "Supprimer la page ?"
				},
				"Remove permission": {
					"$$noContext": "Supprimer la permission"
				},
				"Remove the page": {
					"$$noContext": "Supprimer la page"
				},
				"Remove this color": {
					"$$noContext": "Supprimer cette couleur"
				},
				"Remove this dataset": {
					"$$noContext": "Supprimer ce jeu de données"
				},
				"Remove this field": {
					"$$noContext": "Supprimer ce champ"
				},
				"Remove this menu item": {
					"$$noContext": "Supprimer cet élément du menu"
				},
				"Remove this metadata": {
					"$$noContext": "Supprimer cette métadonnée"
				},
				"Remove this page": {
					"$$noContext": "Supprimer cette page"
				},
				"Remove this user": {
					"$$noContext": "Supprimer cet utilisateur"
				},
				"Remove user": {
					"$$noContext": "Supprimer l'utilisateur"
				},
				"Remove user from group?": {
					"$$noContext": "Enlever l'utilisateur du groupe ?"
				},
				"Remove user from the group": {
					"$$noContext": "Supprimer l'utilisateur du groupe"
				},
				"Remove user permissions": {
					"$$noContext": "Supprimer les permissions utilisateur"
				},
				"Remove user?": {
					"$$noContext": "Supprimer l'utilisateur ?"
				},
				"Remove value": {
					"$$noContext": "Supprimer la valeur"
				},
				"Renew API key": {
					"$$noContext": "Renouveler la clé d'API"
				},
				"Renewing the API key will break all applications that uses this key. Are you sure you want to do this ?": {
					"$$noContext": "Renouvelez la clé d'API empêchera toutes les applications utilisant cette clé de fonctionner. Êtes vous sûr de vouloir faire cela ?"
				},
				"Reorder": {
					"$$noContext": "Réordonner"
				},
				"Replace": {
					"$$noContext": "Remplacer"
				},
				"Reports and alerts": {
					"$$noContext": "Rapports et alertes"
				},
				"Republish": {
					"$$noContext": "Republier"
				},
				"Request timeout: please retry the request later or contact the administrator.": {
					"$$noContext": "Expiration de la requête : réessayez la requête plus tard ou contactez un administrateur. "
				},
				"Request unauthorized: authentication is required.": {
					"$$noContext": "Requête non autorisée : authentification requise"
				},
				"Reset approvals": {
					"$$noContext": "Réinitialiser les approbations"
				},
				"Reset search": {
					"$$noContext": "Réinitialiser la recherche"
				},
				"Reset to default": {
					"$$noContext": "Réinitialiser"
				},
				"Reset value": {
					"$$noContext": "Réinitialiser"
				},
				"Reset zoom": {
					"$$noContext": "Réinitialiser le zoom"
				},
				"Restart harvester": {
					"$$noContext": "Redémarrer le moissonnage"
				},
				"Restore": {
					"$$noContext": "Restaurer"
				},
				"Restricted": {
					"$$noContext": "Restreint"
				},
				"Restricted - All pages will be distributed as restricted": {
					"$$noContext": "Restreint - Toutes les pages distribuées seront restreintes"
				},
				"Restricted access": {
					"$$noContext": "Accès restreint"
				},
				"Restricted on :": {
					"$$noContext": "Filtré sur"
				},
				"Restrictions": {
					"$$noContext": "Restrictions"
				},
				"Resulting URL": {
					"$$noContext": "URL résultante"
				},
				"Return to map edition": {
					"$$noContext": "Retour à l'édition de la carte"
				},
				"Return to original value": {
					"$$noContext": "Retour valeur d'origine"
				},
				"Reuse deleted": {
					"$$noContext": "Réutilisation supprimée"
				},
				"Reuse rejected": {
					"$$noContext": "Réutilisation rejetée"
				},
				"Reuse title": {
					"$$noContext": "Titre de la réutilisation"
				},
				"Reuses": {
					"$$noContext": "Réutilisations"
				},
				"Reverse alphabetical order": {
					"$$noContext": "Ordre alphabétique inverse"
				},
				"Reverse alphabetically": {
					"$$noContext": "Anti alphabétique"
				},
				"Revoke application": {
					"$$noContext": "Révoquer l'application"
				},
				"Revoke application ?": {
					"$$noContext": "Révoquer l'application ?"
				},
				"Revoke authorization": {
					"$$noContext": "Révoquer l'autorisation"
				},
				"Revoke identity": {
					"$$noContext": "Révoquer l'identité"
				},
				"Revoke key": {
					"$$noContext": "Révoquer cette clé"
				},
				"Revoke key ?": {
					"$$noContext": "Révoquer la clé ?"
				},
				"Revoke this user's access to the portal": {
					"$$noContext": "Révoquer l'accès de cet utilisateur au portail"
				},
				"Rights": {
					"$$noContext": "Droits"
				},
				"Run this harvester": {
					"$$noContext": "Lancer ce moissonneur"
				},
				"SAML users": {
					"$$noContext": "Utilisateurs SAML"
				},
				"SOAP WSDL": {
					"$$noContext": "SOAP WSDL"
				},
				"SSO (SAML)": {
					"$$noContext": "SSO (SAML)"
				},
				"Saagie domain identifier": {
					"$$noContext": "Identifiant du domaine Saagie"
				},
				"Saagie domain identifier is required": {
					"$$noContext": "L'identifiant du domaine Saagie est obligatoire"
				},
				"Sample": {
					"$$noContext": "Exemple"
				},
				"Sat": {
					"$$noContext": "sam"
				},
				"Saturday": {
					"$$noContext": "samedi"
				},
				"Save": {
					"$$noContext": "Enregistrer"
				},
				"Save and distribute": {
					"$$noContext": "Sauver et distribuer"
				},
				"Save and start harvester": {
					"$$noContext": "Sauver et démarrer le moissonneur"
				},
				"Save my information": {
					"$$noContext": "Sauvegarder mes informations"
				},
				"Save this chart": {
					"$$noContext": "Sauvegarder le graphique"
				},
				"Save your map": {
					"$$noContext": "Sauvegarder votre carte"
				},
				"Save your modifications if you want to test the API.": {
					"$$noContext": "Sauvegardez vos modifications si vous voulez tester l'API."
				},
				"Saving snapshot": {
					"$$noContext": "Sauvegarde d'un snapshot"
				},
				"Saving your chart allows you to get a simplified and fixed address to share.": {
					"$$noContext": "Sauvegarder votre graphe vous permet d'obtenir une adresse simple et fixe pour le partager."
				},
				"Scatter plot": {
					"$$noContext": "Nuage de points"
				},
				"Scheduled": {
					"$$noContext": "Planifié"
				},
				"Scheduling": {
					"$$noContext": "Planificateur"
				},
				"Scope": {
					"$$noContext": "Contexte (scope)"
				},
				"Scratch recovery data": {
					"$$noContext": "Effacer les données de récupération"
				},
				"Sea regions": {
					"inspire metadata template": "Régions maritimes"
				},
				"Search a visualization": {
					"$$noContext": "Rechercher une visualisation"
				},
				"Search an icon": {
					"$$noContext": "Rechercher une icône"
				},
				"Search in catalog": {
					"$$noContext": "Chercher dans le catalogue"
				},
				"Search in {{facetName}}": {
					"$$noContext": "Chercher dans {{facetName}}"
				},
				"Search visualization": {
					"$$noContext": "Rechercher une visualisation"
				},
				"Search...": {
					"$$noContext": "Rechercher ..."
				},
				"Seconds": {
					"$$noContext": "Secondes"
				},
				"Security": {
					"$$noContext": "Sécurité"
				},
				"See errors": {
					"$$noContext": "Voir les erreurs"
				},
				"See processing errors": {
					"$$noContext": "Voir les erreurs de traitement"
				},
				"See record": {
					"$$noContext": "Voir l'enregistrement"
				},
				"See the incomplete dataset": {
					"$$noContext": ["Voir le jeu de données incomplet", "Voir les {{ $count | number }} jeux de données incomplets"]
				},
				"See the older dataset": {
					"$$noContext": ["Voir le jeu de données le plus ancien", "Voir les {{ $count | number }} jeux de données les plus anciens"]
				},
				"Select": {
					"$$noContext": "Sélectionner"
				},
				"Select a filter": {
					"$$noContext": "Sélectionner un filtre"
				},
				"Select a pictogram from a list": {
					"$$noContext": "Choisir un pictogramme depuis une liste"
				},
				"Select a source dataset": {
					"$$noContext": "Sélectionner un jeu de données source"
				},
				"Select color": {
					"$$noContext": "Sélectionner"
				},
				"Select domains": {
					"$$noContext": "Sélection des domaines"
				},
				"Select group to add": {
					"$$noContext": "Choisissez le groupe à ajouter"
				},
				"Select icon": {
					"$$noContext": "Sélectionner l'icône"
				},
				"Select image...": {
					"$$noContext": "Choisir une image..."
				},
				"Select one to boostrap your domain with two interesting datasets or simply skip this step.": {
					"$$noContext": "Sélectionnez en un pour amorcer votre domaine avec deux jeux de données ou simplement passez cette étape."
				},
				"Select pages": {
					"$$noContext": "Sélectionnez des pages"
				},
				"Select the distribution parameter to match with the dataset field": {
					"$$noContext": "Sélectionnez le paramètre de distribution à associer avec le champ du jeu de données"
				},
				"Select the pages you wish to distribute to the subdomain.": {
					"$$noContext": "Sélectionner les pages à distribuer au sous-domaine."
				},
				"Select which filters you want to see": {
					"$$noContext": "Sélectionnez les filtres que vous voulez afficher"
				},
				"Send": {
					"$$noContext": "Envoyer"
				},
				"Send data": {
					"$$noContext": "Envoyer les données"
				},
				"Send feedback": {
					"$$noContext": "Soumettre la contribution"
				},
				"Send message": {
					"$$noContext": "Envoyer le message"
				},
				"Send your feedback": {
					"$$noContext": "Ajouter une contribution"
				},
				"Sending invitations": {
					"$$noContext": "Envoi des invitations"
				},
				"Sending message": {
					"$$noContext": "Envoi du message"
				},
				"Sent when a dataset finishes its processing with errors or when a realtime dataset did not receive data for a defined period of time.": {
					"$$noContext": "Envoyés à chaque fois qu'un jeu de données termine son processus de traitement en retournant des erreurs ou lorsqu'un jeu de données temps réel n'a pas reçu de données depuis longtemps."
				},
				"Sent when one of your api calls quota is about to expire (80% reached) or expired.": {
					"$$noContext": "Envoyés lorsqu'un de vos quota de requêtes d’API va être atteint (à 80% de sa limite) ou lorsqu'il est atteint."
				},
				"Sep": {
					"$$noContext": "sept"
				},
				"September": {
					"$$noContext": "septembre"
				},
				"Series break down is not available with treemaps and requires a second facet.": {
					"$$noContext": "La ventilation par facette n'est pas disponible sur les treemap et nécessite une deuxième facette."
				},
				"Series configuration": {
					"$$noContext": "Configuration des séries"
				},
				"Set as facet": {
					"$$noContext": "Définir comme facette"
				},
				"Set colors": {
					"$$noContext": "Définir les couleurs"
				},
				"Set distribution parameters": {
					"$$noContext": "Définissez les paramètres de distribution"
				},
				"Set recurring runs": {
					"$$noContext": "Paramétrer les traitements récurrents"
				},
				"Set the value of the parameters for distributing and filtering data according to the subdomain properties": {
					"$$noContext": "Attribuez une valeur aux paramètres utilisés pour distribuer et filtrer les données selon les caractéristiques du sous-domaine."
				},
				"Set this option if the portal requires to constraint the language to CQL_TEXT": {
					"$$noContext": "Sélectionnez cette option si le portail requiert de contraindre le langage à CQL_TEXT"
				},
				"Set to now": {
					"$$noContext": "Régler à maintenant"
				},
				"Settings": {
					"$$noContext": "Paramètres"
				},
				"Several layers displayed at a time": {
					"$$noContext": "Plusieurs couches affichées en simultané"
				},
				"Shape opacity": {
					"$$noContext": "Opacité des formes"
				},
				"Shapes border": {
					"$$noContext": "Bordure des formes"
				},
				"Shapes border opacity": {
					"$$noContext": "Opacité des bordures des formes"
				},
				"Shapes border size": {
					"$$noContext": "Taille des bordures des formes"
				},
				"Shapes style": {
					"$$noContext": "Styles des formes"
				},
				"Share": {
					"$$noContext": "Partager"
				},
				"Share by email": {
					"$$noContext": "Partager par email"
				},
				"Share on Facebook": {
					"$$noContext": "Partager sur Facebook"
				},
				"Share on Linkedin": {
					"$$noContext": "Partager sur Linkedin"
				},
				"Share on Twitter": {
					"$$noContext": "Partager sur Twitter"
				},
				"Sharing": {
					"$$noContext": "Partage"
				},
				"Sharing is caring": {
					"$$noContext": "Partager c'est aimer"
				},
				"Short - dot": {
					"$$noContext": "Court - points"
				},
				"Short - dot - dot": {
					"$$noContext": "Court - points - points"
				},
				"Short dashes": {
					"$$noContext": "Tirets courts"
				},
				"Short description of your work (max. 50 characters)": {
					"$$noContext": "Courte description de votre travail (max. 50 caractères)"
				},
				"Title of your work (max. 100 characters)": {
					"$$noContext": "Titre de votre travail (max. 100 caractères)"
				},
				"Show all": {
					"$$noContext": "Tout afficher"
				},
				"Show errors": {
					"$$noContext": "Montrer les erreurs"
				},
				"Show less...": {
					"$$noContext": "Voir moins..."
				},
				"Show me where I am": {
					"$$noContext": "Détecter ma localisation"
				},
				"Show more...": {
					"$$noContext": "Voir plus..."
				},
				"Show warnings": {
					"$$noContext": "Aller aux erreurs"
				},
				"Show/hide details": {
					"$$noContext": "Afficher/cacher les détails"
				},
				"Shows the theme usage on your data for a better overview of your organization's activities.": {
					"$$noContext": "Présente la répartition des thèmes de vos données pour une meilleure vue d'ensemble des activités de votre organisation."
				},
				"Sign in using my SAML account": {
					"$$noContext": "Se connecter avec mon compte SAML"
				},
				"Simple homepage": {
					"$$noContext": "Page d'accueil simple"
				},
				"Simple icons allow for easy scanning": {
					"$$noContext": "Ces petites icônes permettent de retrouver facilement le jeu de donnée qui vous intéresse."
				},
				"Simple pages": {
					"$$noContext": "Pages simples"
				},
				"Since your domain is private, the new domain will also be private.": {
					"$$noContext": "Votre domaine étant privé, le nouveau sous domaine le sera également."
				},
				"Single block": {
					"$$noContext": "Bloc simple"
				},
				"Site URL": {
					"$$noContext": "URL du site"
				},
				"Site URL is required": {
					"$$noContext": "L'URL du site est obligatoire"
				},
				"Size": {
					"$$noContext": "Taille"
				},
				"Skip": {
					"$$noContext": "Passer"
				},
				"Skip a certain amount of datasets before starting to harvest": {
					"$$noContext": "Sauter un certain nombre de jeux de donnés avant de commencer le moissonnage"
				},
				"Skip and go directly to the portal": {
					"$$noContext": "Passer et aller directement au portail"
				},
				"Slideshow": {
					"$$noContext": "Visionneuse d'images"
				},
				"Snapshots": {
					"$$noContext": "Snapshots"
				},
				"Snapshots can't be created from restricted datasets.": {
					"$$noContext": "Il n'est pas possible de créer de snapshot d'un jeu de données restreint."
				},
				"So, what's a harvester again?": {
					"$$noContext": "C'est quoi un moissonneur ? "
				},
				"Socrata URL is required": {
					"$$noContext": "L'URL Socrata est requise"
				},
				"Soil": {
					"inspire metadata template": "Sols"
				},
				"Solr format query. Ex: 'value AND filterKey1:filterValue1 OR filterKey2:filterValue2 ...'": {
					"$$noContext": "Requête au format Solr. Exemple: 'value AND filterKey1:filterValue1 OR filterKey2:filterValue2 ...'"
				},
				"Some datasets could not be harvested": {
					"$$noContext": "Certains jeux de données n'ont pas pu être moissonnés"
				},
				"Some operations couldn't be performed.": {
					"$$noContext": "Certaines opérations n'ont pas pu être effectuées."
				},
				"Some users could not be added to the group": {
					"$$noContext": "Certains utilisateurs n'ont pas pu être ajoutés au groupe"
				},
				"Sorry, this file cannot be displayed": {
					"$$noContext": "Désolé, ce fichier ne peut pas être affiché"
				},
				"Sort column {{ field.label }} in ascending order": {
					"$$noContext": "Trier la colonne {{ field.label }} en ordre ascendant"
				},
				"Sort column {{ field.label }} in descending order": {
					"$$noContext": "Trier la colonne {{ field.label }} en ordre descendant"
				},
				"Sort datasets": {
					"$$noContext": "Tri des jeux"
				},
				"Sort expression (field or -field)": {
					"$$noContext": "Critère de tri (champ ou -champ)"
				},
				"Sort facet by:": {
					"$$noContext": "Trier la facette par :"
				},
				"Sort parameter": {
					"$$noContext": "Paramètre de tri"
				},
				"Sortable": {
					"$$noContext": "Triable"
				},
				"Sorting of the CKAN search results. Default: 'relevance asc, metadata_modified desc'. This is a comma-separated string of field names and sort-orderings. e.g. relevance desc": {
					"$$noContext": "Tri des résultats CKAN: Par défaut: 'relevance asc, metadata_modified desc'. Ce paramètre est une liste de noms de champs et d'ordre de tri séparés par des virgules. e.g. relevance desc"
				},
				"Source": {
					"$$noContext": "Source"
				},
				"Source configuration": {
					"$$noContext": "Configuration de la source"
				},
				"Source extraction preview": {
					"$$noContext": "Prévisualisation de l'extraction"
				},
				"Source of the data that must be mentioned for legal reasons": {
					"$$noContext": "Source des données à mentionner pour des raisons légales"
				},
				"Sources": {
					"$$noContext": "Sources"
				},
				"Southbound latitude": {
					"$$noContext": "Latitude Sud"
				},
				"Spatial": {
					"$$noContext": "Emplacement"
				},
				"Spatial data service": {
					"inspire metadata template": "Service de données géographiques"
				},
				"Spatial data set": {
					"inspire metadata template": "Série de données géographiques"
				},
				"Spatial data set series": {
					"inspire metadata template": "Ensemble de séries de données géographiques"
				},
				"Spatial resolution": {
					"$$noContext": "Résolution spatiale"
				},
				"Special": {
					"$$noContext": "Spécial"
				},
				"Special groups": {
					"$$noContext": "Groupes spéciaux"
				},
				"Specialized formats": {
					"$$noContext": "Formats spécialisés"
				},
				"Species distribution": {
					"inspire metadata template": "Répartition des espèces"
				},
				"Specific domain": {
					"$$noContext": "Domaine spécifique"
				},
				"Specify category colors": {
					"$$noContext": "Spécifier les couleurs des catégories"
				},
				"Specify category for series": {
					"$$noContext": "Spécifier les catégories des séries"
				},
				"Speed": {
					"$$noContext": "Vitesse"
				},
				"Spiderweb chart": {
					"$$noContext": "Radar"
				},
				"Spline": {
					"$$noContext": "Courbe"
				},
				"Split": {
					"$$noContext": "Dissocier"
				},
				"Split group": {
					"$$noContext": "Séparer le groupe"
				},
				"Square centimeter": {
					"$$noContext": "Centimètre carré"
				},
				"Square feet": {
					"$$noContext": "Pied carré"
				},
				"Square kilometer": {
					"$$noContext": "Kilomètre carré"
				},
				"Square meter": {
					"$$noContext": "Mètre carré"
				},
				"Square millimeter": {
					"$$noContext": "Millimètre carré"
				},
				"Stack": {
					"$$noContext": "Empilement"
				},
				"Standard deviation": {
					"$$noContext": "Ecart type"
				},
				"Standard tooltip": {
					"$$noContext": "Infobulle standard"
				},
				"Start harvester": {
					"$$noContext": "Démarrer le moissonneur"
				},
				"Start harvesting by clicking on the <em>start harvester</em> button (harvesting datasets may take some time on the bigger ones).": {
					"$$noContext": "Commencer le moissonnage en cliquant sur le bouton <em>Démarrer le moissonneur</em> (le moissonnage des données peut prendre un peu de temps sur les jeux de données les plus gros)."
				},
				"Start time": {
					"$$noContext": "Début"
				},
				"Statistical units": {
					"inspire metadata template": "Unités statistiques"
				},
				"Still not quite sure about this page? Contact our support and you'll get help in no time.": {
					"$$noContext": "Vous vous posez toujours des questions à propos de cette page ? Contactez notre support !"
				},
				"Straight line": {
					"$$noContext": "Ligne"
				},
				"Street level": {
					"$$noContext": "Niveau rue"
				},
				"Styles": {
					"$$noContext": "Styles"
				},
				"Styles (comma-separated)": {
					"$$noContext": "Styles (séparées par des virgules)"
				},
				"Stylesheet": {
					"$$noContext": "Feuille de style"
				},
				"Subdirectory": {
					"$$noContext": "Sous répertoire"
				},
				"Subdomain brand name": {
					"$$noContext": "Marque du sous-domaine"
				},
				"Subdomain identifier": {
					"$$noContext": "Identifiant du sous-domaine"
				},
				"Subdomain name": {
					"$$noContext": "Nom du sous-domaine"
				},
				"Subdomains": {
					"$$noContext": "Sous-domaines"
				},
				"Subdomains can now receive datasets and pages from the parent domain with the possibility to filter the data you're distributing. You can either distribute complete or filtered datasets.": {
					"$$noContext": "Les sous-domaines peuvent maintenant recevoir des jeux de données et des pages du domaine parent avec la possibilité de filtrer les données distribuées. Vous pouvez distribuer des jeux de données filtrés ou complets. "
				},
				"Submit": {
					"$$noContext": "Envoyer"
				},
				"Submit a reuse": {
					"$$noContext": "Soumettre une réutilisation"
				},
				"Submit feedback": {
					"$$noContext": "Envoyer une remarque"
				},
				"Submitted by": {
					"$$noContext": "Soumis par"
				},
				"Submitted feedback": {
					"$$noContext": "Contributions soumises"
				},
				"Subscribe to:": {
					"$$noContext": "S'abonner à :"
				},
				"Subscribers": {
					"$$noContext": "Abonnés"
				},
				"Subscribing": {
					"$$noContext": "Abonnement"
				},
				"Success": {
					"$$noContext": "Succès"
				},
				"Suggest a new record": {
					"$$noContext": "Suggérer un nouvel enregistrement"
				},
				"Suggest new values (optional)": {
					"$$noContext": "Suggérer de nouvelles valeurs (optionnel)"
				},
				"Suggest values for the new record (optional)": {
					"$$noContext": "Suggérer des valeurs pour le nouvel enregistrement (optionnel)"
				},
				"Suggested values": {
					"$$noContext": "Valeurs suggérées"
				},
				"Sum": {
					"$$noContext": "Somme"
				},
				"Sun": {
					"$$noContext": "dim"
				},
				"Sunday": {
					"$$noContext": "dimanche"
				},
				"Sunrise": {
					"$$noContext": "Lever de soleil"
				},
				"Surface": {
					"$$noContext": "Surface"
				},
				"Swagger JSON": {
					"$$noContext": "Swagger JSON"
				},
				"Switch to expert mode?": {
					"$$noContext": "Passer en mode expert ?"
				},
				"Switching to expert mode allows you directly edit the html code. You CANNOT go back to the current template after that.": {
					"$$noContext": "L'édition en mode expert vous permet de modifier le code html directement. vous NE pourrez PLUS revenir en arrière une fois la sauvegarde effectuée."
				},
				"System": {
					"$$noContext": "Système"
				},
				"TB": {
					"$$noContext": "To"
				},
				"TMS service": {
					"$$noContext": "Service TMS"
				},
				"Table": {
					"$$noContext": "Tableau"
				},
				"Tags": {
					"$$noContext": "Tags"
				},
				"Take a look at the <a href=\"/api\" target=\"_blank\"><i class=\"icon-book\"></i> API page</a> to try the other API services!": {
					"$$noContext": "Jetez un oeil à la <a href=\"/api\" target=\"_blank\"><i class=\"icon-book\"></i> page API</a> pour essayer les autres API !"
				},
				"Temperature": {
					"$$noContext": "Température"
				},
				"Template": {
					"$$noContext": "Modèle"
				},
				"Temporal": {
					"$$noContext": "Période de temps"
				},
				"Terabyte": {
					"$$noContext": "Téraoctets"
				},
				"Terawatt hour": {
					"$$noContext": "Térawatt-heure"
				},
				"Test your configuration": {
					"$$noContext": "Tester votre configuration"
				},
				"Terms and Conditions": {
					"$$noContext": "Conditions d'utilisation"
				},
				"Terms and conditions link": {
					"$$noContext": "Lien vers la conditions d'utilisation"
				},
				"Terms and conditions link to display in <strong>{{ language | uppercase }}</strong>": {
					"$$noContext": "Lien vers les conditions d'utilisation en <strong>{{ language | uppercase }}</strong>"
				},
				"Text languages": {
					"$$noContext": "Langues du texte"
				},
				"Text search": {
					"$$noContext": "Recherche textuelle"
				},
				"Text transformations": {
					"$$noContext": "Transformation de texte"
				},
				"Thank you!": {
					"$$noContext": "Merci !"
				},
				"The API preview console is accessible when the dataset is unmodified.": {
					"$$noContext": "L'aperçu de la console d'API n'est accessible que lorsque le jeu de données n'est pas modifié"
				},
				"The Api key used to access the harvested domain": {
					"$$noContext": "La clé d'API utilisée pour accéder au domaine à moissonner"
				},
				"The CKAN root API URL, e.g.http://www.hri.fi/api/3": {
					"$$noContext": "L'URL racine de l'API CKAN, e.g.http://www.hri.fi/api/3"
				},
				"The CSV filename on the FTP server which contains resources metadata, e.g. metas.csv": {
					"$$noContext": "Le nom de fichier sur le serveur FTP contenant les métadonnées des ressources, e.g. metas.csv"
				},
				"The ID of the collection you wish to harvest (https://public.enigma.com/browse/.../THIS)": {
					"$$noContext": "L'identifiant de la collection que vous souhaitez moissonner (https://public.enigma.com/browse/.../ICI)"
				},
				"The ID of the organisation you want to harvest": {
					"$$noContext": "L'ID de l'organisation que vous souhaitez moissonner"
				},
				"The Junar portal API key for authentication": {
					"$$noContext": "La clé d'API Junar utilisée pour l'authentification"
				},
				"The URL of the portal you want to harvest": {
					"$$noContext": "L'URL du portail que vous voulez moissonner"
				},
				"The back office (portal administration, dataset publication etc.) won't be affected.": {
					"$$noContext": "L'interface d'administration et de publication ne sera pas affectée."
				},
				"The base URL of the ArcGIS REST service without parameters, e.g. http://sampleserver1.arcgisonline.com/ArcGIS/rest/services": {
					"$$noContext": "L'URL du service REST ArcGIS sans paramètres, e.g. http://sampleserver1.arcgisonline.com/ArcGIS/rest/services"
				},
				"The base URL of the CSW geoportal, e.g. 216.58.198.196 or mygeoportal.com": {
					"$$noContext": "L'URL de base du géoportail CSW, par ex. 216.58.198.196 ou mongeoportail.fr"
				},
				"The base URL of the CSW geoportal, e.g. https://infogeo.grandpoitiers.fr/geoportal/csw": {
					"$$noContext": "L'URL de base du géoportail CSW, e.g. https://infogeo.grandpoitiers.fr/geoportal/csw"
				},
				"The base URL of the Junar portal, e.g. http://api.datosabiertos.presidencia.go.cr/api/v2/datastreams/": {
					"$$noContext": "L'URL de base du portail Junar, e.g. http://api.datosabiertos.presidencia.go.cr/api/v2/datastreams/"
				},
				"The base URL of the WFS service, e.g. http://sampleserver1.com/services/wfs": {
					"$$noContext": "L'URL de base du service WFS, e.g. http://sampleserver1.com/services/wfs"
				},
				"The base URL of the portal": {
					"$$noContext": "L'URL de base du portail"
				},
				"The code of the database you want to harvest": {
					"$$noContext": "Le code de la base de données que vous voulez moissonner"
				},
				"The collection code is required": {
					"$$noContext": "L'identifiant de la collection est requis"
				},
				"The data you submitted is invalid.": {
					"$$noContext": "Les données soumises sont invalides."
				},
				"The database code is required": {
					"$$noContext": "Le code de la base de données est obligatoire"
				},
				"The dataset associated with this layer is unknown. Some data may not appear on the map.": {
					"$$noContext": "Le jeu de données associé à cette couche est introuvable. Certaines données peuvent ne pas apparaître sur la carte."
				},
				"The dataset can't be found: either it doesn't exist, or you don't have the permissions to access it.": {
					"$$noContext": "Le jeu de donnée n'a pas été trouvé; cela peut signifier qu'il n'existe pas, ou que vous n'avez pas les permissions pour y accéder."
				},
				"The dataset is already being processed, it can't be deleted right now": {
					"$$noContext": "Le jeu de données est déjà en cours de traitement, il ne peut être supprimé actuellement"
				},
				"The datasets' index has a new user interface!": {
					"$$noContext": "L'inventaire des jeux de données change de visage !"
				},
				"The distribution parameters you define for a subdomain can later be used to distribute data to this subdomain. The parameters values are invisible from the subdomain point of view and cannot be modified on the subdomain.": {
					"$$noContext": "Les paramètres de distribution que vous définissez pour un sous-domaine peuvent être utilisés plus tard pour distribuer des données à ce sous-domaine. Les valeurs des paramètres sont invisibles du point de vue du sous-domaine et ne peuvent pas y être modifiés."
				},
				"The domain identifier contains invalid characters.": {
					"$$noContext": "L'identifiant du domaine contient des caractères invalides."
				},
				"The domain identifier is already used.": {
					"$$noContext": "L'identifiant du domaine est déjà utilisé."
				},
				"The file holding the metadata and filenames about the resources you want to harvest": {
					"$$noContext": "Le fichier contenant les métadonnées et noms de fichiers des ressources à moissonner"
				},
				"The file size exceeds the limit.": {
					"$$noContext": "La taille du fichier dépasse la limite."
				},
				"The file you tried to upload exceeds the limit size.": {
					"$$noContext": "Le fichier que vous essayez d'envoyer dépasse la taille limite."
				},
				"The filters have been reorganised so that you can choose to display only those relevant to you.": {
					"$$noContext": "Les filtres ont été réorganisés pour que vous puissiez choisir de n'afficher que ceux qui vous sont utiles."
				},
				"The filters layout is changing!": {
					"$$noContext": "L'organisation des filtres change !"
				},
				"The first section starts with all the mandatory parameters.": {
					"$$noContext": "La première section commence avec tous les paramètres obligatoires."
				},
				"The following JSON object is a standardized description of your dataset's schema.": {
					"$$noContext": "L'objet JSON ci dessous est une description standardisée du modèle de votre jeu de données."
				},
				"The following placeholders are required in your code, in order to display the menus and their links. You don't need to manually add links to your pages, as it is handled directly using the interface in your Domain page.": {
					"$$noContext": "Les marqueurs suivants vous seront nécessaire pour afficher les menus et leurs liens. Vous n'avez pas besoin d'ajouter manuellement des liens vers vos pages, tout se fera automatiquement à partir de la configuration mise en place via l'interface de gestion de la navigation."
				},
				"The following placeholders can be used but are not mandatory.": {
					"$$noContext": "Les marqueurs ci dessous peuvent être utilisés mais ne sont pas obligatoires."
				},
				"The following placeholders provide easy access to dynamic content.": {
					"$$noContext": "Les marqueurs ci dessous permettent d'insérer facilement du contenu dynamique."
				},
				"The geographic area will be defined as the smallest envelope containing all of the records' locations.": {
					"$$noContext": "La zone géographique sera définie comme la plus petite enveloppe contenant tous les enregistrements."
				},
				"The group has been deleted from your portal. You'll now be redirected to the groups management page.": {
					"$$noContext": "Ce groupe a été supprimé de votre portail. Vous allez maintenant être redirigé vers la page de gestion des groupes."
				},
				"The harvested datasets have been published": {
					"$$noContext": "Les jeux de données moissonnés ont été publiés "
				},
				"The harvested datasets have been unpublished": {
					"$$noContext": "Les jeux de données moissonnés ont été dépubliés "
				},
				"The harvester '{harvester}' has been deleted.": {
					"$$noContext": "Le moissonneur '{harvester}' a été supprimé. "
				},
				"The harvester has been saved and started": {
					"$$noContext": "Ce moissonneur a été sauvé et démarré"
				},
				"The harvester has been started.": {
					"$$noContext": "Le moissonneur a été démarré."
				},
				"The identifier of the Data4Citizen domain you want to harvest": {
					"$$noContext": "L'identifiant du domaine Data4Citizen que vous voulez moissonner"
				},
				"The image dimensions are too large.": {
					"$$noContext": "Les dimensions de l'image sont trop grandes."
				},
				"The last publication returned": {
					"$$noContext": "La dernière publication a généré"
				},
				"The last publication returned the following errors. The values generating these errors were ignored and will appear as blank.": {
					"$$noContext": "La dernière publication a fait remonter les erreurs suivantes. Les valeurs ayant généré ces erreurs ont été ignorées, elles apparaitront vides dans le jeu de données."
				},
				"The list of entry points available for the user.": {
					"$$noContext": "La liste des points d'entrée disponibles pour l'utilisateur."
				},
				"The list of fields available for the user.": {
					"$$noContext": "La liste des champs visibles pour l'utilisateur"
				},
				"The metadata CSV column that contains resource location (a filename or an URL with the dataset resource)": {
					"$$noContext": "La colonne du fichier CSV de métadonnées contenant la localisation des ressources (un nom de fichier ou une URL de la ressource du jeux de donnée)"
				},
				"The metadata CSV column that contains the filename of the resource schema file": {
					"$$noContext": "La colonne du fichier CSV de métadonnées contenant le nom du fichier décrivant le schéma de la ressource"
				},
				"The metadata CSV filename is required": {
					"$$noContext": "Le nom du fichier de métadonnées est requis"
				},
				"The metadata CSV resource column is required": {
					"$$noContext": "La colonne des ressources est requise"
				},
				"The name displayed is the technical name of the field - not the label": {
					"$$noContext": "Le nom affiché est le nom technique du champ - pas son label"
				},
				"The name of the thesaurus used to fill the themes metadata": {
					"$$noContext": "Le nom du thésaurus utilisé pour remplir les métadonnées du thème"
				},
				"The new parameter will be available for all subdomains": {
					"$$noContext": "Les nouveaux paramètres seront accessibles pour tous les sous-domaines"
				},
				"The new password confirmation does not match the new password": {
					"$$noContext": "La confirmation du nouveau mot de passe ne correspond pas au nouveau mot de passe. "
				},
				"The new table view displays 3 times as many datasets as the old layout without any information loss.": {
					"$$noContext": "La nouvelle mise en page sous forme de tableau permet d'afficher 3 fois plus de jeux de données sur un même écran sans perdre d'information."
				},
				"The number of datasets that will be harvested": {
					"$$noContext": "Le nombre de jeux de données qui seront moissonnés"
				},
				"The number of datasets that will be harvested. If no number is specified, all datasets in the collection will be harvested. However, an Enigma API key can only be used to download 80 datasets per month.": {
					"$$noContext": "Le nombre de jeux de données à moissonner. Si non renseigné, tous les jeux de données de la collection seront moissonnées. Attention, une clé d'API Enigma ne peut télécharger que 80 jeux de données par mois."
				},
				"The number of datasets that will be harvested. If no value is set, harvest all datasets matching the query (up to 1000).": {
					"$$noContext": "Le nombre de jeux de données qui seront moissonnés. Si aucune valeur n'est définie, tous les jeux de données correspondant à la requête seront récupérés (avec un maximum de 1000)."
				},
				"The owner's email address is invalid.": {
					"$$noContext": "L'adresse email du propriétaire n'est pas valide."
				},
				"The popularity score is the result of a calculation that uses the number of downloads, reuses and API calls of a dataset. The higher the score is, the more the dataset is being used!": {
					"$$noContext": "Le score de popularité est le résultat d'un calcul prenant en compte le nombre de téléchargements, de réutilisations et d'appels API pour chaque jeu de données. Plus le score est haut, plus le jeu de données est utilisé !"
				},
				"The portal url is required": {
					"$$noContext": "L'URL du portail est requise"
				},
				"The records limit has been reached, further records have not been processed.": {
					"$$noContext": "La limite d'enregistrements a été atteinte, les enregistrements suivants n'ont pas été traités."
				},
				"The refines you want to pass to filter the query (URL encoded) e.g. refine.destination=Asia&refine.origin=France": {
					"$$noContext": "Les filtres (refines), à passer pour filtrer la requête (encodés pour l'URL) e.g. refine.destination=Asia&refine.origin=France"
				},
				"The resource cache has been cleaned.": {
					"$$noContext": "Le cache de ressource a été nettoyé."
				},
				"The reuse has been deleted from your portal. You'll now be redirected to the reuses management page.": {
					"$$noContext": "Cette réutilisation a été supprimée de votre portail. Vous allez maintenant être redirigé vers la page de gestion des réutilisations."
				},
				"The reuse has been rejected and its author notified. You'll now be redirected to the reuses management page.": {
					"$$noContext": "Cette réutilisation a été rejetée et son auteur averti. Vous allez maintenant être redirigé vers la page de gestion des réutilisations."
				},
				"The selected dataset does not exist or is not accessible anymore.": {
					"$$noContext": "Le jeu de données sélectionné n'existe pas ou n'est plus accessible."
				},
				"The separator is invalid": {
					"$$noContext": "Le séparateur est invalide"
				},
				"The site URL is required": {
					"$$noContext": "L'URL du site est requis"
				},
				"The stacking is available only when all series use the same chart type or when series breakdown is activated.": {
					"$$noContext": "L'empilement n'est disponible que lorsque toutes les séries utilisent le même type de graphe ou que la ventilation des séries est activée."
				},
				"The subdirectory on the FTP server where to find CSV files, e.g. ./subdir or mysubdirectory": {
					"$$noContext": "Le sous répertoire du serveur FTP où trouver les fichiers CSV, e.g. ./subdir or mysubdirectory"
				},
				"The subdomain administrator can later apply more specific restrictions to user and groups.": {
					"$$noContext": "L'administrateur du sous-domaine peut appliquer des restrictions plus spécifiques aux utilisateurs et aux groupes."
				},
				"The timezone used to interpret dates and times in queries and records.": {
					"$$noContext": "Le fuseau horaire utilisé pour interpréter les dates et heures dans la requête et les données de la réponse."
				},
				"The total number of records allowed on this subdomain": {
					"$$noContext": "Nombre total d'enregistrements autorisés sur ce sous-domaine"
				},
				"The user has been removed from your portal. You'll now be redirected to the users management page.": {
					"$$noContext": "Cet utilisateur a été supprimé de votre portail. Vous allez maintenant être redirigé vers la page de gestion des utilisateurs."
				},
				"The user may edit the dataset": {
					"$$noContext": "L'utilisateur peut modifier le jeu de données"
				},
				"The user may publish the dataset": {
					"$$noContext": "L'utilisateur peut publier le jeu de données"
				},
				"Theme": {
					"$$noContext": "Thème"
				},
				"Theme label": {
					"$$noContext": "Label du thème"
				},
				"Themes": {
					"$$noContext": "Thèmes"
				},
				"Themes mapping": {
					"$$noContext": "Cartographie des thèmes"
				},
				"Themes thesaurus": {
					"$$noContext": "Thésaurus de thèmes"
				},
				"There are many more filters available, choose which ones you want to display.": {
					"$$noContext": "Il y a beaucoup d'autres filtres disponibles, choisissez ceux que voulez afficher."
				},
				"There are no layers on this map": {
					"$$noContext": "Pas de calques sur cette carte"
				},
				"There are too many series to be displayed correctly, try to refine your query a bit.": {
					"$$noContext": "Il y a trop de séries retournées pour être affichées correctement, essayez de filtrer votre requête pour réduire la liste."
				},
				"There are unsaved changes, are you sure you want to leave this page?": {
					"$$noContext": "Les dernières modifications n'ont pas été sauvegardé. Êtes-vous sûr de vouloir quitter la page ?"
				},
				"There can be between 2 and 10 tiers.": {
					"$$noContext": "Il peut y avoir entre 2 et 10 étapes."
				},
				"There has been an error during your request.": {
					"$$noContext": "Une erreur est survenue pendant votre requête."
				},
				"There was too many points to display, the maximum number of points has been decreased.": {
					"$$noContext": "Trop de points à afficher, le nombre de maximum de points affichés à été réduit."
				},
				"These values will not be published on the portal, and will only be visible to users with dataset-editing permissions.": {
					"$$noContext": "Ces valeurs ne seront pas publiées sur le portail et ne seront visible que des utilisateurs ayant des droits d'édition sur un jeu de données."
				},
				"They are always visible no matter how deep you've scrolled.": {
					"$$noContext": "Ils sont visibles en permanence, quelle que soit votre position dans la page."
				},
				"They are now always visible no matter how deep you've scrolled.": {
					"$$noContext": "Ils sont maintenant visibles en permanence, quelle que soit votre position dans la page."
				},
				"Thickness": {
					"$$noContext": "Épaisseur"
				},
				"This asset type is not supported.": {
					"$$noContext": "Ce type de ressources n'est pas supporté."
				},
				"This cannot be undone. If you shared links to this chart, they will be broken.": {
					"$$noContext": "Cette action est irréversible. Les éventuels liens que vous avez partagés vers ce graphique ne seront plus accessibles."
				},
				"This cannot be undone. If you shared links to this map, they will be broken.": {
					"$$noContext": "Cette action est irréversible. Les éventuels liens que vous avez partagés vers cette carte ne seront plus accessibles"
				},
				"This dataset can be consumed via an API that allows to search and download records using various criteria exposed in the console below.": {
					"$$noContext": "Ce jeu de données peut être utilisé via une API qui autorise la recherche et le téléchargement d'enregistrements par plusieurs critères, exposés ci dessous."
				},
				"This dataset can be consumed via an API.": {
					"$$noContext": "Ce jeu de données peut être utilisé via une API."
				},
				"This dataset has been distributed by your parent domain. You cannot modify its source.": {
					"$$noContext": "Ce jeu de données a été distribué par votre domain parent. Vous ne pouvez pas modifier sa source. "
				},
				"This dataset is licensed under :": {
					"$$noContext": "Ce jeu de données est sous licence :"
				},
				"This dataset is part of a group, therefore only the group's title and description will appear in the map's visibility control.": {
					"$$noContext": "Ce jeu de données fait partie d'un groupe, par conséquence seuls le titre et la description du groupe apparaitront dans le contrôle de visibilité de la carte."
				},
				"This dataset only has metadata.": {
					"$$noContext": "Ce jeu de données contient uniquement des métadonnées."
				},
				"This dataset will be automatically republished :": {
					"$$noContext": "Ce jeu de données sera automatiquement republié :"
				},
				"This domain": {
					"$$noContext": "Ce domaine"
				},
				"This domain is currently under maintenance, and is only available for exploration at the moment. Sorry for the inconvenience.": {
					"$$noContext": "Ce domaine est actuellement en cours de maintenance, et n'est disponible qu'en exploration pour le moment. Nous nous excusons pour la gêne occasionnée."
				},
				"This domain is restricted and only accessible to authorized users.": {
					"$$noContext": "Ce domaine est restreint et uniquement accessible aux utilisateurs autorisés."
				},
				"This email address is not available.": {
					"$$noContext": "Cette adresse email n'est pas disponible."
				},
				"This embed will not be visible to everyone because the domain is not open to anonymous users on the web.": {
					"$$noContext": "Cette visualisation embarquée ne sera pas visible par tous car le domaine n'est pas ouvert aux utilisateurs anonymes."
				},
				"This entry point is not enabled.": {
					"$$noContext": "Ce point d'entrée n'est pas actif."
				},
				"This export format is limited to {{ recordsLimit|number }} records. You can download a smaller part of the dataset by filtering it.": {
					"$$noContext": "Ce format d'export est limité à {{ recordsLimit|number }} enregistrements. Vous pouvez ajouter des filtres à votre requête pour rentrer dans les limites de taille."
				},
				"This harvester can't be aborted while aborting or deleting": {
					"$$noContext": "Ce moissonneur ne peut pas être interrompu pendant qu'il est en cours d'interruption ou de suppression"
				},
				"This harvester has a critical error": {
					"$$noContext": "Ce moissonneur présente une erreur critique"
				},
				"This harvester has been started.": {
					"$$noContext": "Ce moissonneur a été démarré."
				},
				"This harvester has ended with errors is idle": {
					"$$noContext": "Ce moissonneur s'est terminé avec des erreurs et est inactif"
				},
				"This harvester has ended with warnings and is idle": {
					"$$noContext": "Ce moissonneur s'est terminé avec des avertissements et est inactif"
				},
				"This harvester has successfully ended and is idle": {
					"$$noContext": "Ce moissonneur s'est terminé avec succès et est inactif"
				},
				"This harvester has {{ $count }} warning": {
					"$$noContext": ["Ce moissonneur a {{ $count }} erreur", "Ce moissonneur a {{ $count }} erreurs"]
				},
				"This harvester is aborting": {
					"$$noContext": "Ce moissonneur est en cours d'interruption"
				},
				"This harvester is deleting": {
					"$$noContext": "Ce moissonneur est en cours de suppression"
				},
				"This harvester is idle": {
					"$$noContext": "Ce moissonneur est inactif"
				},
				"This harvester is queued and will start soon": {
					"$$noContext": "Ce moissonneur est en file d'attente et va démarrer prochainement"
				},
				"This harvester is running": {
					"$$noContext": "Ce moissonneur est en cours de moissonnage"
				},
				"This harvester is {{ harvester_statuses[harvester.status] }}": {
					"$$noContext": "Ce moissonneur est {{ harvester_statuses[harvester.status] }}"
				},
				"This harvester needs to be configured": {
					"$$noContext": "Ce moissonneur a besoin d'être configuré"
				},
				"This image does not have the correct dimensions.": {
					"$$noContext": "Cette image n'a pas les bonnes dimensions."
				},
				"This is a feature we introduced recently, if you have any feedback we'd be happy to read it!": {
					"$$noContext": "Cette fonctionnalité a été introduite récemment, n'hésitez pas à nous faire part de vos commentaires."
				},
				"This is an example of the resulting URL from the form fields you filled.": {
					"$$noContext": "Ceci est un exemple de l'URL qui va être utilisée, à partir des champs que vous avez remplis."
				},
				"This is neither a valid email nor a known username": {
					"$$noContext": "Ceci ne correspond pas à un email valide ou à un identifiant existant"
				},
				"This is not a valid image.": {
					"$$noContext": "Ce n'est pas une image valide."
				},
				"This is not a valid svg file.": {
					"$$noContext": "Ce fichier svg n'est pas valide."
				},
				"This is one of the most important screens of the backoffice.": {
					"$$noContext": "C'est un des écrans les plus important du backoffice."
				},
				"This is the identifier that will be used to generate the default url for this subdomain.": {
					"$$noContext": "Ceci est l'identifiant qui sera utilisé pour généré l'URL par défaut pour ce sous-domaine. "
				},
				"This is the name that will be displayed in the interfaces.": {
					"$$noContext": "Ce nom sera affiché dans les interfaces."
				},
				"This is the name that will be used for site branding, mainly in the header.": {
					"$$noContext": "C'est le nom qui sera utilisé en tant que marque du portail, notamment dans l'en-tête."
				},
				"This is where it begins": {
					"$$noContext": "Tout commence ici"
				},
				"This layer contains an unknown dataset.": {
					"$$noContext": "Cette couche contient un jeu de données introuvable."
				},
				"This layer has been imported from an older version of Mapbuilder, and its display mode isn't supported anymore in Mapbuilder's edition mode. You can delete this layer if you want to migrate it to another display mode.": {
					"$$noContext": "Cette couche a été importée depuis une version antérieure de l'éditeur de carte, et son mode d'affichage n'est plus supporté en édition. Vous pouvez effacer cette couche si vous souhaitez afficher ces données avec un des nouveaux modes d'affichage."
				},
				"This mode is limited to only display {{ 1000|number }} records at once, but the layer contains {{ $count|number }} record; the data may not be entirely displayed on the map at all time.": {
					"$$noContext": ["Ce mode est limité à un affichage de {{ 1000|number }} enregistrements à la fois, mais cette couche contient {{ $count|number }} enregistrement; les données peuvent ne pas être toutes affichées simultanément.", "Ce mode est limité à un affichage de {{ 1000|number }} enregistrements à la fois, mais cette couche contient {{ $count|number }} enregistrements; les données peuvent ne pas être toutes affichées simultanément."]
				},
				"This page has been pushed by another domain. You can only edit its properties. To edit the content, create a copy.": {
					"$$noContext": "Cette page a été distribuée d'un autre domaine. Vous pouvez seulement modifier ses propriétés. Pour modifier son contenu, créer une copie. "
				},
				"This page is private": {
					"$$noContext": "Cette page est privée"
				},
				"This page is public": {
					"$$noContext": "Cette page est publique"
				},
				"This page needs to be saved before it can be shared.": {
					"$$noContext": "Cette page doit être sauvegardée avant de pouvoir être partagée."
				},
				"This parameter name format is invalid": {
					"$$noContext": "Le nom de ce paramètre est invalide"
				},
				"This processor must be the first date processor on a field": {
					"$$noContext": "Ce processeur doit être le premier processeur de date sur un champ"
				},
				"This scheduling frequency is currently unavailable, please contact our support team.": {
					"$$noContext": "Cette fréquence de programmation n'est pas disponible, veuillez contacter l'équipe de support."
				},
				"This section defines the usage limits for the subdomain.": {
					"$$noContext": "Cette section définit les limites d'usage pour le sous-domaine."
				},
				"This tab won't be shown": {
					"$$noContext": "Cet onglet ne sera pas affiché"
				},
				"This table does not only lists your harvesters, it also gives you their current state and controls to relaunch a harvest and re-publish their attached datasets.": {
					"$$noContext": "Cette table liste vos moissonneurs et vous donne leur statut actuel. Elle permet de relancer un moissonnage et de republier les jeux de données attachés. "
				},
				"This table not only lists your harvesters, it also gives you their current state and controls to relaunch a harvest and re-publish their attached datasets.": {
					"$$noContext": "Cette table liste vos moissonneurs et vous donne leur status actuel. Elle permet de relancer un moissonnage et de republier les jeux de données attachés. "
				},
				"This user is a member of the Data4Citizen staff.": {
					"$$noContext": "Cet utilisateur est membre de l'équipe Data4Citizen."
				},
				"This user is a member of the Data4Citizen team": {
					"$$noContext": "Cet utilisateur est un membre de l'équipe Data4Citizen"
				},
				"This user will be invited to the new subdomain and will be granted all administration rights.": {
					"$$noContext": "Cet utilisateur sera invité sur le sous-domaine et obtiendra tous les droits d'administration. "
				},
				"This value is invalid, please check if your last bound is correct.": {
					"$$noContext": "La valeur est incorrecte, veuillez vérifier que la borne précédente est correcte."
				},
				"This will reset the selected asset to the default one.": {
					"$$noContext": "La ressource sélectionnée va revenir à ca valeur par défaut."
				},
				"Thu": {
					"$$noContext": "jeu"
				},
				"Thumbnail": {
					"$$noContext": "Vignette"
				},
				"Thursday": {
					"$$noContext": "jeudi"
				},
				"Tick boxes, distribute and voila!": {
					"$$noContext": "Cochez les cases, distribuez et voilà ! "
				},
				"Tiers": {
					"$$noContext": "Étapes"
				},
				"Tiles URL (required)": {
					"$$noContext": "URL des tuiles (requis)"
				},
				"Tiles images format": {
					"$$noContext": "Format des images des tuiles"
				},
				"Time": {
					"$$noContext": "Heure"
				},
				"Timeout": {
					"$$noContext": "Temporisation"
				},
				"Timezone": {
					"$$noContext": "Fuseau horaire"
				},
				"Title": {
					"$$noContext": "Titre"
				},
				"To create a harvester, just select the type of service it should connect to (CKAN, ArcGIS OpenData, FTP...), give it a name and you're good to go!": {
					"$$noContext": "Pour créer un moissonneur, sélectionnez le type de service auquel vous voulez le connecter (CKAN, ArcGIS OpenData, FTP...), ajoutez un nom et vous êtes paré ! "
				},
				"To edit the domain distribution parameters name, you can <a href=\"/backoffice/subdomains/settings\">go to the subdomains settings page</a>.": {
					"$$noContext": "Pour éditer les noms des paramètres de distribution, vous pouvez <a href=\"/backoffice/subdomains/settings\">aller sur la page de configuration des sous-domaines</a>."
				},
				"To share this map, you need to activate your account first.": {
					"$$noContext": "Avant de partager cette carte, vous devez d'abord activer votre compte."
				},
				"To share this map, you need to give it a name and save it first.": {
					"$$noContext": "Pour partager cette carte, vous devez d'abord lui donner un nom et la sauvegarder."
				},
				"To these groups": {
					"$$noContext": "À ces groupes"
				},
				"To these users": {
					"$$noContext": "À ces utilisateurs"
				},
				"Toe": {
					"$$noContext": "tep"
				},
				"Toggle": {
					"$$noContext": "Basculer"
				},
				"Toggle fullscreen": {
					"$$noContext": "Passer en plein écran"
				},
				"Toggle processor": {
					"$$noContext": "Activer/désactiver le processeur"
				},
				"Toggle tooltip": {
					"$$noContext": "Voir le panneau d'information"
				},
				"Tonne": {
					"$$noContext": "Tonne"
				},
				"Tonne of oil equivalent": {
					"$$noContext": "Tonne équivalent pétrole"
				},
				"Too long": {
					"$$noContext": "Trop long"
				},
				"Too many requests": {
					"$$noContext": "Trop de requêtes"
				},
				"Too many requests on the domain. Please contact the domain administrator.": {
					"API error message": "Il y a eu trop de requêtes sur le portail. Merci de contacter l'administrateur du domaine."
				},
				"Too short": {
					"$$noContext": "Trop court"
				},
				"Tooltip customization": {
					"$$noContext": "Personnalisation de l'infobulle"
				},
				"Tooltip preview": {
					"$$noContext": "Aperçu de l'infobulle"
				},
				"Top 5 datasets in this domain with the most API calls": {
					"$$noContext": "Top 5 des jeux de données ayant le plus d'appel d'API"
				},
				"Top 5 datasets in this domain with the most reuses": {
					"$$noContext": "Top 5 des jeux de données avec le plus de réutilisations"
				},
				"Top 5 most downloaded datasets in this domain": {
					"$$noContext": "Top 5 des jeux de données ayant le plus de téléchargement"
				},
				"Topological consistency": {
					"$$noContext": "Consistance topologique"
				},
				"Total number of records": {
					"$$noContext": "Nombre total d'enregistrements"
				},
				"Transport networks": {
					"inspire metadata template": "Réseaux de transport"
				},
				"Treemap": {
					"$$noContext": "Treemap"
				},
				"Tue": {
					"$$noContext": "mar"
				},
				"Tuesday": {
					"$$noContext": "mardi"
				},
				"Two records with the same Unique ID fields are considered redundant and only the last one is kept.": {
					"$$noContext": "Deux enregistrements avec les mêmes champs \"ID unique\" sont considérés comme des doublons et seul le dernier est conservé."
				},
				"Type": {
					"$$noContext": "Type"
				},
				"Type emails...": {
					"$$noContext": "Email..."
				},
				"Type your map name here": {
					"$$noContext": "Tapez le nom de la carte"
				},
				"Type:": {
					"$$noContext": "Type : "
				},
				"URL": {
					"$$noContext": "URL"
				},
				"URL is required": {
					"$$noContext": "L'URL est requise"
				},
				"URL of the source of the data": {
					"$$noContext": "URL de la source des données"
				},
				"URL to an image": {
					"$$noContext": "URL d'une image"
				},
				"Unable to download the image.": {
					"$$noContext": "Impossible de télécharger l'image."
				},
				"Unable to save your changes.": {
					"$$noContext": "Impossible de sauvegarder vos changements."
				},
				"Unable to select this dataset as a source: it is the same dataset.": {
					"$$noContext": "Impossible de sélectionner ce jeu de données comme source: il s'agit du même jeu de données."
				},
				"Undefined values": {
					"$$noContext": "Valeurs indéfinies"
				},
				"Undefined {{ selectedLayer.properties.legendLabel }}": {
					"$$noContext": "{{ selectedLayer.properties.legendLabel }} indéfinis"
				},
				"Undo": {
					"$$noContext": "Annuler"
				},
				"Unfortunately, you have exceeded a security quota limit. Please retry later, or contact domain administrator.": {
					"$$noContext": "Malheureusement vous avez atteint une limite de sécurité concernant le nombre de requêtes de recherche. Veuillez réessayer plus tard, ou contacter l'administrateur du domaine."
				},
				"Unique ID": {
					"$$noContext": "ID unique"
				},
				"Unit": {
					"$$noContext": "Unité"
				},
				"Unknown encoding": {
					"$$noContext": "Encodage inconnu"
				},
				"Unpublish": {
					"$$noContext": "Dépublier"
				},
				"Unpublishing": {
					"$$noContext": "Dépublication"
				},
				"Unsubscribe": {
					"$$noContext": "Résilier l'abonnement"
				},
				"Unsubscribing": {
					"$$noContext": "Désabonnement"
				},
				"Untitled dataset": {
					"$$noContext": "Jeu de données sans titre"
				},
				"Untitled map": {
					"$$noContext": "Carte sans titre"
				},
				"Update automatically when data has changed": {
					"$$noContext": "Mettre à jour la date après un traitement des données"
				},
				"Update automatically when metadata has changed": {
					"$$noContext": "Mettre à jour la date lors d'un changement dans les métadonnées"
				},
				"Update my filters list": {
					"$$noContext": "Mettre à jour ma liste de filtres"
				},
				"Upload a file": {
					"$$noContext": "Ajouter un fichier"
				},
				"Upload an image": {
					"$$noContext": "Ajouter une image"
				},
				"Uploaded file is too large ({current_size} bytes, maximum is {max_allowed_size} bytes)": {
					"API error message": "Le fichier envoyé est trop grand ({current_size} octets, le maximum est {max_allowed_size} octets)"
				},
				"Upper boundary:": {
					"$$noContext": "Borne haute :"
				},
				"Upper quartile:": {
					"$$noContext": "Quartile supérieur :"
				},
				"Url": {
					"$$noContext": "URL"
				},
				"Usage limits": {
					"$$noContext": "Limites d'usage"
				},
				"Use a logarithmic scale": {
					"$$noContext": "Utiliser une échelle logarithmique"
				},
				"Use a template": {
					"$$noContext": "Utiliser un modèle"
				},
				"Use arrow keys to select a color in the wheel": {
					"$$noContext": "Utiliser les flèches de votre clavier pour sélectionner une couleur sur la roue"
				},
				"Use commas to separate values.": {
					"$$noContext": "Utilisez des virgules pour séparer les valeurs."
				},
				"Use for ordering": {
					"$$noContext": "Utilisé pour le tri"
				},
				"Use left and right arrow to navigate the images, up and down arrows to open close the image inspector": {
					"$$noContext": "Utilisez les flèches gauche et droite pour naviguer dans les images et les flèches haut et bas pour ouvrir et fermer l'inspecteur d'image"
				},
				"Use links to pages hosted on a different website": {
					"$$noContext": "Utiliser des liens vers des pages d'un autre site"
				},
				"Use map as widget": {
					"$$noContext": "Utiliser la carte comme widget"
				},
				"Use the checkboxes to select one or several subdomains and bulk distribute content or simply go to the subdomain page to distribute content one subdomain at a time": {
					"$$noContext": "Utilisez les cases à cocher pour sélectionner un ou plusieurs sous-domaines et distribuer du contenu en masse ou rendez vous simplement sur la page du sous-domaine pour distribuer du contenu un sous-domaine à la fois. "
				},
				"Use the form below to add style (in pure CSS) to your portal.": {
					"$$noContext": "L'éditeur de code ci dessous vous permet d'ajouter des règles de style (en CSS) à votre portail."
				},
				"Use the form below to set up the portal's catalog cards, that is the dataset summary used in the catalog page.": {
					"$$noContext": "Ecrivez le code HTML de vos cartes de catalogue (les cartes de résumé des jeux de données utilisées dans le catalogue) dans l'éditeur de code ci dessous."
				},
				"Use the form below to set up the portal's footer.": {
					"$$noContext": "Ecrivez le code HTML de votre pied de page dans l'éditeur de code ci dessous."
				},
				"Use the form below to set up the portal's header.": {
					"$$noContext": "Le formulaire ci dessous vous permet de configurer l'en-tête de votre portail."
				},
				"Use the same links for all languages": {
					"$$noContext": "Utiliser les mêmes liens pour toutes les langues"
				},
				"Use the same texts for all languages": {
					"$$noContext": "Utiliser les mêmes textes pour toutes les langues"
				},
				"Use these terms and conditions": {
					"$$noContext": "Utiliser ces conditions d'utilisation"
				},
				"Use this URL to share your map or post it on social networks.": {
					"$$noContext": "Utilisez cette URL pour partager votre carte ou la diffuser sur les réseaux sociaux."
				},
				"Use this privacy policy": {
					"$$noContext": "Utiliser cette politique de confidentialité"
				},
				"Use this value as callback url in your remote oauth2 application before setting the parameters here.": {
					"$$noContext": "Utiliser cette valeur dans le formulaire de création de votre application distante."
				},
				"Used by {{$count}} dataset": {
					"$$noContext": ["Utilisé par {{$count}} jeu de données", "Utilisé par {{$count}} jeux de données"]
				},
				"User": {
					"$$noContext": "Utilisateur"
				},
				"User '{username}' has been removed from the group.": {
					"$$noContext": "L'utilisateur '{username}' a été supprimé du groupe."
				},
				"User count": {
					"$$noContext": "Nombre d'utilisateurs"
				},
				"User deleted": {
					"$$noContext": "Utilisateur supprimé"
				},
				"User is already a member of the portal": {
					"$$noContext": "L'utilisateur est déjà un membre du portail"
				},
				"User permissions": {
					"$$noContext": "Permissions utilisateur"
				},
				"User removed from group!": {
					"$$noContext": "Utilisateur supprimé du groupe ! "
				},
				"Username": {
					"$$noContext": "Identifiant"
				},
				"Users": {
					"$$noContext": "Utilisateurs"
				},
				"Users with a SAML identity": {
					"$$noContext": "Utilisateurs ayant une identité SAML"
				},
				"Using permissions from:": {
					"$$noContext": "Utilisant les permissions"
				},
				"Utility and governmental services": {
					"inspire metadata template": "Services d’utilité publique et services publics"
				},
				"Value": {
					"$$noContext": "Valeur"
				},
				"Value (ascending)": {
					"$$noContext": "Valeur croissante"
				},
				"Value (descending)": {
					"$$noContext": "Valeur décroissante"
				},
				"Value already in list": {
					"$$noContext": "La valeur est déjà dans la liste"
				},
				"Value multiplier": {
					"$$noContext": "Multiplicateur de valeur"
				},
				"Value of a field": {
					"$$noContext": "Valeur d'un champ"
				},
				"Value of parameter '{parameter_name}' is not a valid value of type {parameter_type}": {
					"API error message": "La valeur du paramètre '{parameter_name}' n'est pas une valeur de type {parameter_type} valide"
				},
				"Value of parameter '{parameter_name}' is not an accepted value ({accepted_values})": {
					"API error message": "La valeur du paramètre '{parameter_name}' ne fait pas partie de la liste des valeurs acceptées ({accepted_values})"
				},
				"Value of parameter '{parameter_name}' is not valid JSON": {
					"API error message": "La valeur du paramètre '{parameter_name}' n'est pas du JSON valide"
				},
				"Value of the filter parameter name": {
					"$$noContext": "Valeur du paramètre de filtre"
				},
				"Value step": {
					"$$noContext": "Valeur du pas"
				},
				"Values range": {
					"$$noContext": "Gamme de valeurs"
				},
				"Values sort": {
					"$$noContext": "Tri par valeur"
				},
				"View": {
					"$$noContext": "Vue"
				},
				"View Fullscreen": {
					"$$noContext": "Mode plein écran"
				},
				"View next image": {
					"$$noContext": "Voir l'image suivante"
				},
				"View previous image": {
					"$$noContext": "Voir l'image précédente"
				},
				"Visibility": {
					"$$noContext": "Visibilité"
				},
				"Visible filters": {
					"$$noContext": "Filtres visibles"
				},
				"Visible only to allowed users and groups": {
					"$$noContext": "Accessible uniquement aux utilisateurs et groupes autorisés"
				},
				"Visible spectrum": {
					"$$noContext": "Spectre visible"
				},
				"Visible to anyone having access to the domain": {
					"$$noContext": "Accessible à toute personne ayant accès au domaine"
				},
				"Visualization": {
					"$$noContext": "Visualisation"
				},
				"Visualizations": {
					"$$noContext": "Visualisations"
				},
				"Volt": {
					"$$noContext": "Volt"
				},
				"Volume": {
					"$$noContext": "Volume"
				},
				"Volumetric flow rate": {
					"$$noContext": "Débit"
				},
				"WFS URL is required": {
					"$$noContext": "L'URL WFS est requise"
				},
				"WMS URL (required)": {
					"$$noContext": "URL WMS (requis)"
				},
				"Watt": {
					"$$noContext": "Watt"
				},
				"Watt hour": {
					"$$noContext": "Watt-heure"
				},
				"We added hints here and there to explain all the features. Don't forget to visit the settings page!": {
					"$$noContext": "Nous avons ajouté des indices ici et là pour expliquer toutes les fonctionnalités. N'oubliez pas de visiter la page des paramètres"
				},
				"We just sent you an email containing a link to activate your account and log in.": {
					"$$noContext": "Nous venons de vous envoyer un email contenant le lien d'activation de votre compte."
				},
				"We selected some data that you might find interesting.": {
					"$$noContext": "Nous avons sélectionné quelques données qui pourraient vous intéresser."
				},
				"We sent you an email with a link to activate your account and log in. <br> <em> We work hard to avoid the spam filters, but if you didn't receive an email, check your spam folder. </em>": {
					"$$noContext": "Nous venons de vous envoyer un email contenant un lien permettant d'activer votre compte et vous identifier.<br> <em>Nous nous efforçons d'éviter les filtres à spam, mais si vous ne recevez pas d'email jetez un oeil à votre répertoire spam.</em>"
				},
				"We won't sell your information to anyone and we don't spam.": {
					"$$noContext": "Nous ne vendrons vos informations à personne et nous ne vous enverrons pas de spam."
				},
				"We work hard to avoid the spam filters, but if you didn't receive an email, check your spam folder.": {
					"$$noContext": "Nous nous efforçons d'éviter les filtres à spam, mais si vous ne recevez pas d'email jetez un oeil à votre répertoire spam."
				},
				"We'll get back to you very soon.": {
					"$$noContext": "Nous reviendrons vers vous très rapidement."
				},
				"We're loading two awesome datasets about {{ theme }} on your portal and a content page that will showcase the data... Almost there!": {
					"$$noContext": "Nous sommes en train de charger deux fantastiques jeux de données à propos de {{ theme }} sur votre domaine ainsi qu'une page de contenu qui présente ces données... C'est presque fini !"
				},
				"We've left tips here and there to explain its main features.": {
					"$$noContext": "Nous vous avons laissé des indices ici et là pour expliquer ses fonctionnalités principales."
				},
				"We've left tips here and there to explain the new features.": {
					"$$noContext": "Nous vous avons laissé des indices ici et là pour expliquer les nouvelles fonctionnalités."
				},
				"Wed": {
					"$$noContext": "mer"
				},
				"Wednesday": {
					"$$noContext": "mercredi"
				},
				"Week": {
					"$$noContext": "Semaine"
				},
				"Weekday": {
					"$$noContext": "Jour de la semaine"
				},
				"Weight": {
					"$$noContext": "Poids"
				},
				"Welcome to the datasets index!": {
					"$$noContext": "Bienvenue sur l'inventaire des jeux de données !"
				},
				"Welcome to the harvesters' index!": {
					"$$noContext": "Bienvenue dans l'index des moissonneurs ! "
				},
				"Welcome to the new subdomain creation page!": {
					"$$noContext": "Bienvenue sur la page de création d'un sous-domaine ! "
				},
				"Welcome to the subdomains index!": {
					"$$noContext": "Bienvenue sur l'inventaire des sous-domaines !"
				},
				"Welcome to your new Data4Citizen domain!": {
					"$$noContext": "Bienvenue sur votre nouveau domaine Data4Citizen !"
				},
				"Westbound longitude": {
					"$$noContext": "Longitude Ouest"
				},
				"What happened? What were you expecting?": {
					"$$noContext": "Que s'est-il passé ? Qu'est ce que vous attendiez ?"
				},
				"What would you like to do ?": {
					"$$noContext": "Que souhaitez vous faire ?"
				},
				"What's a subdomain?": {
					"$$noContext": "Qu'est ce qu'un sous-domaine ? "
				},
				"When deleting a harvester, you will be prompted to delete the harvested datasets": {
					"$$noContext": "Lors de la suppression d'un moissonneur, il vous sera demandé si vous souhaitez supprimer les jeux de données associés."
				},
				"When should this dataset be automatically republished ?": {
					"$$noContext": "Quand faut il republier automatiquement ce jeu de données ?"
				},
				"When specified, forces the use of this timezone for displaying dates and times": {
					"$$noContext": "Si spécifié, force l'utilisation de ce fuseau horaire pour l'affichage des dates et heures"
				},
				"When using a day of month greater than the 28th, the recurring runs may not work all year long.": {
					"$$noContext": "Si vous indiquez un jour du mois supérieur à 28, la planification ne s'exécutera pas tous les mois de l'année."
				},
				"When your harvesting is complete, you have two ways to publish your datasets:": {
					"$$noContext": "Quand votre moissonnage est terminé, vous avez deux moyens de publier vos jeux de données : "
				},
				"While {successes} users were successfully added to the group, {errors} others couldn't. Try adding them again. If the problem persists, contact the support.": {
					"$$noContext": "{successes} utilisateurs ont été ajouté au groupe mais {errors} ne l'ont pas été. Essayez de les ajouter de nouveau. Si le problème persiste, contactez le support."
				},
				"White": {
					"$$noContext": "Blanc"
				},
				"Whole dataset": {
					"$$noContext": "Jeu de données entier"
				},
				"Widget": {
					"$$noContext": "Widget"
				},
				"Widget code": {
					"$$noContext": "Code du widget"
				},
				"Width": {
					"$$noContext": "Largeur"
				},
				"Width and height must be at least 100px.": {
					"$$noContext": "La largeur et la hauteur doivent faire au moins 100px."
				},
				"Width is required.": {
					"$$noContext": "La largeur est requise."
				},
				"Width must be at least 100px.": {
					"$$noContext": "La largeur doit faire au moins 100px."
				},
				"Will be passed as the categories parameter to the request (see Junar documentation)": {
					"$$noContext": "Sera passé comme paramètre de catégories à la requête (référez vous à la documentation Junar)"
				},
				"Will be passed as the query parameter to the request (see Junar documentation)": {
					"$$noContext": "Sera passé comme paramètre de requête (référez vous à la documentation Junar)"
				},
				"Will your subdomains be able to communicate between each other? That's here.": {
					"$$noContext": "Vos sous-domaines seront-ils capables de communiquer entre eux ? C'est ici. "
				},
				"Word Cloud": {
					"$$noContext": "Nuage de mots-clés"
				},
				"World view": {
					"$$noContext": "Vue du globe"
				},
				"Wrap lines": {
					"$$noContext": "Retour à la ligne automatique"
				},
				"Write your comments here": {
					"$$noContext": "Écrivez vos commentaires ici"
				},
				"X Axis": {
					"$$noContext": "Axe X"
				},
				"X axis": {
					"$$noContext": "Axe X"
				},
				"Y Axis": {
					"$$noContext": "Axe Y"
				},
				"Y axis": {
					"$$noContext": "Axe Y"
				},
				"Year": {
					"$$noContext": "Année"
				},
				"Years": {
					"$$noContext": "Années"
				},
				"Yes": {
					"$$noContext": "Oui"
				},
				"Yes, delete chart!": {
					"$$noContext": "Oui, supprimez le graphique"
				},
				"Yes, delete map!": {
					"$$noContext": "Oui, supprimez la carte"
				},
				"Yes, remove custom asset": {
					"$$noContext": "Oui, supprimez la ressource"
				},
				"Yes, remove user": {
					"$$noContext": "Oui, supprimez l'utilisateur"
				},
				"Yes, remove user from group": {
					"$$noContext": "Oui, enlevez l'utilisateur du groupe"
				},
				"Yes, switch to expert mode": {
					"$$noContext": "Oui, passer en mode expert"
				},
				"You are about to add <span class=\"d4c-group__selected-users-count\" ng-bind=\"(selectedUsers|keys).length\"></span> users to your group.": {
					"$$noContext": "Vous allez ajouter <span class=\"d4c-group__selected-users-count\" ng-bind=\"(selectedUsers|keys).length\"></span> utilisateurs à votre groupe."
				},
				"You are about to publish": {
					"$$noContext": "Vous êtes sur le point de publier"
				},
				"You are about to send <span>{{ $count }}</span> invitation by email.": {
					"$$noContext": ["Vous êtes sur le point d'envoyer <span>{{ $count }}</span> invitation par email.", "Vous êtes sur le point d'envoyer <span>{{ $count }}</span> invitations par email."]
				},
				"You are about to unpublish": {
					"$$noContext": "Vous êtes sur le point de dépublier"
				},
				"You are not allowed to get or set an API Key for this user": {
					"API error message": "Vous n'êtes pas autorisé à utiliser cette clé d'API"
				},
				"You are subscribed": {
					"$$noContext": "Vous êtes abonné"
				},
				"You are within {distance} {unit} from this point": {
					"$$noContext": "Vous êtes à une distance de {distance} {unit} de ce point"
				},
				"You can also <a class=\"d4c-accept-cookies-message__accept\" ng-click=\"acceptTrackingCookies()\">accept the cookies.</a>": {
					"$$noContext": "Vous pouvez également <a ng-click=\"acceptTrackingCookies()\">accepter les cookies.</a>"
				},
				"You can also configure the behavior during the harvest process and decide if you want to override harvested metadata before publication.": {
					"$$noContext": "Vous pouvez aussi configurer le comportement pendant le moissonnage et décider si vous voulez surcharger les métadonnées moissonnées avant la publication. "
				},
				"You can customize the appearance of the tooltips displayed in the calendar tab.": {
					"$$noContext": "Vous pouvez personnaliser l'apparence des infobulles affichées dans l'onglet calendrier."
				},
				"You can customize the appearance of the tooltips displayed in the map tab.": {
					"$$noContext": "Vous pouvez personnaliser l'apparence des infobulles affichées dans l'onglet carte."
				},
				"You can customize the displayed fields in the table tab, without altering your dataset.": {
					"$$noContext": "Vous pouvez personnaliser les champs affichés dans l'onglet tableau, sans modifier votre jeu de données."
				},
				"You can customize the informations panel of the selected image in the images tab.": {
					"$$noContext": "Vous pouvez personnaliser la fenêtre d'information de l'image sélectionnée dans l'onglet images."
				},
				"You can customize the list of available views (day, week, month) and the default view.": {
					"$$noContext": "Vous pouvez personnalier la liste des vues de calendrier disponibles (jour, semaine ou mois) et la vue par défaut."
				},
				"You can describe your dataset using the available metadata.": {
					"$$noContext": "Vous pouvez décrire votre jeu de données par les métadonnées disponibles."
				},
				"You can distribute datasets to the subdomain directly or by using the distribution parameters.<br> If you use distribution parameters, you will need to match a dataset field with a distribution parameter.": {
					"$$noContext": "Vous pouvez distribuer des jeux de donnés au sous-domaine directement ou en filtrant via des paramètres de distribution.<br> Si vous utilisez des filtres, vous devrez faire correspondre les valeurs d'un champ du jeu de données et d'un paramètre de distribution."
				},
				"You can distribute pages to the subdomains": {
					"$$noContext": "Vous pouvez distribuer des pages aux sous-domaines"
				},
				"You can download a previous version of the dataset in the CSV format.": {
					"$$noContext": "Vous pouvez télécharger une version précédente du jeu de données au format CSV."
				},
				"You can edit the generated privacy policy afterwards.": {
					"$$noContext": "Vous pourrez modifier la politique de confidentialité générée par la suite."
				},
				"You can edit the generated terms and conditions afterwards.": {
					"$$noContext": "Vous pourrez modifier les conditions d'utilisation générées par la suite."
				},
				"You can find your API key on <a href=\"https://manage.thunderforest.com/dashboard\" target=\"_blank\">your Thunderforest console page</a>.": {
					"$$noContext": "Vous trouverez votre clé d'API dans<a href=\"https://manage.thunderforest.com/dashboard\" target=\"_blank\">votre console Thunderforest</a>."
				},
				"You can generate API keys to allow third-party applications to access data on your behalf. API keys can be revoked at any time.": {
					"$$noContext": "Vous pouvez générer des clés d'API pour permettre à des applications tierces d'accéder aux données en votre nom. Les clés d'API peuvent être révoquées à tout moment. "
				},
				"You can only rename datasets that are not published.": {
					"$$noContext": "Vous pouvez seulement renommer les jeux de données qui ne sont pas publiés."
				},
				"You can revert this dataset to a former configuration": {
					"$$noContext": "Vous pouvez revenir à une configuration précédente"
				},
				"You can safely switch between actions, it won't discard your unsaved modifications.": {
					"$$noContext": "Vous pouvez passer d'une action à l'autre sans crainte de perdre vos modifications non sauvegardées."
				},
				"You can suggest a new record by sending feedback to the publisher; you can also directly submit values for this new record.": {
					"$$noContext": "Vous pouvez suggérer un nouvel enregistrement en envoyant un commentaire au producteur; vous pouvez également suggérer des valeurs pour ce nouvel enregistrement."
				},
				"You can suggest changes to the record you selected by sending feedback to the publisher; you can also submit new values for each field.": {
					"$$noContext": "Vous pouvez contribuer à l'enregistrement que vous avez sélectionné en envoyant vos commentaires au producteur; vous pouvez également suggérer de nouvelles valeurs pour chaque champ."
				},
				"You can't add a dataset as a federation source for itself.": {
					"$$noContext": "Vous ne pouvez pas ajouter de jeu de données comme source de fédération pour lui même."
				},
				"You can't generate more than {{ maxKeys }} API Keys": {
					"$$noContext": "Vous ne pouvez générer plus de {{ maxKeys }} clés d'API"
				},
				"You cannot add multiple series on treemap.": {
					"$$noContext": "Vous ne pouvez pas ajouter plusieurs sur les treemaps."
				},
				"You cannot edit a dataset identifier when it is currently published": {
					"$$noContext": "Vous ne pouvez pas changer l'identifiant d'un jeu de données actuellement publié."
				},
				"You cannot join the current dataself with itself": {
					"$$noContext": "Impossible de joindre le jeu de données avec lui-même"
				},
				"You don't have the permission to delete a dataset that is currently published.": {
					"$$noContext": "Vous n'avez pas la permission de supprimer un jeu de données qui est actuellement publié. "
				},
				"You entered a wrong captcha.": {
					"$$noContext": "Vous avez saisi un Captcha erroné."
				},
				"You have authorized the following applications to access the platform on your behalf, using your account. You can revoke this access at any time.": {
					"$$noContext": "Vous avez autorisé les applications suivantes à accéder à la plateforme avec vos privilèges, via votre compte utilisateur. Vous pouvez révoquer cet accès à n'importe quel moment."
				},
				"You have been subscribed": {
					"$$noContext": "Vous êtes abonné"
				},
				"You have been unsubscribed": {
					"$$noContext": "Vous êtes désabonné"
				},
				"You have exceeded the requests limit for anonymous users.": {
					"API error message": "Vous avez dépassé le nombre d'appels d'API autorisés pour les utilisateurs anonymes."
				},
				"You have exceeded your quota of {call_limit} api calls per {limit_time_unit} on this dataset.": {
					"API error message": "Vous avez atteint votre limite de {call_limit} appels d'API par {limit_time_unit} pour ce jeu de données."
				},
				"You have exceeded your quota of {call_limit} api calls per {limit_time_unit}.": {
					"API error message": "Vous avez dépassé votre quota de {call_limit} appels d'API par {limit_time_unit}."
				},
				"You have exceeded your subscribed quota of {call_limit} api calls per {limit_time_unit} on this dataset.": {
					"API error message": "Vous avez dépassé le quota de votre abonnement ({call_limit} appels d'api par {limit_time_unit}) sur ce jeu de données."
				},
				"You have no API keys.": {
					"$$noContext": "Vous n'avez aucune clé d'API. "
				},
				"You have no authorized applications.": {
					"$$noContext": "Vous n'avez aucune application autorisée."
				},
				"You have no visualizations.": {
					"$$noContext": "Vous n'avez aucune visualization."
				},
				"You have successfully been subscribed to daily reports.": {
					"$$noContext": "Vous êtes abonné aux rapports quotidiens."
				},
				"You have successfully been subscribed to processing alerts.": {
					"$$noContext": "Vous êtes abonné aux alertes de traitement."
				},
				"You have successfully been subscribed to quota alerting.": {
					"$$noContext": "Vous êtes abonné aux alertes de quotas."
				},
				"You have successfully been subscribed to the Data Ecosystem News.": {
					"$$noContext": "Vous avez été abonné à la lettre d'information Actualités de l'Ecosystème Data."
				},
				"You have successfully been subscribed to the Product News.": {
					"$$noContext": "Vous avez été abonné à la lettre d'information Actualités du Produit."
				},
				"You have successfully been unsubscribed from daily reports.": {
					"$$noContext": "Vous êtes désabonné des rapports quotidiens."
				},
				"You have successfully been unsubscribed from processing alerts.": {
					"$$noContext": "Vous êtes désabonné des alertes de traitement."
				},
				"You have successfully been unsubscribed from quota alerting.": {
					"$$noContext": "Vous êtes désabonné des alertes de quota."
				},
				"You have successfully been unsubscribed from the Data Ecosystem News.": {
					"$$noContext": "Vous avez été désabonné de la lettre d'information Actualités de l'Ecosystème Data."
				},
				"You have successfully been unsubscribed from the Product News.": {
					"$$noContext": "Vous avez été désabonné de la lettre d'information Actualités du Produit."
				},
				"You have successfully changed your newsletter's language.": {
					"$$noContext": "Vous avez bien changé la langue de votre lettre d'information. "
				},
				"You have unsaved changes, are you sure you want to leave?": {
					"$$noContext": "Vous avez des changements non sauvegardés, êtes-vous sûr de vouloir quitter la page ?"
				},
				"You have {{ $count }} invalid email, you should check its format and replace it or remove it entirely.": {
					"$$noContext": ["Vous avez {{ $count }} email invalide, vous pouvez la corriger ou la supprimer de la liste.", "Vous avez {{ $count }} emails invalides, vous pouvez les corriger ou les supprimer de la liste."]
				},
				"You made an error confirming your new password.": {
					"$$noContext": "Vous avez fait une erreur en confirmant votre mot de passe."
				},
				"You made an error typing your password.": {
					"$$noContext": "Vous avez fait une erreur en tapant votre mot de passe."
				},
				"You may not see all your distributed content in the lists below right now.": {
					"$$noContext": "Le contenu distribué peut mettre un peu de temps à apparaître dans les listes."
				},
				"You must declare an url for this page in the 'Properties' tab.": {
					"$$noContext": "Vous devez spécifier une URL pour cette page dans l'onglet 'Propriétés'."
				},
				"You need at least one custom basemap.": {
					"$$noContext": "Vous devez avoir au moins un fond de carte personnalisé."
				},
				"You need to be logged in to see your saved maps.": {
					"$$noContext": "Vous devez être identifié pour voir vos cartes enregistrées."
				},
				"You need to be registered and logged in to subscribe to a dataset.": {
					"$$noContext": "Vous devez être inscrit et identifié pour vous abonner à un jeu de données."
				},
				"You need to name your map": {
					"$$noContext": "Vous devez donner un nom à votre carte"
				},
				"You need to publish your dataset in order to create a new snapshot.": {
					"$$noContext": "Vous devez publier votre jeu de données pour pouvoir en créer un snapshot."
				},
				"You need to publish your dataset in order to view it in Explore.": {
					"$$noContext": "Vous devez publier votre jeu de données afin de pouvoir le consulter dans Explore."
				},
				"You need to submit at least a comment.": {
					"$$noContext": "Vous devez soumettre au moins un commentaire."
				},
				"You reached the maximum number of subdomains.": {
					"$$noContext": "Vous avez atteint le nombre maximum de sous-domaines."
				},
				"You seem located outside the boundaries of the map": {
					"$$noContext": "Il semble que vous soyez situé en dehors des limites de la carte"
				},
				"You will find a summary of your subdomains' indicators in this table": {
					"$$noContext": "Vous trouverez un résumé des indicateurs de vos sous-domaines dans cette table"
				},
				"You will now be taken to your content page.": {
					"$$noContext": "Vous allez maintenant être redirigé vers votre page de contenu."
				},
				"You will receive email notifications from the dataset's publisher if important changes happen.": {
					"$$noContext": "Vous recevrez des notifications par email de la part du producteur du jeu de données si des modifications importantes ont lieu."
				},
				"You'll always be able to add him/her back later on.": {
					"$$noContext": "Vous pourrez le/la réajouter plus tard."
				},
				"You'll be able to paste a geojson describing the area.": {
					"$$noContext": "Vous pourrez rentrer un bloc de GeoJSON définissant la zone."
				},
				"You're not logged in anymore. Please log in and then resend your message.": {
					"$$noContext": "Vous n'êtes plus identifié. Veuillez vous identifier et renvoyer votre message."
				},
				"Your API quota for this domain will reset": {
					"$$noContext": "Votre quota d'API pour ce domaine sera réinitialisé"
				},
				"Your Enigma API key": {
					"$$noContext": "Votre clé d'API Enigma"
				},
				"Your FRED API key": {
					"$$noContext": "Votre clé d'API FRED"
				},
				"Your Quandl API key": {
					"$$noContext": "Votre clé d'API Quandl"
				},
				"Your account": {
					"$$noContext": "Votre compte"
				},
				"Your account has been created, and your map has been saved and attached to your new account.": {
					"$$noContext": "Votre compte a été créé, et votre carte a été sauvegardée et associée à votre nouveau compte."
				},
				"Your changes have been saved.": {
					"$$noContext": "Vos changements ont été sauvegardés."
				},
				"Your code may only contain HTML. No javascript is allowed but AngularJS bindings are available.": {
					"$$noContext": "Votre code ne peut contenir que du HTML. Le javascript n'est pas autorisé mais les bindings AngularJS sont disponibles."
				},
				"Your code may only contain HTML. No javascript is allowed.": {
					"$$noContext": "Votre code ne peut contenir que du HTML. Le javascript n'est pas autorisé."
				},
				"Your comments": {
					"$$noContext": "Vos commentaires"
				},
				"Your email will only be used by the administrators to contact you.": {
					"$$noContext": "Votre email servira seulement aux administrateurs pour vous contacter."
				},
				"Your feedback has been sent to the team!": {
					"$$noContext": "Votre message à bien été envoyé à l'équipe !"
				},
				"Your file is too large to be uploaded (limit is {{limitHuman}})": {
					"$$noContext": "Ce fichier est trop grand pour être envoyé (limite: {{limitHuman}})"
				},
				"Your first harvester!": {
					"$$noContext": "Votre premier harvester !"
				},
				"Your name will be publicly displayed with your reuse": {
					"$$noContext": "Votre nom sera affiché publiquement avec votre réutilisation"
				},
				"Your last name will be publicly displayed with your reuse": {
					"$$noContext": "Votre nom sera affiché publiquement avec votre réutilisation"
				},
				"Your map doesn't have any layer": {
					"$$noContext": "Votre carte n'a pas de couche"
				},
				"Your maps are stored locally in your browser, in order to save or share them, you need to setup an account so we can store them in there.": {
					"$$noContext": "Vos cartes sont conservées localement dans votre navigateur ; afin de les sauvegarder ou partager, vous devez créer un compte pour y associer vos cartes."
				},
				"Your message has been sent to the administrators.": {
					"$$noContext": "Votre message a bien été transmis aux administrateurs."
				},
				"Your name": {
					"$$noContext": "Votre nom"
				},
				"Your password has been changed.": {
					"$$noContext": "Votre mot de passe a été changé."
				},
				"Your password should contain a minimum of 8 characters, including at least one letter and one number.": {
					"$$noContext": "Votre mot de passe doit contenir au moins 8 caractères, dont au moins une lettre et un nombre."
				},
				"Your permissions": {
					"$$noContext": "Vos permissions"
				},
				"Your reuse has been successfully created.": {
					"$$noContext": "Votre réutilisation a bien été créée."
				},
				"Your reuse will be reviewed soon.": {
					"$$noContext": "Votre réutilisation va bientôt être étudiée."
				},
				"Zoom in": {
					"$$noContext": "Zoomer"
				},
				"Zoom max": {
					"$$noContext": "Zoom maximum"
				},
				"Zoom min": {
					"$$noContext": "Zoom minimum"
				},
				"Zoom out": {
					"$$noContext": "Dézoomer"
				},
				"Zoom parameter must be within greater or equal to 0": {
					"API error message": "Le paramètre de zoom doit être supérieur ou égal à 0"
				},
				"Zoom to layer": {
					"$$noContext": "Zoomer jusqu'à la couche"
				},
				"a warning": {
					"$$noContext": ["une erreur", "{{ $count }} erreurs"]
				},
				"aborting": {
					"$$noContext": "en cours d'abandon"
				},
				"accessible using": {
					"$$noContext": "accessible par"
				},
				"and the dataset's license": {
					"$$noContext": "et la licence du jeu de données"
				},
				"as form data": {
					"$$noContext": "comme champ de form."
				},
				"at": {
					"$$noContext": "à"
				},
				"at least": {
					"$$noContext": "au moins"
				},
				"bottom left": {
					"$$noContext": "bas à gauche"
				},
				"bottom right": {
					"$$noContext": "bas à droite"
				},
				"by": {
					"$$noContext": "par"
				},
				"center": {
					"$$noContext": "centre"
				},
				"clear quota": {
					"$$noContext": "Effacer le quota"
				},
				"color": {
					"$$noContext": "couleur"
				},
				"copy": {
					"$$noContext": "copie"
				},
				"data": {
					"$$noContext": "données"
				},
				"datapackage.json file URL": {
					"$$noContext": "URL du fichier datapackage.json"
				},
				"dataset": {
					"$$noContext": ["jeu de données", "jeux de données"],
					"catalog page": ["jeu de données", "jeux de données"]
				},
				"date": {
					"$$noContext": "date"
				},
				"datetime": {
					"$$noContext": "datetime"
				},
				"day": {
					"$$noContext": "jour"
				},
				"days": {
					"$$noContext": "jours"
				},
				"deleted group": {
					"$$noContext": "groupe supprimé"
				},
				"deleted user": {
					"$$noContext": "utilisateur supprimé"
				},
				"deleting": {
					"$$noContext": "en cours de suppression"
				},
				"display stack cumulative value": {
					"$$noContext": "afficher les valeurs cumulées des empilements"
				},
				"display units": {
					"$$noContext": "afficher les unités"
				},
				"display values on chart": {
					"$$noContext": "afficher les valeurs sur le graphique"
				},
				"double": {
					"$$noContext": "décimal"
				},
				"draft": {
					"$$noContext": "brouillon"
				},
				"e.g. 216.58.198.196 or ftp.mysite.com": {
					"$$noContext": "par ex. 216.58.198.196 ou ftp.mysite.com"
				},
				"e.g. 216.58.198.196 or portal.socrata.com": {
					"$$noContext": "par ex. 216.58.198.196 ou portal.socrata.com"
				},
				"e.g. 216.58.198.196/datapackage.json or myportal.com/datapackage.json": {
					"$$noContext": "par ex. 216.58.198.196/datapackage.json ou myportal.com/datapackage.json"
				},
				"empty": {
					"$$noContext": "vide"
				},
				"file": {
					"$$noContext": "fichier"
				},
				"for a new record": {
					"$$noContext": "pour un nouvel enregistrement"
				},
				"for an existing record": {
					"$$noContext": "pour un enregistrement existant"
				},
				"from the harvester": {
					"$$noContext": "du moissonneur"
				},
				"geo point": {
					"$$noContext": "point géo"
				},
				"geo shape": {
					"$$noContext": "forme géo"
				},
				"hh": {
					"$$noContext": "hh"
				},
				"hour": {
					"$$noContext": "heure"
				},
				"hours": {
					"$$noContext": "heures"
				},
				"iFrame code": {
					"$$noContext": "Code de l'IFrame"
				},
				"idle": {
					"$$noContext": "inactif"
				},
				"if Y >": {
					"$$noContext": "Si Y >"
				},
				"in the headers": {
					"$$noContext": "dans les entêtes"
				},
				"in the path": {
					"$$noContext": "dans le chemin du fichier"
				},
				"in the query": {
					"$$noContext": "dans la requête"
				},
				"in the request body": {
					"$$noContext": "dans le corps de la requête"
				},
				"in {unit}": {
					"$$noContext": "en {unit}"
				},
				"inside": {
					"$$noContext": "à l'intérieur"
				},
				"integer": {
					"$$noContext": "entier"
				},
				"interval": {
					"$$noContext": "intervalle"
				},
				"invalid epsg code": {
					"$$noContext": "Code epsg invalide"
				},
				"invalid expression": {
					"$$noContext": "Expression invalide"
				},
				"invalid field name": {
					"$$noContext": "Nom de champ invalide"
				},
				"invalid key": {
					"$$noContext": "Clé invalide"
				},
				"invalid number of fields, there should be %s fields": {
					"$$noContext": "Nombre de champs invalide, il devrait y avoir %s champs"
				},
				"invalid polygon": {
					"$$noContext": "Polygon invalide"
				},
				"invalid regex": {
					"$$noContext": "Expression régulière invalide"
				},
				"invalid type": {
					"$$noContext": "Type invalide"
				},
				"invalid url": {
					"$$noContext": "URL invalide"
				},
				"invalid value": {
					"$$noContext": "Valeur invalide"
				},
				"language picker for all languages specified for the portal": {
					"$$noContext": "sélecteur de langue pour les langues du portail"
				},
				"last saved": {
					"$$noContext": "sauvé"
				},
				"left-to-right": {
					"$$noContext": "gauche-à-droite"
				},
				"line charts": {
					"$$noContext": "lignes"
				},
				"link to the terms and conditions specified for the portal": {
					"$$noContext": "lien vers les conditions d'utilisation du portail"
				},
				"links to change the portal's language": {
					"$$noContext": "liens pour changer la langue du portail"
				},
				"m3/d": {
					"$$noContext": "m3/J"
				},
				"metadata": {
					"$$noContext": "métadonnées"
				},
				"minute": {
					"$$noContext": "minute"
				},
				"minutes": {
					"$$noContext": "minutes"
				},
				"month": {
					"$$noContext": "mois"
				},
				"months": {
					"$$noContext": "mois"
				},
				"new": {
					"$$noContext": "nouveau"
				},
				"no dataset to display": {
					"$$noContext": "aucun jeu de données à afficher"
				},
				"not saved": {
					"$$noContext": "pas enregistré"
				},
				"of which was already published": {
					"$$noContext": ["a déjà été publié", "ont déjà été publiés "]
				},
				"on": {
					"$$noContext": "le"
				},
				"on the": {
					"$$noContext": "le"
				},
				"or": {
					"$$noContext": "ou"
				},
				"outside": {
					"$$noContext": "à l'extérieur"
				},
				"parameter is mandatory": {
					"$$noContext": "Paramètre obligatoire"
				},
				"per": {
					"$$noContext": "par"
				},
				"periodic": {
					"$$noContext": "Périodique"
				},
				"processing": {
					"$$noContext": "en cours de traitement"
				},
				"processing error": {
					"$$noContext": ["erreur de traitement", "erreurs de traitement"]
				},
				"query": {
					"$$noContext": "Requête"
				},
				"queued": {
					"$$noContext": "en attente de traitement"
				},
				"quota": {
					"$$noContext": "quota"
				},
				"record": {
					"$$noContext": ["enregistrement", "enregistrements"]
				},
				"records": {
					"$$noContext": "enregistrements"
				},
				"required": {
					"$$noContext": "obligatoire"
				},
				"resets": {
					"$$noContext": "remise à zéro"
				},
				"results": {
					"$$noContext": "résultats"
				},
				"right-to-left": {
					"$$noContext": "droite-à-gauche"
				},
				"saved": {
					"$$noContext": "enregistré"
				},
				"saved!": {
					"$$noContext": "enregistré !"
				},
				"saving...": {
					"$$noContext": "enregistrement en cours ..."
				},
				"second": {
					"$$noContext": "seconde"
				},
				"seconds": {
					"$$noContext": "secondes"
				},
				"shape edges cannot cross!": {
					"$$noContext": "les bords des formes ne peuvent pas se croiser ! "
				},
				"sort": {
					"$$noContext": "trier"
				},
				"subdomain left": {
					"$$noContext": ["sous-domaine disponible", "sous-domaines disponibles"]
				},
				"text": {
					"$$noContext": "texte"
				},
				"the Data4Citizen logo": {
					"$$noContext": "le logo Data4Citizen"
				},
				"the main menu (links to the various pages)": {
					"$$noContext": "le menu principal (avec des liens vers les différentes pages)"
				},
				"the menu containing the links to login, your account...": {
					"$$noContext": "Le menu contenant les liens vers la page de connexion, vers votre profil..."
				},
				"the portal logo, as configured in the Domain page": {
					"$$noContext": "le logo du portail, comme configuré dans la page Domaine"
				},
				"the portal's brand, as configured in the Domain page": {
					"$$noContext": "la marque du portail, comme configuré dans la page Domaine"
				},
				"to": {
					"$$noContext": "au"
				},
				"top left": {
					"$$noContext": "haut à gauche"
				},
				"top right": {
					"$$noContext": "haut à droite"
				},
				"translate('string')": {
					"$$noContext": "translate('string')"
				},
				"type error": {
					"$$noContext": "Erreur de type"
				},
				"unauthorized": {
					"$$noContext": "Non autorisé"
				},
				"use scientific display for the values": {
					"$$noContext": "Affichage scientifique des valeurs"
				},
				"value": {
					"$$noContext": "valeur"
				},
				"visible columns": {
					"$$noContext": "colonnes visibles"
				},
				"visible entry points": {
					"$$noContext": "points d'entrée visibles"
				},
				"will be set automatically": {
					"$$noContext": "sera déterminée automatiquement"
				},
				"year": {
					"$$noContext": "année"
				},
				"years": {
					"$$noContext": "années"
				},
				"you need to accept the portal's <a href=\"/conditions\">terms of use</a>": {
					"$$noContext": "vous devez accepter les <a href=\"/conditions\">conditions générales</a> du portail"
				},
				"{aria} selection list. Current value is {value}": {
					"$$noContext": "Liste de sélection {aria}. Valeur actuelle : {value}"
				},
				"{count} user(s) successfully added to the group.": {
					"$$noContext": "{count} utilisateur(s) ajouté(s) au groupe"
				},
				"{doms} and {lastDom}": {
					"$$noContext": "{doms} et {lastDom}"
				},
				"{label} input": {
					"$$noContext": "champ de formulaire {label}"
				},
				"{label} slider": {
					"$$noContext": "curseur {label}"
				},
				"{successes} user(s) successfully added to the group, {duplicates} already in the group.": {
					"$$noContext": "{successes} utilisateur(s) ajouté(s) au groupe, {duplicates} déjà dans le groupe."
				},
				"{username}'s access request to your portal has been approved.": {
					"$$noContext": "La demande d'accès de {username} à votre portail a été approuvée"
				},
				"{username}'s access request to your portal has been rejected.": {
					"$$noContext": "La demande d'accès de {username} à votre portail a été rejetée"
				},
				"{{ $count }} character remaining": {
					"$$noContext": ["{{ $count }} caractère restant", "{{ $count }} caractères restants"]
				},
				"{{ $count }} dataset": {
					"$$noContext": ["{{ $count }} jeu de données", "{{ $count }} jeux de données"]
				},
				"{{ $count }} dataset couldn't be harvested and won't appear on your portal.": {
					"$$noContext": ["{{ $count }} jeu de données n'a pas pu être moissonné et n'apparaitra pas sur votre portail.", "{{ $count }} jeux de données n'ont pas pu être moissonnés et n'apparaitront pas sur votre portail."]
				},
				"{{ $count }} dataset found": {
					"$$noContext": ["{{ $count }} jeu de données trouvé", "{{ $count }} jeux de données trouvés"]
				},
				"{{ $count }} dataset harvested": {
					"$$noContext": ["{{ $count }} jeu de données moissonné", "{{ $count }} jeux de données moissonnés"]
				},
				"{{ $count }} invitation had error.": {
					"$$noContext": ["{{ $count }} invitation en erreur.", "{{ $count }} invitations en erreur."]
				},
				"{{ $count }} invitation was sent.": {
					"$$noContext": ["{{ $count }} invitation a été envoyée.", "{{ $count }} invitations ont été envoyées."]
				},
				"{{ $count }} more item...": {
					"$$noContext": ["{{ $count }} item de plus ...", "{{ $count }} éléments de plus ..."]
				},
				"{{ $count }} user": {
					"$$noContext": ["{{ $count }} utilisateur", "{{ $count }} utilisateurs"]
				},
				"{{ (groups | filter:search | filter:filterByPermission).length }} out of {{ groups.length }}": {
					"$$noContext": "{{ (groups | filter:search | filter:filterByPermission).length }} sur {{ groups.length }}"
				},
				"{{ duplicatesNumber }} ignored duplicate": {
					"$$noContext": ["{{ duplicatesNumber }} doublon ignoré", "{{ $count }} doublons ignorés"]
				},
				"{{ getRecordTitle(image.record) }} - {{ image.index + 1 }} out of {{ images.length }}": {
					"$$noContext": "{{ getRecordTitle(image.record) }} - {{ image.index + 1 }} sur {{ images.length }}"
				},
				"{{ totalFoundItems }} out of {{ totalItems }}": {
					"$$noContext": "{{ totalFoundItems }} sur {{ totalItems }}"
				},
				"{{ totalFoundUsers }} out of {{ totalUsers }}": {
					"$$noContext": "{{ totalFoundUsers }} sur {{ totalUsers }}"
				},
				"{{$count|number}} item": {
					"$$noContext": ["{{ $count|number }} élément", "{{ $count|number }} éléments"]
				},
				"{{$count}} download": {
					"$$noContext": ["{{ $count }} téléchargement", "{{ $count }} téléchargements"]
				},
				"{{item.name}} ({{$count}} dataset)": {
					"$$noContext": ["{{item.name}} ({{$count}} jeu de données)", "{{item.name}} ({{$count}} jeux de données)"]
				},
				"— Not available for this dataset": {
					"$$noContext": "— Non disponible pour ces données"
				},
				"← or → to reorder<br>space or ↵ to add/remove": {
					"$$noContext": "← ou → pour réordonner<br>espace ou ↵ pour ajouter/supprimer"
				},
				"Dataset date": {
					"$$noContext": "Date du jeu de données"
				},
				"Predefined Filters": {
					"$$noContext": "Filtres prédéfinis"
				},
				"Download chart": {
					"$$noContext": "Télécharger ce graphe"
				},
			};
			var current_language = "fr";
			DebugLogger.log("Translations", translations);
			gettextCatalog.setStrings(current_language, translations);
			gettextCatalog.setCurrentLanguage(current_language);
			moment.locale(current_language);
			$http.defaults.xsrfCookieName = 'csrftoken';
			$http.defaults.xsrfHeaderName = 'X-CSRFToken';
		}
	]); ;
if (window.L)
	L.Icon.Default.imagePath = 'lib/leaflet/images/';
