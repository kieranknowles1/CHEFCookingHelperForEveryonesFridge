#!/bin/bash

# Exit if any command fails (returns non-zero exit code)
set -e

DATASET_PATH="./dataset/full_dataset.csv"

echo "Checking and installing dependencies"
echo "This may ask for your password"
sudo apt-get update
sudo apt-get install docker docker-compose

# Check if dataset exists
if [ ! -f "$DATASET_PATH" ]; then
	echo "Dataset not found. Please download it from https://recipenlg.cs.put.poznan.pl/ and place it in $DATASET_PATH"
	exit 1
fi

echo "Running setup script"
docker-compose --env-file backend.env run --rm backend npm run setup

echo "Building containers"
docker-compose build

echo "Starting containers"
docker-compose up -d
