
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

$(document).ready(function(){
	Parse.$ = jQuery; //reassign jQuery, god knows why
	Parse.initialize("oDrVT97pILfNP3PtXnzSwZD0vsgScEGdLmR0ZtBO", "d7fE3uszRBHCai7pLgSmuxEntLaUbIvNG5RKuruA");

	$('#sign-me-up').click(function(){
		if( !validateEmail( $('#email').val() ) ){
			alert("Please enter a valid email address.");
			return;
		} 
		var query = new Parse.Query(Parse.Object.extend("Player"));
		query.equalTo("email", escapeHtml($('#email').val()));
		query.find({
		  	success: function(results) {
		  		if(results.length>0){
		  			// alert('A user already exists with this email.');
		  			deny(results);
		  			return;
		  		}		  			
				makeData();
		  	}
		});
	});
});


function addCode(thisPlayer){
	var email = thisPlayer.get('email');
	var e = email.charAt(0).toUpperCase();
	var secret_code = '';

	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.find({
	  	success: function(results) {
	  		// console.log(results.length);
	  		secret_code = e + pad(results.length.toString(16), 3, 0).toUpperCase();

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

function makeData(){
	var thisPlayer = new Player({
		'first' : capitalizeFirstLetter(escapeHtml($('#first_name').val())),
		'last' : capitalizeFirstLetter(escapeHtml($('#last_name').val())),
		'home' : capitalizeFirstLetter(escapeHtml($('#home').val())),
		'email' : escapeHtml($('#email').val()),
		'home_base' : Math.floor(Math.random() * data.zones.count) + 1,
		'team' : (Math.random()>0.5)?'A':'B'
	});

	console.log(thisPlayer);

	thisPlayer.save({
		success: function() {
			addCode(thisPlayer);
			confirm(thisPlayer);
		},
		error: function(error) {
			alert('Something went wrong, reload the page and try again.');
			console.log(error);
		}
	});

}

function deny(results){
	$('#sign-up-row').addClass('hide');
	$('#deny-row').removeClass('hide');
	$('#deny-row #already').addClass('animated tada');

	$('#deny-row #name').text(results[0].get('first'));
	$('#deny-row #secret_code').text(results[0].get('secret_code'));
	$('#deny-row #email').text(results[0].get('email'));
	$('#deny-row #team').text(results[0].get('team'));
	$('#deny-row #home_base').append(results[0].get('home_base'));
	$('.home-info').append('<a href="'+data.zones.array[results[0].get('home_base')].link+'">'+data.zones.array[results[0].get('home_base')].desc+'</a>')
}

function confirm(thisPlayer){
	$('#sign-up-row').addClass('hide');
	$('#confirm-row').removeClass('hide');
	$('#confirm-row').addClass('animated pulse');

	$('#confirm-row #name').text(thisPlayer.get('first'));
	$('#confirm-row #team').text(thisPlayer.get('team'));
	$('#confirm-row #home_base').append(thisPlayer.get('home_base'));
}

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}