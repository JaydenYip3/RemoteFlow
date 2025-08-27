# RemoteFlow

A full-stack application with Next.js frontend and FastAPI backend. This application allows users to remotely control their devices via the web. Currently only supporting UNIX based devices. Additionally this application uses webscraping to automatically add your local network devices to the application. With these devices you are able to WOL (wake on lan) and connect to their respective CLIs. This program is also blocked and secured via JWT for user sessions and security. 


Here you will be able to select the devices you would like to add, with these devices you will be able to WOL and use their CLIs.

<img width="1227" height="1221" alt="image" src="https://github.com/user-attachments/assets/89b0b679-8746-4ef7-915f-ef320f676be3" />

When you update the system you will be able to select the following devices:

<img width="1169" height="1224" alt="image" src="https://github.com/user-attachments/assets/1de99f6d-5da7-435b-a89c-40c0052e9fb6" />

Note for security reasons, your MAC address remains hidden and only accessible in the backend logistics.

Added devices will look like this:

<img width="1229" height="1232" alt="image" src="https://github.com/user-attachments/assets/6ced416a-0438-4627-b994-57ce1b4efb74" />

For accessing the terminal, the device will have to be online and ready to go. Once booted the user may press the control button then it will ask for the system's password.


## Quick Setup

After cloning the repository, run the setup script:

```bash
./setup.sh
```

This will automatically set up both frontend and backend dependencies.

Additionally the user should tinker and configure the env files for their env variables (passwords, secret keys, localhosts, and network gateway credentials).

## Manual Setup

If you prefer to set up manually:

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
./run.sh
```
The backend will be available at http://localhost:8000

### Start Frontend
```bash
cd frontend
npm run dev
```
The frontend will be available at http://localhost:3000
