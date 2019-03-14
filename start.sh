#!/bin/bash


killall csymapp-api.update.sh
./csymapp-api.update.sh &

npm install
node bin/app.js


