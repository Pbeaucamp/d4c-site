//showPopularDataset();


function updateNbViews(id){
    var url = fetchPrefix() + '/d4c/api/datasets/'+id+'/update/views';
    $.ajax( url ,
        {
            type:'GET',
            dataType:'json',
            cache:'true',
            success:function(data){
                console.log("Increment de nb views");
                //console.log("response:"+data);
            },
            error: function(e){
                console.log("Error: ",e);
            } 
        }
    );    
}

function updateNbDownload(id){
    var url = fetchPrefix() + '/d4c/api/datasets/'+id+'/update/downloads';
    $.ajax( url ,
        {
            type:'GET',
            dataType:'json',
            cache:'true',
            success:function(data){
                console.log("Increment de nb download");
                console.log("response:"+data);
            },
            error: function(e){
                console.log("Error de increment nb_download: ",e);
            } 
        }
    );    
}



function showPopularDataset(){
    // list-popularDataset
    $('#list-popularDataset').find('li').remove() ;
    $.ajax(fetchPrefix() + '/d4c/api/datasets/sort/bykey/nb_download' ,
        {
            type:'GET',
            dataType:'json',
            cache:'true',
            success:function(data){
                //console.log(data);
                getPopularData(data);
                getTheme(data);
                
            },
            error: function(e){
                console.log("Error: ",e);
            } 
        }
    );
}

function getPopularData(json){
   
    
    var n = 5;
    var nbDatasetToShow = 0;
    //console.log(json);
    
    if(json.length==0){
        $('.div-donnees').append('<div class="alert alert-info">Donnée non disponible </div>');
    }
    if( json.length > n ){
        nbDatasetToShow = n ;
    }else{
        nbDatasetToShow = json.length;
    }
    for( var i=0; i< nbDatasetToShow ; i++){
        var theme = json[i].theme;
		if(theme == undefined || theme == "") theme = "default";
		theme = accentsTidy(theme.replace(new RegExp(", ", 'g'),"-").replace(new RegExp(",", 'g'),"-").replace(new RegExp(" ", 'g'),"-"));
        theme= getSelectedTheme(theme);
        var li = document.createElement("li");
        li.classList.add("li-most-popular-dataset");
		li.classList.add("theme-" + theme);
            /*var div = document.createElement("div");
            div.classList.add("div-most-popular-dataset-details");*/
        var a = document.createElement("a");
        a.classList.add("link-most-popular-dataset");
        var url ="' + fetchPrefix() + '/visualisation/table/?id="+json[i].id ;
        //"/explore/dataset/"+json[i].title +"/" ;
        a.setAttribute("href", url );
        a.setAttribute("target", "_self" );
        a.innerHTML = json[i].title  ;
        li.appendChild(a);
        
        //console.log("li: "+li);
        
        $('#list-popularDataset').append(li) ;
    }
}
//$('#list-popularDataset').find('li').remove() ;
//$('#list-popularDataset').find('li').remove() ;

// A supprimer
function showTheme(){
   
    $.ajax(fetchPrefix() + '/d4c/api/datasets/sort/bykey/nb_download' ,
        {
            type:'GET',
            dataType:'json',
            cache:'true',
            success:function(data){
                 
                getTheme(data);
            },
            error: function(e){
                console.log("Error: ",e);
            } 
        }
    );
    
}





function getTheme(json){
    console.log(json);
    var n = 9;
    var nbDatasetToShow = 0;
    //console.log(json);
    //console.log("test");
    $('.div-theme').find('div').remove() ;
    
    if(json.length==0){
        $('.div-theme').find('div').remove() ;
    }    
    if( json.length > n ){
        nbDatasetToShow = n ;
    }else{
        nbDatasetToShow = json.length;
    }    
    
    
    var displayedTheme = new Array();
    for(var i=0; i<nbDatasetToShow; i++ ){
        var theme = json[i].theme;
        var tooltipTitle = theme;
        var link_theme = theme;
		if(theme == undefined || theme == ""){
            theme = "default";
            tooltipTitle = "default";
            link_theme = "default"; 
        }
        theme = accentsTidy(theme.replace(new RegExp(", ", 'g'),"-").replace(new RegExp(",", 'g'),"-").replace(new RegExp(" ", 'g'),"-"));
        
        var selectedTheme = getSelectedTheme(theme);
        //console.log("dataset :"+ json[i].title+" theme selected:"+selectedTheme);
        if( !displayedTheme.includes(selectedTheme) )
            {
                displayedTheme.push(selectedTheme);
                var div = document.createElement("div");
                div.classList.add("div-most-popular-theme");
                var a = document.createElement("a");
                a.classList.add("link-most-popular-theme");
                a.classList.add("theme-" + selectedTheme);
                a.setAttribute("data-toggle", "tooltip" );
                a.setAttribute("title",tooltipTitle.trim() );
                var url="/portail?theme="+link_theme ;
                //"/explore/dataset/"+json[i].title +"/" ;
                a.setAttribute("href", url );
                a.setAttribute("target", "_self" );
                div.appendChild(a);
                $('.div-theme').append(div) ;            
            } 
    }
     
}

function getSelectedTheme(theme){
    var themeCluster =[
      "administration-gouvernement-finances-publiques-citoyennete",  
      "amenagement-du-territoire-urbanisme-batiments-equipements-logement",  
      "culture-patrimoine",  
      "economie-business-pme-developpement-economique-emploi",  
      "education-formation-recherche-enseignement",  
      "environnement",  
      "services-social", 
      "theme-transports-deplacements"
    ];
    
    var selectedTheme="default";
    var firstTheme = -1;
    for( var i=0; i<themeCluster.length; i++ ){
        
       var index = theme.indexOf(themeCluster[i] );
       if( index!=-1){
            selectedTheme = themeCluster[i] ;
            break;
           //if ( index < firstTheme ) firstTheme = index ;
        }
    }
    /*if( firstTheme!=-1){
        selectedTheme = themeCluster[firstTheme] ;
    } */ 
    return selectedTheme;
}








accentsTidy = function(s){
    var r = s.toLowerCase();
    non_asciis = {'a': '[àáâãäå]', 'ae': 'æ', 'c': 'ç', 'e': '[èéêë]', 'i': '[ìíîï]', 'n': 'ñ', 'o': '[òóôõö]', 'oe': 'œ', 'u': '[ùúûűü]', 'y': '[ýÿ]'};
    for (i in non_asciis) { r = r.replace(new RegExp(non_asciis[i], 'g'), i); }
    return r;
};