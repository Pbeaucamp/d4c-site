function calculValueFromFiltre(elem, idRes, colonne, colonne_filtre, valeur_filtre, operation) {

	console.log(" hello ");
	$.ajax('/api/calculvaluefiltre', {

		type: 'POST',
        dataType: "json",
        cache: true,
        data : { idRes : idRes, colonne : colonne, colonne_filtre: colonne_filtre,  valeur_filtre: valeur_filtre, operation : operation },
        success: function (data) {
        	$( "#"+elem ).append( "<p>"+data.result+"</p>" );
        	
        }
	});
}