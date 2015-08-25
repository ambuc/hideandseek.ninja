var Player = Parse.Object.extend("Player", {
	defaults:{
		'first'		: 	null,
		'last'		: 	null,
	    'email'		: 	null,
	    'home'		:   null,
	    'secret_code'	: 	null,
	    'home_base'		: 	null,
	    'team'			: 	null
	}, 
	initialize: function() {
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

	template_from_data( data );
	start_materialize();

	// tabs

	var current_tab = "#section-score";
	initialize_tabs();
	go_to_tab(current_tab, false);

	initialize_footer();
	initialize_register();
	initialize_scoring();

});

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

function start_materialize(){
    $('.materialboxed').materialbox();
	$('.parallax').parallax();
    $(".button-collapse").sideNav();
}

// tabs

function initialize_tabs(){
	$('ul#row-tabs li a').click(function(){
		go_to_tab($(this).attr('data-href'));
	});

	$('#signmeup').click(function(){
		go_to_tab('#section-register');
	});
}

function go_to_tab(tab, isScroll){
   if (typeof(isScroll)==='undefined') { isScroll = true; }

	$('section').addClass('hide');
	$(tab).removeClass('hide');

	if(isScroll){
		$(tab).find('h1').next().next().scrollintoview({
		    duration: 1700,
		    direction: "vertical"
		});		
	}
}

function initialize_footer(){
	var cities = ["sydney", "tokyo", "amsterdam", "london", "paris", "madrid", "nyc", "chicago", "stockholm", "copenhagen", "berlin", "sanfrancisco", "shanghai", "beijing", "istanbul", "mumbai", "cairo", "seoul", "bangkok", "tehran", "baghdad", "pyongyang"];

    window.setInterval( function(){
	    $("#cycle_city").fadeOut( 500, function(){
		    $("#cycle_city").html(_.sample(cities));
		    $("#cycle_city").fadeIn();    	
	    });
    }, 2400 );
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

function add_code(thisPlayer){
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
			fire_email(thisPlayer);
	  	}
	});
}

function fire_email(thisPlayer){
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
			// console.log(msg);
		// ratings should be 4.5
		},
		error: function(error) {
			// console.log(error);
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

	// console.log(thisPlayer);

	thisPlayer.save({
		success: function() {
			add_code(thisPlayer);
			show_registration(thisPlayer, false);
			$('#registry-form').remove();
		},
		error: function(error) {
			alert('Something went wrong, reload the page and try again.');
			// console.log(error);
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

	$('#check').click(function(){
		$('#i-scoring-login-icon').removeClass('animaed wobble');
		check_idents($('#my_code').val().toUpperCase(),$('#my_base').val());
	});

	$('#add-fields').click(function(){
		addField(2);
	});

}

function check_idents(code, base){
	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.equalTo("secret_code", code);
	query.find({
		success: function(results){
			// console.log(results);
			if(results.length>0){
				if(results[0].get('home_base')==base){
					verify_user(results[0]);				
				} else {
					deny_user();
				}
			} else {
				deny_user();
			}
		}
	});
}

function deny_user(){
	$('#i-scoring-login-icon').html('announcement');
	$('#i-scoring-login-icon').removeClass('blue-text');
	$('#i-scoring-login-icon').addClass('red-text animated wobble');

	$('#h4-scoring-login-msg').html("Sorry, we can't seem to log you in. Try again?");
	$('#my_code').val('');
	$('#my_base').val('');

	// alert('no');
}

function verify_user(thisPlayer){

	$('#col-scoring-instructions h4').prepend("<small>Welcome back, <b class='green-text'>" + thisPlayer.get('first') + "</b>! ("+thisPlayer.get('secret_code')+")</small><br/>");

	$('#row-scoring-login').slideUp("normal", function() { 
		$(this).remove(); 
	} );

	$('#row-scoring-entry').removeClass('hide');
	$('#row-scoring-entry').addClass('animated fadeInUp');
}

function addField(n){
	for(var i = 0; i < n; i++){
		$('.fields').append("<div class='field input-field'> <input class='find' placeholder='secret code' maxlength=4 type='text' class='validate'> </div>");
		$('.fields-row input').unbind();
		$('.fields-row input').keyup(function(){
			checkCode($(this));
		});
	}
}

function loadCodes(){
	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.find({
		success: function(results){
			var codes = _.map(results, function(res){return res.get('secret_code')});
		},
		error: function(bar){
			alert('Please reload the page, something went wrong');
		}
	});
}



//general

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

	






//todo
// shouldn't be able to find yourself
// shouldn't be able to add duplicates
// scores need to auto-update

// add rankings page

// function checkCode(foo){
// 	if(foo.val().length!=4){return;}
// 	var val = foo.val().toUpperCase();
// 	var id = foo.parent().attr('data-id');

// 	foo.parent().children('i').remove();
// 	if( _.indexOf(codes, val) != -1){
// 		foo.attr('data-valid', 'true');
// 		$("<i class='material-icons green-text prefix animated rubberBand'> thumb_up </i>").insertBefore(foo);
// 	} else {
// 		foo.attr('data-valid', 'false');
// 		$("<i class='material-icons orange-text prefix animated shake badcode'> thumb_down </i>").insertBefore(foo);
// 	}

// 	$("i.badcode").unbind();
// 	$("i.badcode").mouseover(function(){
// 		$(this).html('remove_circle_underline');
// 		$(this).toggleClass('red-text orange-text');
// 	});
// 	$("i.badcode").mouseout(function(){
// 		$(this).html('thumb_down');
// 		$(this).toggleClass('red-text orange-text');
// 	});
// 	$("i.badcode").click(function(){
// 		$(this).parent().remove();
// 	});
// }

// function checkLast(foo){
// 	if(_.isUndefined(foo.next()[0])){
// 		add_field(1);
// 	}
// 	$('.fields-row .field').unbind();
// 	$('.fields-row .field').keydown(function(){
// 		checkLast($(this));
// 	});
// }

// //PHASE 3

// function pushFinds(){
// 	goodcodes = getGoodCodes();

// 	//push each find
// 	var seeker = $('#my_code').val().toUpperCase();
// 	for(var i = 0; i < goodcodes.length; i++){

// 		pushFind( seeker, goodcodes[i] );
// 		addKill();
// 		addDeath( goodcodes[i] );
// 	}
// }

// function addKill(){
// 	player.set('kills', player.get('kills')+1);
// 	player.save();
// }

// function addDeath(code){
// 	var query = new Parse.Query(Parse.Object.extend("Player"));
// 	query.equalTo("secret_code", code );
// 	query.find({
// 	  	success: function(results) {
// 	  		var player = results[0];
// 			player.set('deaths', player.get('deaths')+1);
// 			player.save();
// 	  	}
// 	});
// }

// function pushFind(seeker, hider){
// 	var newFind = new Find({
// 		'seeker' : seeker,
// 		'hider' : hider
// 	});

// 	console.log(newFind);

// 	newFind.save({
// 		success: function() {
// 			console.log('saved successfully');
// 		},
// 		error: function(error) {
// 			console.log(error);
// 		}
// 	});
// }

// function getGoodCodes(){
// 	var trues = $('.find[data-valid=true]');

// 	var goodcodes = [];

// 	for(var i = 0; i < trues.length; i++){
// 		goodcodes.push($(trues[i]).val().toUpperCase());
// 	}

// 	return goodcodes;
// }

// //PHASE 4

// function displayStats(){
// 	$('.fields-row').addClass('hide');
// 	$('.stats-row').removeClass('hide');
// 	getStats();
// }

// function getStats(){
// 	$('.deaths').html(player.get('deaths'));
// 	$('.kills').html(player.get('kills'));
// 	$('.score').html(player.get('score'));
// }







