# CHEF - Cooking Helper for Everyone's Fridge

Kieran Knowles, 2023-2024

## Installation

### Requirements
This project requires Node.js to be installed on your machine. You can download it [here](https://nodejs.org/en/download/).

### Setup
A setup script is provided to install all dependencies, set up the app, and run it. To run it, simply run the following command:
```bash
cd app
sudo ./setup.sh
```

After setup, the app will be running on port 3000 of your machine.

## Environment Variables
The following environment variables can be passed to the backend to configure its behaviour:

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT` | The port to run the server on | `3000` |
| `SETUP_LOG_FILE` | The file to log setup output to | `working_data/setup.log` |
| `SETUP_CSV_FILE` | The file to read the dataset from | `working_data/full_dataset.csv` |
| `RUNTIME_LOG_FILE` | The file to log runtime output to | `working_data/chefbackend.log` |
| `PORT` | The port to run the server on | `3000` |
| `DATABASE_PATH` | The path to the database file | `working_data/chefdatabase.db` |
| `MIN_LOG_LEVEL` | The minimum log level to log | `info` |
