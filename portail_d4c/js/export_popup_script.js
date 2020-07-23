

function fn1() {
	console.log(" jdh ");
}
// create modal element
function createPopupExport(visibilityModalExport) {
	// create modal
	visibilityModalExport.after(`<style>progress {
		    border: 0;
		    height: 30px;
		    border-radius: 20px;
		}
		progress::-webkit-progress-bar {
		    border: 0;
		    height: 40px;
		    border-radius: 30px;
		}
		progress::-webkit-progress-value {
		    border: 0;
		    height: 40px;
		    border-radius: 10px;
		}
		progress::-moz-progress-bar {
		    border: 0;
		    height: 40px;
		    border-radius: 10px;
		}</style>
		<div style="width: 33em; padding: 72px; box-shadow: 5px 10px 8px 10px #888888;" class="modal" data-modal="3">
		 
		      <div class="row">
					<a href="#" id="cancel2" class="js-modal-close-export button" style="float: right;margin-top: -71px;
		    margin-right: -67px; padding: 5px;border: none;
		    background: transparent;">X</a>
			  </div>
		      <div class="modal-body">
		     
		     	<div id="Progress_Status" style=" width: 50%; height: 30px; background-color: #ddd;  border-radius: 20px;"> 
				  <div id="myprogressBar" style="width: 2%;  height: 30px;  border-radius: 20px; background-color: #4CAF50; ">
				  <span style ="position: absolute;margin-top: -20px;margin-left: 20px;" id="download-progress-text"></span></div> 
				</div> 
		 
				<a id="save-file"></a>

				  <!--progress class="progress" id="progress" value="0" style="background-color: #ddd; width: 50%;  height: 20px; border-radius: 25px;"></progress>
				  -->
				<span style ="position: absolute;margin-top: -25px;margin-left: 20px;" id="progress-text"></span>
				
		       
		       <!-- <div id="Progress_Status" style="width: 50%; background-color: #ddd; "> 
		  			<div id="myprogressBar" style=" width: 2%;  height: 20px; background-color: #4CAF50;"></div> 
				</div> -->
		        
		  </div>
		  <div class="overlay js-overlay-modal-export"></div>`) ;



	// displa modal
   	  $("#myModal").css("display","block");
	  let overlay = document.querySelector('.js-overlay-modal-export');
	  let modalElem = document.querySelector('.modal[data-modal="3"]');

	  modalElem.classList.add('active');


	  var overlay3 = document.querySelector('.js-overlay-modal-export');
	  var closeButtons3 = document.querySelectorAll('.js-modal-close-export');

	  // close button event  when end of export
	  closeButtons3.forEach(function (item) {

	        item.addEventListener('click', function (e) {
	            var parentModal = this.closest('.modal');

	            parentModal.classList.remove('active');
	            overlay3.classList.remove('active');
	            var element = document.getElementById("myprogressBar"); 
	            element.style.width = '1%';
				
				
	        });

	    }); // end foreach

  		document.getElementById("progress-text").innerHTML = "1%";


}



// update progress bar value 
function updateProgressBarValue() {
	// get progress text element
	var progressText = document.getElementById("progress-text");
	// get progress bar element
    var element = document.getElementById("myprogressBar");    
            
			  var width = 1; 
			  var identity = setInterval(scene, 10); 
			  console.log(identity);

			  function scene() { 
			    if (width >= 100) { 
			      clearInterval(identity); 
			    } else { 
			      width++;  
			      // change progress bar width
			      element.style.width = width + '%';

			      //change progress text value  
			      progressText.innerHTML = width + "%";
			    } 
} 

}
