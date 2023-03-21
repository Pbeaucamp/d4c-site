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
	var app=angular.module('d4c.explore.api.console',['d4c','d4c.core','d4c.explore.api.console.config',]).config(['$provide',function($provide){
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
	app.controller('ConsoleCtrl',['$scope','DebugLogger','ServicesDescription','$http','$location',function($scope,DebugLogger,ServicesDescription,$http,$location){
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
		$scope.services4=$scope.services.filter(function(v,index){if(index==3) return $scope.services[index];});
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
					}
					else if(parameter.type === 'refine' && $scope.api[service.id].parameters[parameter.name]){
						var object = $scope.api[service.id].parameters[parameter.name];
						var refines = object.split(',');
						if (refines) {
							for(var i=0; i < refines.length; i++) {
								var refineValues = refines[i].split("=");

								var name = parameter.name + '.' + refineValues[0];
								$scope.apiParams.parameters[name] = refineValues[1];
							}
						}
					}
					else if($scope.api[service.id].parameters[parameter.name]){
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
				//We specifically change this result as it is a special API endpoint
				var result = null;
				if (service.id === 'resource_records_search') {
					result = data.data;
				}
				else {
					result = data.data.result;
				}
				if (result == null) {
					result=data.data.result;
				}
				$scope.results[service.id] = result;
				$scope.errors[service.id] = null;
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
	var app=angular.module('d4c.explore.api.console.services',[]);
	app.factory('DatasetsSearchParameters',function(translate){
		return[{'name':'q','helptext':translate('the solr query. Optional. Default: "*:*"')},
			{'name':'fq','helptext':translate('any filter queries to apply')},
			{'name':'sort','helptext':translate('Sorting of the search results. Optional. Default: "relevance asc, metadata_modified desc"')},
			{'name':'rows','type':'integer','helptext':translate('the number of matching rows to return. There is a hard limit of 1000 datasets per query')},
			{'name':'start','type':'integer','helptext':translate('the offset in the complete result for where the set of returned datasets should begin')},
			{'name':'facet','type':'boolean','helptext':translate('whether to enable faceted results. Default: True')},
			{'name':'facet.mincount','type':'integer','helptext':translate('the minimum counts for facet fields should be included in the results')},
			{'name':'facet.limit','type':'integer','helptext':translate('the maximum number of values the facet fields return. A negative value means unlimited')},
			{'name':'facet.field','helptext':translate('the fields to facet upon. Default empty')},
			{'name':'include_drafts','type':'boolean','helptext':translate('if True, draft datasets will be included in the results. A user will only be returned their own draft datasets, and a sysadmin will be returned all draft datasets. Optional, the default is False')},
			{'name':'include_private','type':'boolean','helptext':translate('if True, private datasets will be included in the results. Only private datasets from the user’s organizations will be returned and sysadmins will be returned all private datasets. Optional, the default is False')}
			];
		});
	app.factory('DatasetsLookupParameters',function(translate){
		return[{'name':'id','type':'string','helptext':translate('the id or name of the group')},
		{'name':'limit','type':'integer','helptext':translate('the maximum number of datasets to return')}
		
		
		];
		});
	//app.value('DatasetsLookupUrlParameters',[{'name':'id'}]);
	//app.value('DatasetsLookupParameters',[{'name':'facet','multiple':true}]);
	app.factory('RecordsSearchParameters',function(translate){
		return[{
			'name':'resource_id','type':'string','helptext':translate('id or alias of the resource to be searched against')},
			{'name':'filters','type':'string','helptext':translate('matching conditions to select, e.g {“key1”: “a”, “key2”: “b”} ')},
			{'name':'q','type':'string','helptext':translate(' full text query. If it’s a string, it’ll search on all fields on each row. If it’s a dictionary as {“key1”: “a”, “key2”: “b”}, it’ll search on each specific field')},
			{'name':'distinct','type':'boolean','helptext':translate('return only distinct rows (optional, default: false)')},
			{'name':'plain','type':'boolean','helptext':translate(' treat as plain text query (optional, default: true)')},
			{'name':'language','type':'string','helptext':translate('language of the full text query (optional, default: english)')},
			{'name':'limit','type':'integer','helptext':translate('maximum number of rows to return (optional, default: 100)')},
			{'name':'offset','type':'integer','helptext':translate('offset this number of rows (optional)')},
			{'name':'fields','type':'string','helptext':translate('fields to return (optional, default: all fields in original order)')},
			{'name':'sort','type':'string','helptext':translate(' comma separated field names with ordering e.g.: “fieldname1, fieldname2 desc”')},
			{'name':'include_total','type':'boolean','helptext':translate(' True to return total matching record count (optional, default: true)')},
			{'name':'records_format','type':'string','helptext':translate('the format for the records return value: ‘objects’ (default) list of {fieldname1: value1, ...} dicts, ‘lists’ list of [value1, value2, ...] lists, ‘csv’ string containing comma-separated values with no header, ‘tsv’ string containing tab-separated values with no header')}
			];
		});
		app.factory('ResourceRecordsSearchParameters',function(translate){
			return	[
				{'name':'resource_id','type':'string','helptext':translate('the id of the resource')},
				{'name':'format','type':'string','helptext':translate('the format (default is json). list of available formats: csv, json, xls, geojson')},
				{'name':'refine','type':'refine','helptext':translate('refine to apply (ex: key=value,key2=value2)')}
			];
		});

}());