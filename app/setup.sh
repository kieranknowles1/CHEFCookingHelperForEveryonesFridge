#!/bin/bash

# Exit if any command fails (returns non-zero exit code)
set -e

DEPS="docker docker-compose"

echo "Checking and installing dependencies $DEPS"
echo "This may ask for your password"
sudo apt-get update
sudo apt-get install $DEPS

# Setup app

# Ask to download dataset if not found
if [ ! -f "./backend/working_data/full_dataset.csv" ]; then
	echo "Dataset not found. Please download it from https://recipenlg.cs.put.poznan.pl/ and place it in ./backend/working_data/full_dataset.csv"
	exit
fi

echo "Building backend container. Hope you have a SSD, because Node creates a ridiculous amount of files"
(
	cd backend
	docker-compose build
)

# Run app

echo "Setting up backend. Grab a cuppa, this will take a while"
(
	cd backend
	docker-compose --env-file docker-compose.env --rm run chef npm run setup
)

# TODO: Build and run the frontend

echo "Starting backend"
(
	cd backend
	docker-compose up -d
)
