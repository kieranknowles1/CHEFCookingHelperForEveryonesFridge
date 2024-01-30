#!/bin/bash

# Setup script for the application
# Requires that docker-compose is installed,
# the dataset is downloaded and placed in the correct location,
# and that the user has permission to run docker commands

# Exit if any command fails (returns non-zero exit code)
set -e

DATASET_PATH="./dataset/full_dataset.csv"

# Check if dataset exists
if [ ! -f "$DATASET_PATH" ]; then
	echo "Dataset not found. Please download it from https://recipenlg.cs.put.poznan.pl/ and place it in $DATASET_PATH"
	exit 1
fi

echo "Building containers"
docker-compose build

echo "Running setup script"
docker-compose --env-file backend.env run --rm backend npm run setup

echo "Starting containers"
docker-compose up -d
