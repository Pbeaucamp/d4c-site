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
;(function(){'use strict';
	var appD4C=angular.module('d4c.explore.apiD4C.console',['d4c','d4c.core','d4c.explore.apiD4C.console.config',]).config(['$provide',function($provide){
		$provide.decorator('$browser',function($delegate){
			var superUrl=$delegate.url;
			$delegate.url=function(url,replace){
				if(url!==undefined){
					return superUrl(url.replace(/\%20/g,"+"),replace);
				}else{
					return superUrl().replace(/\+/g,"%20");
				}
			};
			return $delegate;
		});
	}]);
	appD4C.controller('ConsoleD4CCtrl',['$scope','DebugLogger','ServicesDescription','$http','$location',function($scope,DebugLogger,ServicesDescription,$http,$location){
		var applyParameters=function(){
			var service=$scope.activeBox;
			var newPath='';
			var newSearch='';
			if(service){
				var result=angular.copy($scope.api[service.id]);
				newPath=getPathFromUrlParameters(service.url,result.urlParameters,service.urlParameters);
				newSearch=result.parameters;
				if(service.parameters){
					hierarchicalArrayToParams(service,newSearch);
				}
			}
			$location.path(newPath);
			$location.search(newSearch);
			$location.url($location.url().replace('?',''));
		};
		var getPathFromUrlParameters=function(serviceUrl,parameters,urlParameters){
			var url=normalizeUrl(serviceUrl);
			angular.forEach(urlParameters,function(param){
				var paramName=parameters[param.name];
				var value=paramName?paramName:'';
				url=url.replace(param.name,value);
			});
			return url;
		};
		var getService=function(id){
			for(var i=0;i<$scope.services.length;i++){
				var service=$scope.services[i];
				if(id===service.id){return service;}
			}
			return null;
		};
		var getUrlParametersFromPath=function(serviceUrl,requestedUrl,urlParameters){
			var ignoredParameters=[];
			var params={};
			serviceUrl=normalizeUrl(serviceUrl).split('/');
			requestedUrl=requestedUrl.split('/');
			serviceUrl.splice(0,1);
			requestedUrl.splice(0,1);
			angular.forEach(urlParameters,function(param){
				ignoredParameters.push(param.name);
			});
			for(var i=0;i<serviceUrl.length;i++){
				if($.inArray(serviceUrl[i],ignoredParameters)>=0){
					params[serviceUrl[i]]=requestedUrl[i];
				}
			}
			return params;
		};
		var getServicesDescriptionUrl=function(){
			var urls=[[],[]];
			angular.forEach($scope.services,function(service){
				var index=!service.urlParameters?0:1;
				urls[index].push({
					id:service.id,
					url:normalizeUrl(service.url),
					urlParameters:service.urlParameters
				});
			});
			urls=urls[0].concat(urls[1]);
			return urls;
		};
		var hierarchicalArrayToParams=function(service,params){
			for(var i=0;i<service.parameters.length;i++){
				var parameter=service.parameters[i];
				if(parameter.readonly===true&&params[parameter.name]){
					delete params[parameter.name];
				}
				for(var key in params){
					if(key.indexOf(parameter.name+'.')>=0){
						delete params[key];
					}
				}
				if(parameter.type==='hierarchical'&&params[parameter.name]){
					var object=params[parameter.name];
					for(var subkey in object){
						var name=parameter.name+'.'+subkey;
						if(object[subkey].length){params[name]=object[subkey];}
					}
					delete params[parameter.name];
				}
			}
		};
		var hierarchicalParamsToArray=function(service,params){
			for(var i=0;i<service.parameters.length;i++){
				var parameter=service.parameters[i];
				if(parameter.type==='hierarchical'){
					var object={};
					for(var key in params){
						if(key.indexOf(parameter.name+'.')>=0){
							var newKey=key.substr(key.indexOf('.')+1);
							object[newKey]=params[key];
							delete params[key];
						}
					}
					if(!$.isEmptyObject(object)){
						params[parameter.name]=object;
					}
				}
			}
		};
		var isSameUrl=function(serviceUrl,requestedUrl,urlParameters){
			var ignoredParameters=[];
			serviceUrl=serviceUrl.split('/');
			requestedUrl=requestedUrl.split('/');
			serviceUrl.splice(0,1);requestedUrl.splice(0,1);
			if(serviceUrl.length!=requestedUrl.length){return false;}
			angular.forEach(urlParameters,function(param){
				ignoredParameters.push(param.name);
			});
			for(var i=0;i<serviceUrl.length;i++){
				if($.inArray(serviceUrl[i],ignoredParameters)>=0){continue;}
				if(serviceUrl[i]!=requestedUrl[i]){return false;}
			}
			return true;
		};
		var normalizeUrl=function(url){
			return url;
		};
		var setActiveService=function(){
			var path=/*$location.path()*/"";
			var services=getServicesDescriptionUrl();
			for(var i=0;i<services.length;i++){
				var service=services[i];
				if(isSameUrl(service.url,path,service.urlParameters)){$scope.activeBox=getService(service.id);break;}
			}
		};
		$scope.activeBox=null;
		$scope.api={};
		$scope.results={};
		$scope.errors={};
		$scope.loc=$location;
		$scope.pendingRequests=$http.pendingRequests;
		$scope.services=ServicesDescription;
		$scope.services1=$scope.services.filter(function(v,index){if(index==0) return $scope.services[index];});
		$scope.services3=$scope.services.filter(function(v,index){if(index==2) return $scope.services[index];});
		$scope.services2=$scope.services.filter(function(v,index){if(index==1) return $scope.services[index];});
		angular.forEach($scope.services,function(service){
			$scope.api[service.id]={parameters:{},urlParameters:{}};
		});
		$scope.toggleActiveBox=function(service){if($scope.activeBox!=service){$scope.activeBox=service;}else{$scope.activeBox=null;}};
		$scope.computeURL=function(service){
			$scope.apiParams={parameters:{},urlParameters:{}};
			var baseURL=service.url;
			if(service.urlParameters){
				var value;
				for(var key in $scope.api.urlParameters){
					value=$scope.api.urlParameters[key];
					if(value){$scope.apiParams.urlParameters[key]=value;}
				}
				for(var i=0;i<service.urlParameters.length;i++){
					var urlParameter=service.urlParameters[i];
					value='';
					if($scope.api.urlParameters[urlParameter.name]){value=$scope.api.urlParameters[urlParameter.name];}
					//baseURL=baseURL.replace(urlParameter.name,value);
				}
			}
			if(service.parameters){
				for(var j=0;j<service.parameters.length;j++){
					var parameter=service.parameters[j];
					if(parameter.type==='hierarchical'&&$scope.api[service.id].parameters[parameter.name]){
						var object=$scope.api[service.id].parameters[parameter.name];
						for(var subkey in object){
							var name=parameter.name+'.'+subkey;$scope.apiParams.parameters[name]=object[subkey];
						}
					}else if($scope.api[service.id].parameters[parameter.name]){
						$scope.apiParams.parameters[parameter.name]=$scope.api[service.id].parameters[parameter.name];
					}
				}
			}
			var queryString=$.param(Object.assign({}, $scope.api[service.id].urlParameters, $scope.apiParams.parameters),true);
			if(queryString){return baseURL+queryString;}else{return baseURL;}
		}
		$scope.sendRequest=function(service){
			$http.get($scope.computeURL(service))
			.then(function(data){
				$scope.results[service.id]=data.data;$scope.errors[service.id]=null;
			}, function(data){$scope.results[service.id]=null;$scope.errors[service.id]=data.error;});
		};
		//$scope.sendRequest=function(service){$scope.results=JSON.parse('[{"name":"dataset","helptext":"ID du jeu de données"},{"name":"q","helptext":"Requête en texte intégral"},{"name":"lang","helptext":"Code langue de 2 lettres"}]');$scope.errors=null;};
		var path=angular.copy($location.path());
		var search=angular.copy($location.search());
		setActiveService();
		var service=$scope.activeBox;
		if(service){
			DebugLogger.log('Active box:',service,search);
			var result=$scope.api[service.id];
			if(service.parameters){
				hierarchicalParamsToArray(service,search);
				result.parameters=search;
			}
			if(service.urlParameters){
				result.urlParameters=getUrlParametersFromPath(service.url,path,service.urlParameters);
			}
		}
		else{
			DebugLogger.log('Unknown service:',path);
			$location.replace();
			$scope.activeBox=$scope.services[0];
		}
		$scope.$watch('activeBox',function(){
			applyParameters();
		});
		$scope.$watch('api',function(newValue,oldValue){
			if(newValue!=oldValue){
				$location.replace();
				applyParameters();
			}
		},true);
		$scope.$watch('loc.path()',function(newValue,oldValue){
			if(newValue!=oldValue){
				setActiveService();
			}
		});
	}]);
}());
;(function(){
	'use strict';
	var appD4C=angular.module('d4c.explore.apiD4C.console.services',[]);
	appD4C.factory('DatasetsSearchParameters2',function(translate){
		 return [{
            'name': 'q',
            'helptext': translate('Full-text query')
        }, {
            'name': 'lang',
            'helptext': translate('2-letters language code for linguistic text features')
        },{
            'name': 'refine',
            'type': 'hierarchical',
            'helptext': translate('Refinements to apply'),
            'hierarchy': [translate('Facet name'), translate('Value')]
        },{
            'name': 'sort',
            'helptext': translate('Sort expression (field or -field)')
        },{
            'name': 'rows',
            'type': 'integer',
            'default': 10,
            'helptext': translate('Number of rows in the result (default: 10)')
        }, {
            'name': 'start',
            'type': 'integer',
            'helptext': translate('Index of the first result to return (use for pagination)')
        }, {
            'name': 'facet',
            'multiple': true,
            'helptext': translate('Name of facets to enable in the results')
        }, {
            'name': 'exclude',
            'type': 'hierarchical',
            'helptext': translate('Exclusions to apply'),
            'hierarchy': [translate('Name'), translate('Value')]
        }];
	});
	appD4C.factory('DatasetsLookupParameters2',function(translate){
		return[{'name':'DATASETID','type':'string','helptext':translate('the id or name of the group')},
		{'name':'facet','type':'string','helptext':translate('the maximum number of datasets to return')}];
	
	});
	appD4C.factory('RecordsSearchParameters2',function(translate){
		return [{
            'name': 'dataset',
            'helptext': translate('Dataset ID')
        }, {
            'name': 'q',
            'helptext': translate('Full-text query')
        }, {
            'name': 'lang',
            'helptext': translate('2-letters language code for linguistic text features')
        }, {
            'name': 'rows',
            'type': 'integer',
            'default': 10,
            'helptext': translate('Number of rows in the result (default: 10)')
        }, {
            'name': 'start',
            'type': 'integer',
            'helptext': translate('Index of the first result to return (use for pagination)')
        }, {
            'name': 'sort',
            'helptext': translate('Sort expression (field or -field)')
        }, {
            'name': 'facet',
            'multiple': true,
            'helptext': translate('Name of facets to enable in the results')
        }, {
            'name': 'refine',
            'type': 'hierarchical',
            'helptext': translate('Refinements to apply'),
            'hierarchy': [translate('Facet name'), translate('Value')]
        }, {
            'name': 'exclude',
            'type': 'hierarchical',
            'helptext': translate('Exclusions to apply'),
            'hierarchy': [translate('Name'), translate('Value')]
        }, {
            'name': 'geofilter.distance',
            'helptext': translate('A WGS84 point and a distance in meters indicating a geo position for geo filtering')
        }, {
            'name': 'geofilter.polygon',
            'type': 'geo_polygon_2d',
            'helptext': translate('A polygon, expressed as a list of WGS84 points (only one path polygons supported at the moment)')
        }, {
            'name': 'timezone',
            'type': 'text',
            'helptext': translate('The timezone used to interpret dates and times in queries and records.'),
            'default': jstz.determine().name()
        }];
	});
}());
;(function(){
	var dvFirst = document.getElementById('app1');
	var dvSecond = document.getElementById('app2');

	angular.element(document).ready(function() {
	   angular.bootstrap(dvFirst, ['d4c.explore.api.console']);
	   angular.bootstrap(dvSecond, ['d4c.explore.apiD4C.console']);
	});
}());
