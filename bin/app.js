'use strict'
// =================================================================
// get the packages we need ========================================
// =================================================================
const express 	= require('express')
, app         = express()
, bodyParser  = require('body-parser')
, multer = require('multer')() 
, morgan      = require('morgan')
, to = require('await-to-js').to
, chalk = require('chalk')
, dotenv = require('dotenv')
, fse = require('fs-extra')
, path = require('path')
, passport = require('passport')
// , JwtStrategy = require('passport-jwt').Strategy
// , ExtractJwt = require('passport-jwt').ExtractJwt
// , expressValidator = require('express-validator')
// , expressStatusMonitor = require('express-status-monitor')
, cors = require('cors')
, expressip = require('express-ip')
, session = require('express-session')

// =================================================================
// Other modules ===================================================
// =================================================================
const csystem = require(__dirname+'/../apps/csystem').csystem
const csErroHandler = require(__dirname+'/../apps/csystem').csErrors


const passportConfig = require(__dirname+'/../apps/csystem').passportConfig
let opts = {}

// =================================================================
// configuration ===================================================
// =================================================================
if (fse.existsSync('.env'))
	dotenv.load({ path: __dirname+'/../env' });
else
  dotenv.load({ path: __dirname+'/../env.example' });

app.set('port', process.env.PORT || 3000);
app.set('superSecret', process.env.JWT_SECRET); // secret variable
app.set('env', process.env.ENV); 

app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.JWT_SECRET,
	cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  }));

// use morgan to log requests to the console
app.use(morgan('combined'));
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer.array());
// app.use(formData.parse());
// app.use(formData.union());
//cross-origin, not needed now
app.use(cors())

app.use(expressip().getIpInfoMiddleware);

app.use(passport.initialize());		
app.use(passport.session());

{
	let routes = {};
	console.log("Loading routes...")

  	/*
	 * read all folders in ../routes
	 * 		go to their models folders and load all the models
	 */
	fse
	.readdirSync(__dirname+"/../routes")
	.forEach((folda)=>{
		let routeFilePath = path.join(__dirname,"/../routes", folda)
		fse
		.readdirSync(routeFilePath)
		.filter((file) =>
			// all js files in folder
			file.split(".")[file.split(".").length-1] === "js"
		)
		.forEach((file)=>{
			let routename = file.split(".")[0];
            console.log("%s %s %s", chalk.green('✓'), chalk.green('✓'), routename);	
            routeFilePath = path.join(routeFilePath, file);
            routes[routename] = routeFilePath;
            new (require(routeFilePath)) (app)
		})
		
		
	})
}


// =================================================================
// Routes ==========================================================
// =================================================================

/**
 * 404
 */
app.route('*')
.get( function(req, res){
  csErroHandler.error404(req, res)
  //res.render('404');
})
.post( function(req, res){
// res.status(404);
  //res.send('what???');
  csErroHandler.error404(req, res)
});

/**
 * Error Handler
 */
app.use(function(err, req, res, next) {
  csErroHandler.error500(req, res, err, function(err){
    next(err);
  });
  
});


// =================================================================
// start the server ================================================
// =================================================================
let start_server = async () => {
  let csystem_ = new csystem
  let [err, care, dontcare] = [];
  [err, dontcare] = await to(csystem_.dbSync(false));
  if(err) {
    console.log(`Db error: ${err}`)
    process.exit(1);
  }
  /**
   * Start Express server.
   */
  app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
    console.log('  Press CTRL-C to stop\n');
  });
}

start_server();
