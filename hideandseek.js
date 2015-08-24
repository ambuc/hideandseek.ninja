var Player = Parse.Object.extend("Player", {
	defaults:{
		'first'		: 	null,
		'last'		: 	null,
	    'email'		: 	null,
	    'home'		:   null,
	    'secret_code'	: 	null,
	    'home_base'		: 	null,
	    'team'			: 	null,
	    'kills'		: 	null,
	    'deaths'	: 	null,
	    'kdr'		: 	null,
	    'score'		: 	null,
	}, 
	initialize: function() {
		this.set({
			'kills' : 0,
			'deaths': 1,
			'kdr'	: 0,
			'score' : 0
		});
	}
});

var Find = Parse.Object.extend("Find", {
	defaults:{
		'hider' : null,
		'seeker' : null
	}, 
	initialize: function() {
	}
});

$(document).ready(function(){

	Parse.$ = jQuery; //reassign jQuery, god knows why
	Parse.initialize("oDrVT97pILfNP3PtXnzSwZD0vsgScEGdLmR0ZtBO", "d7fE3uszRBHCai7pLgSmuxEntLaUbIvNG5RKuruA");

	start_materialize();
	template_from_data( data );
	initialize_register();
	initialize_scoring();

});

function start_materialize(){
    $('.materialboxed').materialbox();
	$('.parallax').parallax();
    $(".button-collapse").sideNav();
}

function template_from_data( city ){
	$('.splash-text').html( 
		_.template( $( "#splash_text_template" ).html() ) ( city ) 
	);

	$('.bases-table-text').html( 
		_.template( $( "#bases_table_template" ).html() ) ( city ) 
	);

	$('.map-image').html( 
		_.template( $( "#map_image_template" ).html() ) ( city ) 
	);

	$('.schedule-text').html( 
		_.template( $( "#schedule_text_template" ).html() ) ( city ) 
	);
}

// register

function initialize_register(){
	$('#sign-me-up').click(function(){

		if( $("#agree-checkbox").prop('checked') != true ){
			$("#agree-field").toggleClass('animated shake');
			return;
		} 
		if( !validate_user_email( $('#email').val() ) ){
			alert("Please enter a valid email address.");
			return;
		} 
		var query = new Parse.Query(Parse.Object.extend("Player"));
		query.equalTo("email", escape_html($('#email').val()));
		query.find({
		  	success: function(results) {
		  		if(results.length>0){
		  			show_registration(results[0], true);
						$('#registry-form').remove();
		  			return;
		  		}		  			
				register_user();
		  	}
		});
	});
}

function addCode(thisPlayer){
	var email = thisPlayer.get('email');
	var e = email.charAt(0).toUpperCase();
	var secret_code = '';

	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.find({
	  	success: function(results) {
	  		// console.log(results.length);
	  		secret_code = e + pad_string(results.length.toString(16), 3, 0).toUpperCase();

  			$('#secret_code').html(secret_code);

			thisPlayer.set('secret_code', secret_code);
			thisPlayer.save();
			fireEmail(thisPlayer);
	  	}
	});
}

function fireEmail(thisPlayer){
	var params = { 
		'email' : thisPlayer.get('email'),
		'first' : thisPlayer.get('first'),
		'last' : thisPlayer.get('last'),
		'team' : thisPlayer.get('team'),
		'home_base' : thisPlayer.get('home_base'),
		'secret_code' : thisPlayer.get('secret_code'),
		'when' : data.when,
		'city' : data.where.city,
		'event_link' : data.event_link
	};
	Parse.Cloud.run('fireEmail', params, {
		success: function(msg) {
			console.log(msg);
		// ratings should be 4.5
		},
		error: function(error) {
			console.log(error);
		}
	});
}

function register_user(){
	var thisPlayer = new Player({
		'first' 	: capitalize_first_letter(escape_html($('#first_name').val())),
		'last'  	: capitalize_first_letter(escape_html($('#last_name').val())),
		'home'  	: capitalize_first_letter(escape_html($('#home').val())),
		'email' 	: escape_html($('#email').val()),
		'home_base' : Math.floor(Math.random() * data.zones.count) + 1,
		'team'  	: (Math.random()>0.5)?'A':'B'
	});

	console.log(thisPlayer);

	thisPlayer.save({
		success: function() {
			addCode(thisPlayer);
			show_registration(thisPlayer, false);
			$('#registry-form').remove();
		},
		error: function(error) {
			alert('Something went wrong, reload the page and try again.');
			console.log(error);
		}
	});
}

function show_registration(thisPlayer, isAlreadyRegistered){
	if(isAlreadyRegistered){
		$('.case-already').removeClass('hide');
	} else {
		$('.case-register').removeClass('hide');
	}

	$('#sub-info').removeClass('hide');
	$('#sub-info').addClass('animated pulse');

	$('#sub-info #name').text(thisPlayer.get('first'));
	$('#sub-info #secret_code').text(thisPlayer.get('secret_code'));
	$('#sub-info #email').text(thisPlayer.get('email'));
	$('#sub-info #team').text(thisPlayer.get('team'));
	$('#sub-info #home_base').append(thisPlayer.get('home_base'));

	$('#sub-info .home-info').append('<a href="'+data.zones.array[thisPlayer.get('home_base')].link+'">'+data.zones.array[thisPlayer.get('home_base')].desc+'</a>');

	// $(window).scrollTo($('#sub-info'), 1300, {easing: 'easeOutQuad'});
}

//scoring

function initialize_scoring(){
	var curr_player;
	var counter = 3;
	var codes = [];

	$('#check').click(function(){
		checkIdents($('#my_code').val().toUpperCase(),$('#my_base').val());
	});
}

function checkIdents(code, base){
	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.equalTo("secret_code", code);
	query.find({
		success: function(results){
			console.log(results);
			if(results.length>0){
				if(results[0].get('home_base')==base){
					verifyUser(results[0].get('first'));				
				} else {
					denyUser();
				}
			} else {
				denyUser();
			}
		}
	});
}

function denyUser(){
	$('#sub-scoring-login-icon').html('announcement');
	$('#sub-scoring-login-icon').removeClass('blue-text');
	$('#sub-scoring-login-icon').addClass('red-text animated wobble');

	$('#sub-scoring-login-msg').html("Sorry, we can't seem to log you in. Try again?");
	$('#my_code').val('');
	$('#my_base').val('');

	// alert('no');
}

function verifyUser(first){
	$('#sub-scoring-login-icon').html('face');
	$('#sub-scoring-login-icon').addClass('animated tada');
	$('#sub-scoring-login-icon').toggleClass('blue-text green-text');
	$('#sub-ident').remove();

	$('#sub-scoring-login-msg').html("Welcome back, <b class='green-text'>" + first + "</b>!");

	$('#sub-scoring-entry').removeClass('hide');
	$('#sub-scoring-entry').addClass('animated bounceInRight');
}



//general use functions

function validate_user_email(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function capitalize_first_letter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function escape_html(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

function pad_string(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}








