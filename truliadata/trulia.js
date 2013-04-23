var phantom = require('phantom');
var fs= require('fs');
var url = require('url');
var query = require('querystring');
var DOMParser = require('xmldom').DOMParser;

var homes = [] ;
var link = ['http://www.trulia.com/CA/Redwood_City/',
			'http://www.trulia.com/for_sale/Redwood_City,CA/2_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/3_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/4_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/5_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/6_p',	
			'http://www.trulia.com/for_sale/Redwood_City,CA/7_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/8_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/9_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/10_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/11_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/12_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/13_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/14_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/15_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/16_p',
			'http://www.trulia.com/for_sale/Redwood_City,CA/17_p'] ;
			

var i;

scrape(0);
function scrape(index)
{
	phantom.create(function(ph) {
	  		return ph.createPage(function(page) {
			    return page.open(link[index],function(status) {
			    		console.log("Opened " + link[index] + " "  + status);
			 				setTimeout(function() {
							    return page.evaluate(extract, function(result){
							    	writeResult(ph,result,index);
							    });
							}, 4000);
			        });
			    });
	});
}

function extract(){
	var arr=[];
	$('li[class="hover propertyCard property-data-elem "]').each(function(index,element){
		console.log($(this).attr('data-list-index'));
		var img = this.querySelector('a.propertyImageLink img').getAttribute('src');
		if (!img)
			img =this.querySelector('a.propertyImageLink img').getAttribute('data-lazy-src'); 
		console.log(img);

		var street = this.querySelector('h2.propertyCardHeading a.primaryLink strong').innerHTML;
		var locality = this.querySelector('div.mvn div.cols7 strong').innerHTML ;
		var lastline = this.querySelector('div.mvn div.cols7 div').innerHTML ;
		var type,area;
		try{
			type = this.querySelectorAll('div.mvn div.cols7 strong').item(1).innerHTML ;
			console.log(type);
		}
		catch(err){
			console.log('no type');
			type='';
		}
		try{
			area = this.querySelectorAll('div.mvn div.cols7 div').item(1).innerHTML ;
			console.log(area);
		}catch(err){
			console.log('no area');
			area='';
		}

		console.log(street);
		console.log(locality);
		console.log(lastline);
		var city='',state='',zip='' ;

		try{
			var tokens = lastline.split(',');
			city = tokens[0];
			var temp = tokens[1].split(' ');
			state = temp[1];
			zip = temp[2];
		}catch(err){

		}
		var home = {street:street,locality:locality,city:city,state:state,zip:zip,type:type,area:area,img:img};
		arr.push (home);
	});
	return arr ;

}

function writeResult (ph,result,index){
	homes = homes.concat(result);
	ph.exit();
	console.log('finished ' + link[index]);
	console.log(result);	
	if ( index < link.length){
		scrape(index+1);
	}else{
		
		console.log(homes);
		fs.writeFile( "homes.json",JSON.stringify(homes),function(){
			console.log("complete writing to file");
		});
	}
}
