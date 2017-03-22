var superagent = require( 'superagent' );

superagent.agent()
	.get("http://10.10.1.183:808/base/test")
	.send({})
	.end(function(rs){
		console.log(rs);
	});