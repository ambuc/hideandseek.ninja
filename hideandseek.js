$(document).ready(function(){

	$('.splash-text').html( 
		_.template( $( "#splash_text_template" ).html() ) ( data ) 
	);

	$('.bases-table-text').html( 
		_.template( $( "#bases_table_template" ).html() ) ( data ) 
	);

	$('.map-image').html( 
		_.template( $( "#map_image_template" ).html() ) ( data ) 
	);

	$('.schedule-text').html( 
		_.template( $( "#schedule_text_template" ).html() ) ( data ) 
	);

    $('.materialboxed').materialbox();
	$('.parallax').parallax();
    $(".button-collapse").sideNav();

	console.log('nice');


});

