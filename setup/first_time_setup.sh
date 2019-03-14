#!/bin/bash
#
# File:     first_time_setup.sh
# Author:   Brian Onang'o
# Company:	Csyber Systems
# Website:  http://csymapp.cseco.co.ke
# E-mail:   brian@cseco.co.ke, surgbc@gmail.com
# Created:	Jan 2018
#
# Description
#
# This script is used when installing CSYMAPP for the first time 
#


configureEnv?() {
	nano ../.env
}

editFile?() {
	nano $1
}

overwriteEnv?() {
	cp ../.env.example ../.env
	askYesNoQuestion "Would you like to configure .env file now? y/n" editFile? "../.env"
}

replaceFolders?() {
	echo "Setting up directories"
		echo -n "config"
			mkdir -p ../config
		echo "...done"
		echo -n "views"
			mkdir -p ../views
		echo "..done"
		echo -n "public"
			mkdir -p ../public/apps
		echo "..done"
		echo -n "routes"
			mkdir -p ../routes
		echo "..done"
}

replaceConfig?() {
	echo "copying system files"
		mkdir -p ../config
		echo -n "config"
			cp config/config.system.js.example ../config/config.system.js
		echo "..done"
		echo -n "passport config"
			cp config/config.passport.js.example ../config/config.passport.js
		echo "..done"
		askYesNoQuestion "Would you like to edit system config now? y/n" editFile? "../config/config.system.js"
		askYesNoQuestion "Would you like to edit passport config now? y/n" editFile? "../config/config.passport.js"

}

replaceDatabases?() {
	tput bold;  echo "Mr. Brian: I am now creating databases for you. I hope you remembered to use underscore_to_separate_words in your .env file "; tput sgr0
	#does not work for remote addresses
	[[ $WHICHDATABASE = 'mysql' ]] && {
		[[ $ENV = 'dev' ]] && { 
			mysql -h "$MYSQLDB_HOST_DEV" -u $MYSQLDB_USER_DEV -p"$MYSQLDB_PASS_DEV" -e "DROP DATABASE $MYSQLDB_DBNAME_DEV; CREATE DATABASE IF NOT EXISTS $MYSQLDB_DBNAME_DEV"
			mysql -h "$MYSQLDB_HOST_DEV" -u $MYSQLDB_USER_DEV -p"$MYSQLDB_PASS_DEV" -e "CREATE DATABASE IF NOT EXISTS $MYSQLDB_DBNAME_DEV"
			tput setaf 2;  echo "Mr. Brian has created $MYSQLDB_DBNAME_DEV for you"; tput sgr0 

		} || { 
			mysql -h "$MYSQLDB_HOST" -u $MYSQLDB_USER -p"$MYSQLDB_PASS" -e "DROP DATABASE $MYSQLDB_DBNAME; CREATE DATABASE IF NOT EXISTS $MYSQLDB_DBNAME"
			mysql -h "$MYSQLDB_HOST" -u $MYSQLDB_USER -p"$MYSQLDB_PASS" -e "CREATE DATABASE IF NOT EXISTS $MYSQLDB_DBNAME"
 			tput setaf 2;  echo "Mr. Brian has created $MYSQLDB_DBNAME for you"; tput sgr0 
		}
	}
}

#
# ask a Yes/No question
# usage: askYesNoQuestion "question" function_to_run_if_answer_is_yes
# valid answers are Yes/No. askYesNoQuestion will loop until it gets valid answer
# 
askYesNoQuestion() {
	user=$(whoami)
	tput bold;  echo -n "Mr. Brian: "; tput sgr0
	echo "$1"
	# tput rev;   echo "Mr. Brian: $1";   tput sgr0
	tput bold;  echo -n "$user: "; tput sgr0
	read ans
	case "$ans" in
		[yY] | [yY][Ee][Ss] )
			tput setaf 2;  echo "Mr. Brian will now take you to $2"; tput sgr0
			$2 $3
			;;
		[nN] | [nN][Oo] )
			tput setaf 4;  echo "Mr. Brian will NOT take you to $2"; tput sgr0

			;;
		*)
			tput bold;  echo -n "Mr. Brian: ";    tput sgr0
			tput setaf 1;  echo "Please follow instructions. I will give you another chance to try again."; tput sgr0
			askYesNoQuestion "$1" $2
	esac
}

readConfig () {
	set -a 
	source ../.env
	set +a 
}

installNode? () {
	{
		. ~/.nvm/nvm.sh
		nvm install $1
		nvm use $1 #seems to fail
		sudo mv  /usr/bin/node /usr/bin/node.bac 
		sudo mv  /usr/bin/nodejs /usr/bin/nodejs.bac 
		sudo ln -s   $(which node) /usr/bin/node  
		sudo ln -s   $(which node) /usr/bin/nodejs 
		tput setaf 2;  echo -e "✓ Node v$1 installed"; tput sgr0
	} || {
		{

			curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh |  sudo NVM_DIR=/usr/local/nvm bash
			#=> Close and reopen your terminal to start using nvm or run the following to use it now:
			export NVM_DIR="/usr/local/nvm"
			[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
			[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
			source ~/.nvm/nvm.sh
			nvm install $1
			. nvm use $1
			sudo mv  /usr/bin/node /usr/bin/node.bac 
			sudo mv  /usr/bin/nodejs /usr/bin/nodejs.bac 
			sudo ln -s   $(which node) /usr/bin/node  
			sudo ln -s   $(which node) /usr/bin/nodejs 
			tput setaf 2;  echo -e "✓ Node v$1 installed"; tput sgr0
		} || {
			tput setaf 1;  echo -e "✗ Mr. Brian has tried his best to install node v$1 but has failed. You will have to do this manually"; tput sgr0
		}
	}
	

}

installYarn? () {
	echo " Installing yarn"
	curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
	echo "deb http://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
	sudo apt-get update && sudo apt-get install yarn


}

#
# check a dependency in /usr/bin/
# checkDependency dependency function_to_install_dependency required_version
checkDependency? () {
	{

		{
			which $1 >> /dev/null
		}  && {
			nodeVersion=$("/usr/bin/$1" -v |head -2 |tail -2 | head -1| rev | cut -d v -f 1 | rev )
			[[ "$3" = "$(printf "$3\n$nodeVersion\n" | sort -g | head -1)" ]] && {
				tput setaf 2;  echo -e "✓ Right version of $1 is installed"; tput sgr0
			} || {
				askYesNoQuestion "Your $1 version ($nodeVersion) is not the required version ($3). Would you like to install version $3 now?" $2 $3
			}		
		} || {
			askYesNoQuestion "You don't seem to have $1 installed. Would you like to install it now?" $2 $3
		}
	}
}

setupDefaultUsers? () {
	# cd ./setup
	echo $PWD
	SETUP=ANYTHING node first_time_setup.js
}

createService() {
	rootDir=$(pwd)
	cd ../
	cd install
	sudo cp -r lib/ /
	sudo systemctl daemon-reload
	sudo systemctl enable csymapp-main.service
	sudo systemctl start csymapp-main.service
	cd "$rootDir"
	cd ../
	THISLOCATION=$pwd
	if [ "$THISLOCATION" = '/var/www/html/csymapp-main' ]; then
		echo "I will do nothing to the location of you files"
	else
		echo "Please wait a while as I change the location of your files..."
		mkdir -p /var/www/html/csymapp-main
		sudo cp -rf "./." /var/www/html/csymapp-main/
	fi
	cd "$rootDir"
}
################################################################################
# Main
################################################################################
#dependencies
NODE_VERSION=8.9.4
YARN_VERSION=0.0.1

main() {
	setUpDir=$(pwd)
	echo "Hello there. Greetings from Mr. Brian"
	echo "Mr. Brian will now install the system for you and set up an admin user for you."
	echo "This will be very interactive. So please stay around"

	#check for right version of node, yarn, etc
	checkDependency? node installNode? $NODE_VERSION
	checkDependency? yarn installYarn? $YARN_VERSION
	#Overwrite environment variables (in .env)
	askYesNoQuestion "Would you like to overwrite environment variables Y(es)/N(o)? Please answer Yes if this is the first time you are doing this setup." "overwriteEnv?"
	
	#Overwrite apps folders
	askYesNoQuestion "Would you like to overwrite apps folders? This will overwrite any changes you have made yourself. Please answer Y(es) or N(o)" "replaceFolders?"
	
	#Overwrite existing configurations
	askYesNoQuestion "Would you like to replace config file? You will have to make the configurations again. Please answer Y(es) if this is the very first time you are doing this set-up. Otherwise you will have to come back here again. Please answer Y(es) or N(o)"  "replaceConfig?"

	#read from ../.env
	readConfig
	[[ $ENV = 'dev' ]] && { 
		PORT=3010 && URL=$BASE_URL_DEV 
	} || { 
		PORT=$PORT && URL=$BASE_URL 
	}

	#Replace Databases
	askYesNoQuestion "Would you like to replace your databases? You will have to create your users afresh. Please answer Y(es) if this is the very first time you are doing this set-up. Otherwise you will have to come back here again. Please answer Y(es) or N(o)" "replaceDatabases?"

	#yarn install
	tput bold;  echo "Mr. Brian: I am now installing node modules for you."; tput sgr0
	pwd
	# yarn install
	npm install
	cd "$setUpDir"
	#Setup default users
	askYesNoQuestion "Would you like to set up default users now? Please answer Yes if this is the first time you are setting up this system or if you have replaced your databases" "setupDefaultUsers?"

	echo $ENVIRONMENT
	if [ $ENVIRONMENT -lt 2 ]; then # less than two means its production
		tput bold;  echo -n "Mr. Brian: "; tput sgr0
		tput setaf 2;  echo "Since you are setting up a production system. I will now need greater permission from you. I'll need to run as root to create the service"; tput sgr0
		createService
	else
		tput bold;  echo -n "Mr. Brian: "; tput sgr0
		tput setaf 2;  echo "I will not do any other thing seeing as you were setting up a development system"; tput sgr0
	fi
	# tput bold;  echo "Mr. Brian: I am now setting up system defaults for you with your root user."; tput sgr0

	# tput bold;  echo "Mr. Brian: I am now creating the service."; tput sgr0
	# createService

	#start server
	{
		cd "$setUpDir"
		cd ../
		node bin/app.js
		tput bold;  echo -n "Mr. Brian: "; tput sgr0
		tput setaf 2;  echo "$user, your setup is done. Goto $URL:$PORT to see your new application"; tput sgr0
		tput setaf 2;  echo "Mr. Brian has now to go and do other duties. But you can always reach him with queries @ $AUTHOR_EMAIL"; tput sgr0

	} && {
		tput bold;  echo -n "Mr. Brian: ";    tput sgr0
		tput setaf 1;  echo "Server failed to start. Mr. Brian can go no further than this for now. Please find a way of fixing it yourself. If you have queries you can always reach Mr. Brian @ $AUTHOR_EMAIL"; tput sgr0
	}
	
}

#
# Execution begins here
#
# main
tput bold;  echo -n "Mr. Brian: ";    tput sgr0
tput setaf 4;  echo "I will help you with setting up this system. But first I'd like to know whether you are setting up a production system of a development system. Please let me know from the choices below"; tput sgr0
echo "1 for production"
echo "2 for development"
tput bold;  echo -n "Mr. Brian: ";    tput sgr0
tput setaf 4;  echo "Please note that I have no time now to validate your answer. Please just type 1 or 2 according to the instructions. Or I will assume that you are setting up a development system"; tput sgr0
echo -n "Your answer(1/2):"
read ans
ENVIRONMENT=2  

if [ $ans -gt 2 ]; then
	ENVIRONMENT=$ENVIRONMENT
else
	if [ $ans -lt 1 ]; then
		ENVIRONMENT=$ENVIRONMENT
	else
		ENVIRONMENT=$ans
	fi
fi

main