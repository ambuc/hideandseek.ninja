//todo
// shouldn't be able to find yourself
// shouldn't be able to add duplicates
// scores need to auto-update

// add rankings page

var player;

var Find = Parse.Object.extend("Find", {
	defaults:{
		'hider' : null,
		'seeker' : null
	}, 
	initialize: function() {
	}
});

var counter = 3;
var codes = [];

$(document).ready(function(){
	//GENERAL
	Parse.$ = jQuery; //reassign jQuery, god knows why
	Parse.initialize("oDrVT97pILfNP3PtXnzSwZD0vsgScEGdLmR0ZtBO", "d7fE3uszRBHCai7pLgSmuxEntLaUbIvNG5RKuruA");
	loadCodes();

	// PHASE 1
	$("#my_code").focus();

	$('#check').click(function(){
		checkIdents($('#my_code').val().toUpperCase(),$('#my_base').val());
	})

	//PHASE 2

	$('.fields-row input').keyup(function(){
		checkCode($(this));
	});

	$('.fields-row .field').keydown(function(){
		checkLast($(this));
	});

	$('#submit-fields').click(function(){
		pushFinds();
		displayStats();
	});

	//PHASE 3

	// verifyUser('test');
});

//PHASE 1

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

function verifyUser(name){
	getPlayer($('#my_code').val().toUpperCase());

	$('#error-col').removeClass('hide');
	$('.fields-row').removeClass('hide');
	$('#error-col').addClass('animated tada');
	$('.user-row').addClass('hide');

	$('#error-col #verify').html("<i class='material-icons medium green-text animated zoomIn'>done</i>");
	$('#error-col #msg').html('<h5>Welcome back, <b>'+name+'</b>.</h5>');
}

function denyUser(){
	$('#error-col').removeClass('hide');
	$('#error-col').addClass('animated shake');

	$('#error-col #verify').html("<i class='material-icons red-text medium animated zoomIn'>close</i>");
	$('#error-col #msg').html('<h5>Either your <b>secret code</b> or <b>home base</b> are wrong, please try again.</h5>');
}

function getPlayer(code){
	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.equalTo("secret_code", code );
	query.find({
	  	success: function(results) {
	  		player = results[0];
	  		console.log(player);
	  	}
	});
}

//PHASE 2

function add_field(num){
	$('.fields').append('<div class="field input-field"> <input class="find" placeholder="etc." maxlength=4 type="text" class="validate" style="text-transform:uppercase; font-size:x-large;"> </div>');
	counter++;
	$('.fields-row input').unbind();
	$('.fields-row input').keyup(function(){
		checkCode($(this));
	});
}

function checkCode(foo){
	if(foo.val().length!=4){return;}
	var val = foo.val().toUpperCase();
	var id = foo.parent().attr('data-id');

	foo.parent().children('i').remove();
	if( _.indexOf(codes, val) != -1){
		foo.attr('data-valid', 'true');
		$("<i class='material-icons green-text prefix animated rubberBand'> thumb_up </i>").insertBefore(foo);
	} else {
		foo.attr('data-valid', 'false');
		$("<i class='material-icons orange-text prefix animated shake badcode'> thumb_down </i>").insertBefore(foo);
	}

	$("i.badcode").unbind();
	$("i.badcode").mouseover(function(){
		$(this).html('remove_circle_underline');
		$(this).toggleClass('red-text orange-text');
	});
	$("i.badcode").mouseout(function(){
		$(this).html('thumb_down');
		$(this).toggleClass('red-text orange-text');
	});
	$("i.badcode").click(function(){
		$(this).parent().remove();
	});
}

function checkLast(foo){
	if(_.isUndefined(foo.next()[0])){
		add_field(1);
	}
	$('.fields-row .field').unbind();
	$('.fields-row .field').keydown(function(){
		checkLast($(this));
	});
}

//PHASE 3

function pushFinds(){
	goodcodes = getGoodCodes();

	//push each find
	var seeker = $('#my_code').val().toUpperCase();
	for(var i = 0; i < goodcodes.length; i++){

		pushFind( seeker, goodcodes[i] );
		addKill();
		addDeath( goodcodes[i] );
	}
}

function addKill(){
	player.set('kills', player.get('kills')+1);
	player.save();
}

function addDeath(code){
	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.equalTo("secret_code", code );
	query.find({
	  	success: function(results) {
	  		var player = results[0];
			player.set('deaths', player.get('deaths')+1);
			player.save();
	  	}
	});
}

function pushFind(seeker, hider){
	var newFind = new Find({
		'seeker' : seeker,
		'hider' : hider
	});

	console.log(newFind);

	newFind.save({
		success: function() {
			console.log('saved successfully');
		},
		error: function(error) {
			console.log(error);
		}
	});
}

function getGoodCodes(){
	var trues = $('.find[data-valid=true]');

	var goodcodes = [];

	for(var i = 0; i < trues.length; i++){
		goodcodes.push($(trues[i]).val().toUpperCase());
	}

	return goodcodes;
}

//PHASE 4

function displayStats(){
	$('.fields-row').addClass('hide');
	$('.stats-row').removeClass('hide');
	getStats();
}

function getStats(){
	$('.deaths').html(player.get('deaths'));
	$('.kills').html(player.get('kills'));
	$('.score').html(player.get('score'));
}


//GENERAL

function loadCodes(){
	var query = new Parse.Query(Parse.Object.extend("Player"));
	query.find({
		success: function(results){
			console.log(results);
			codes = _.map(results, function(res){return res.get('secret_code')});
			console.log(codes);
		},
		error: function(bar){
			alert('Please reload the page, something went wrong');
		}
	});
}







