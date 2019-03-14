#!/bin/bash

readConfig () {
        set -a 
        source .env
        set +a 
}

readConfig

checktime=$UPDATE_INTERVAL #1 hour       #time in minutes after which to check for new updates
#times in seconds
checktime=$((checktime * 60))

pullUpdates() {
        (git pull origin master | grep "Already up-to-date") && echo "Nothing more to do " || systemctl restart csymapp-api
}

pullUpdates
#git pull origin master

while :
do
   {
		sleep $checktime
		pullUpdates
	}
done