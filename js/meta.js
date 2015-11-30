window.onload = function() {
	var blm_input_elem = document.getElementById('blm_location_input');
	if(!blm_input_elem){return;}
        blm_input_elem.addEventListener("keypress", function(e){
                if(e.keyCode==13){
                        blm_geocode();
                        e.preventDefault();
                        return false;
                }
        });
        blm_input_elem.addEventListener("keyup", function(e){
                if(e.keyCode==13){
                        blm_geocode();
                        e.preventDefault();
                        return false;
                }
        });
}//onload

//initialize google geocoder
var blm_g = null;
if(typeof(google) != "undefined"){
	blm_g = new google.maps.Geocoder();
}

//call geocode search
function blm_geocode(){

        //get value
        var blm_location_input = document.getElementById('blm_location_input').value;
        if(!blm_location_input){return;}

        //get address json results
        blm_g.geocode( { 'address': blm_location_input}, function(blm_g_results, blm_g_status) {

                var blm_results_display = "";

                if (blm_g_status == google.maps.GeocoderStatus.OK) {
                        //calculate results length
                        var blm_results_limit = 5;

                        //iterate through results
                        if(blm_g_results.length>0){
                                var blm_results_count = 0;
                                var blm_i = 0;

                                //confirm that the next json result is defined and blm_results_count under limit
                                while(blm_g_results[blm_i] !== undefined && blm_results_count<blm_results_limit){
                                        //confirm that the result is a street address
                                        //if(blm_g_results[blm_i].types[0]=='street_address'){
						blm_g_results[blm_i].geometry.location.lat = blm_g_results[blm_i].geometry.location.lat;
						blm_g_results[blm_i].geometry.location.lng = blm_g_results[blm_i].geometry.location.lng;
						var jsonString = JSON.stringify(blm_g_results[blm_i]);
                                                blm_result_value = btoa(jsonString);

                                                //add result item to list
                                                blm_results_display += "<li><input type=\"hidden\" value=\""+blm_result_value+"\" id=\"blm_result_select_"+blm_i+"\" /><a href=\"javascript:;\" onClick=\"blm_replace_input('"+blm_i+"');\">"+blm_g_results[blm_i].formatted_address+"</a></li>";

                                                //increment count
                                                blm_results_count++;
                                        //}
                                        //increment iteration
                                        blm_i++;
                                }

                        }

                }

                //show results
                document.getElementById('blm_location_results').setAttribute('data-display', 1);

                //check if results are found
                if(blm_results_display){
                        blm_results_display = "<ul>"+blm_results_display+"</ul>";
                }else{
                        blm_results_display = "<p>No locations found</p>";
                }

                //throw results into html
                document.getElementById('blm_location_results').innerHTML = blm_results_display;
        });

}//blm_geocode

//on click of a location result, put it in the input
function blm_replace_input(blm_result_select_id){

        //Select location
        blm_result = JSON.parse(atob(document.getElementById("blm_result_select_"+blm_result_select_id).value));

        //construct address components
	blm_ac_display = '';
        blm_ac = {
                street_number: '',
                route: '',
                locality: '',
                administrative_area_level_3: '',
                administrative_area_level_2: '',
                administrative_area_level_1: '',
                administrative_area_level_1_abbr: '',
                postal_code: '',
                country: '',
                country_abbr: ''
        };

        //loop through address components of selected address
        for(i = 0; i<blm_result.address_components.length; i++){

		//Get address component type
                blm_ac_type = blm_result.address_components[i].types;
                if(!blm_ac_type) continue;

		//Form HTML
		blm_ac_type_display = blm_ac_type[0].charAt(0).toUpperCase() +  blm_ac_type[0].replace(/_/g, ' ').substr(1);
                blm_ac[blm_ac_type[0]] = blm_result.address_components[i].long_name;
		blm_ac_display += '<li><strong>'+blm_ac_type_display+':</strong> '+blm_ac[blm_ac_type[0]]+'</li>';

		//Handle HTML for abbreviations
                if(blm_ac_type[0]=="administrative_area_level_1" || blm_ac_type[0]=="country"){
                        blm_ac[blm_ac_type[0]+'_abbr'] = blm_result.address_components[i].short_name;
			blm_ac_display += '<li><strong>'+blm_ac_type_display+' abbr:</strong> '+blm_ac[blm_ac_type[0]+'_abbr']+'</li>';
                }

        }

        blm_ac = btoa(JSON.stringify(blm_ac));
        var blm_location = blm_result.geometry.location;
        var blm_latitude = blm_location[Object.keys(blm_location)[0]];
        var blm_longitude = blm_location[Object.keys(blm_location)[1]];

        //change location details to be saved and selected location title
        document.getElementById("blm_location_choice_value").innerHTML = blm_result.formatted_address;
        document.getElementById("blm_formatted_address").value = encodeURI(blm_result.formatted_address);
        document.getElementById("blm_address_components").value =  blm_ac;
        document.getElementById("blm_latitude").value = blm_latitude;
        document.getElementById("blm_longitude").value = blm_longitude;
        document.getElementById("blm_location_results").setAttribute('data-display', 0);
	document.getElementById("blm_location_choice").setAttribute('data-display', 1);
	document.getElementById("blm_location_choice_components").innerHTML = '<ul>'+blm_ac_display+'</ul>';

}//blm_replace_input

//clear currently selected location
function blm_clear_location(){
        document.getElementById("blm_location_choice_value").innerHTML = '';
        document.getElementById("blm_formatted_address").value = '';
        document.getElementById("blm_address_components").value =  '';
        document.getElementById("blm_latitude").value = '';
        document.getElementById("blm_longitude").value = '';
	document.getElementById("blm_location_choice").setAttribute('data-display', 0);
}blm_clear_location

//show or hide the location details
function blm_location_details_change(blm_details_request){

	if(blm_details_request){
		blm_details_request = 'block';
		blm_details_text = 'Hide details';
	}else{
		blm_details_request = 'none';
		blm_details_text = 'Show details';
	}

	document.getElementById('blm_location_choice_components').style.display = blm_details_request;
	document.getElementById('blm_location_details').setAttribute('onClick', 'blm_location_details_change('+(!blm_details_request)+')');
	document.getElementById('blm_location_details').innerHTML = blm_details_text;

}//blm_location_details_change
