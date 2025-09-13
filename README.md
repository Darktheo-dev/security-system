# Smart Security System

A full-stack security system prototype combining real-time motion detection with cloud-based control. This project integrates web-based alarm disarming, Firebase data syncing, and microcontroller hardware signaling using FastAPI — showcasing full integration between frontend, backend, cloud services, and hardware.

Developed as part of a personal initiative to demonstrate proficiency in embedded systems, full-stack development, and hardware-software interfacing.

---

## Overview

This system simulates a secure access environment (e.g., aerospace labs, data centers, or industrial control rooms), where:

- Motion detection triggers physical alerts
- A web-based panel is used to enter a security code
- System disarms upon successful code verification via backend logic
- All actions are tracked in real-time using Firebase

This project was developed to demonstrate skills aligned with internships in software, embedded systems, and security engineering — especially targeting companies like **SpaceX**, **NASA**, and **Lockheed Martin**.

---

## Features

- **Infrared Motion Detection**: Triggers hardware alarm when motion is detected
- **Real-time Alerts**: Activates buzzer and LED on detection
- **Secure Web Disarming Interface**: React UI for code-based disarming
- **Cloud-Connected Logic**: FastAPI backend verifies code and updates Firebase
- **Live Status Monitoring**: Firebase Realtime Database reflects system status instantly
- **Microcontroller Control**: Arduino hardware reacts to backend commands via serial

---

## System Architecture

```txt
[ IR Sensor ] --> [ Arduino ] <--> [ FastAPI Server ] <--> [ Firebase ]
                                        ^
                                        |
                                 [ React Frontend ]



	•	Frontend: React app with a secure input field (virtual keypad)
	•	Backend: FastAPI validates disarm code and pushes status updates
	•	Firebase: Used to sync state between web app and microcontroller
	•	Arduino: Listens to serial commands and controls buzzer + LED




                                # Tech Stack



Layer                                            Technology Used
Hardware                              Arduino UNO R4 WiFi, IR Sensor, Buzzer, LED
Backend                                    Python, FastAPI, Firebase Admin SDK
Frontend                                    React, TypeScript, Axios, Bootstrap
Database                                         Firebase Realtime Database
Hosting                                    Localhost (dev) + GitHub (source control)


How It Works
	1.	Motion is detected → Arduino activates the buzzer and LED
	2.	User opens the React UI and enters the disarm code
	3.	Code is sent to FastAPI backend via Axios POST
	4.	Backend checks the code:
	•	If valid → updates Firebase and sends “disarm” to Arduino
	•	If invalid → alarm stays active
	5.	Firebase database reflects current state (armed/disarmed)
	6.	Arduino listens via serial and disables buzzer/LED on command

⸻

Installation & Usage

1. Upload Arduino Sketch
	•	Flash .ino sketch to your Arduino (UNO R4 WiFi or ESP32)
	•	Adjust Serial.begin() rate and port if needed


2. Backend Setup (Python)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000


3. Frontend Setup (React)

cd frontend
npm install
npm start

4. Firebase Configuration
	•	Add your Firebase Admin SDK key as:
backend/firebase-admin.json
	•	Ensure .gitignore protects this file

⸻

Security & Best Practices
	•	.gitignore is in root:
	•	Prevents committing firebase-admin.json, node_modules/, venv/, system files
	•	No frontend secrets exposed
	•	Firebase write rules can be configured for stricter access control

⸻

Future Improvements
	•	Add camera streaming (for live visual feed)
	•	SMS or email alerts on unauthorized entry
	•	Admin dashboard for managing codes and viewing log history
	•	Deploy backend to cloud platform (Render, Railway, or Firebase Functions)

⸻

Developer

Kevin Varghese
B.S. in Computing & Security Technology
Drexel University – College of Computing & Informatics
	•	GitHub: @Darktheo-dev
	•	Email: kevinvarghese84@gmail.com
	•	Focus: Full-stack development, embedded systems, security & infrastructure


