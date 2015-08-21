var counter = 3;
var codes = [];

$(document).ready(function(){
	Parse.$ = jQuery; //reassign jQuery, god knows why
	Parse.initialize("oDrVT97pILfNP3PtXnzSwZD0vsgScEGdLmR0ZtBO", "d7fE3uszRBHCai7pLgSmuxEntLaUbIvNG5RKuruA");


	$('#addfields').click(function(){
		console.log('adding fields');
		addFields(6);
	});

	$('#check').click(function(){
		checkIdents($('#my_code').val().toUpperCase(),$('#my_base').val());
	})

	$('.fields-row input').keyup(function(){
		checkCode($(this));
	});

	$('.fields-row .field').keydown(function(){
		checkLast($(this));
	});

	loadCodes();

});

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

function checkLast(foo){
	if(_.isUndefined(foo.next()[0])){
		addFields(1);
	}
	$('.fields-row .field').unbind();
	$('.fields-row .field').keydown(function(){
		checkLast($(this));
	});
}

function checkCode(foo){
	if(foo.val().length!=4){return;}
	var val = foo.val().toUpperCase();
	var id = foo.parent().attr('data-id');


	foo.parent().children('i').remove();
	if( _.indexOf(codes, val) != -1){
		$("<i class='material-icons green-text prefix animated rubberBand'> thumb_up </i>").insertBefore(foo);
	} else {
		$("<i class='material-icons red-text prefix animated shake'> thumb_down </i>").insertBefore(foo);
	}
}


function addFields(num){
	$('.fields').append('<div class="field input-field"> <input class="green-text find" placeholder="Code #'+counter+'" maxlength=4 type="text" class="validate"> </div>');
	counter++;
	$('.fields-row input').unbind();
	$('.fields-row input').keyup(function(){
		checkCode($(this));
	});
}

function checkIdents(code, base){
	// code = code.toUpperCase();
	console.log(code);
	console.log(base);
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
	$('#error-col').removeClass('hide');
	$('#error-col #verify').html("<i class='material-icons medium green-text animated zoomIn'>done</i>");
	$('#error-col #msg').html('<p class="flow-text">Welcome back, <b>'+name+'</b>.</p>');

	$('.fields-row').removeClass('hide');
	$('#error-col #verify').addClass('animated tada');
	$('.user-row').addClass('hide');
}

function denyUser(){
	$('#error-col').removeClass('hide');
	$('#error-col #msg').html('<p class="flow-text">Either your <b>secret code</b> or <b>home base</b> are wrong, please try again.</p>');
	$('#error-col #verify').html("<i class='material-icons red-text medium animated zoomIn'>close</i>");
}
