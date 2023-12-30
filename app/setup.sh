#!/bin/bash

DEPS="npm"

# Require root
# https://stackoverflow.com/questions/18215973/how-to-check-if-running-as-root-in-a-bash-script
if [ "$EUID" -ne 0 ]; then
	echo "Please run as root"
	exit
fi

# Install dependencies
apt-get update
apt-get install $DEPS

# Setup app

# Ask to download dataset if not found
if [ ! -f "./backend/working_data/full_dataset.csv" ]; then
	echo "Dataset not found. Please download it from https://recipenlg.cs.put.poznan.pl/ and place it in ./backend/working_data/full_dataset.csv"
	exit
fi

echo "Setting up backend..."
(
	cd backend || exit
	npm install --save-dev
	npm run build
	npm run setup
)

cd ..

echo "Setting up frontend..."
(
	cd frontend || exit
	npm install --save-dev
	npm run build
)

# Run app
# TODO
