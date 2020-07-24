function calculValueFromFiltre(elem, idRes, colonne, operation,colonne_filtre=null, valeur_filtre =null ) {

	$.ajax('/api/calculvaluefiltre', {
        	type: 'POST',
                dataType: "json",
                cache: true,
                data : { idRes : idRes, colonne : colonne, colonne_filtre: colonne_filtre,  valeur_filtre: valeur_filtre, operation : operation },
                success: function (data) {
                        var resultat = numberWithCommas(parseInt(data.result));
                	$( "#"+elem ).append( "<p>"+resultat+"</p>" );
                     
                	
                }
	});
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}