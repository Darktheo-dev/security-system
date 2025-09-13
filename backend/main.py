# Kevin Varghese – FastAPI + Firebase (Motion + Code Logging + Alarm Status)

from fastapi import FastAPI
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, db
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# --- Initialize FastAPI ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initialize Firebase ---
cred = credentials.Certificate("firebase-admin.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://ir-lock-project-default-rtdb.firebaseio.com/"
    })

# --- Global alarm flag ---
alarm_active = False

# --- Root route ---
@app.get("/")
def read_root():
    return {"message": "the backend is working fine"}

# --- Motion detection route ---
@app.post("/motion")
def motion_detected():
    global alarm_active
    alarm_active = True

    log_entry = {
        "status": "Motion Detected",
        "timestamp": datetime.now().isoformat()
    }
    db.reference("/motion_logs").push(log_entry)

    return JSONResponse(content={**log_entry, "active": alarm_active})

# --- Code model ---
class CodeEntry(BaseModel):
    code: str

# --- Secret disarm code ---
SECRET_CODE = "1738"

# --- Code verification route ---
@app.post("/code")
def verify_code(entry: CodeEntry):
    global alarm_active

    if entry.code.strip() == SECRET_CODE:
        alarm_active = False
        log_entry = {
            "status": "Code Accepted",
            "attempt": entry.code,
            "timestamp": datetime.now().isoformat()
        }
    else:
        log_entry = {
            "status": "Code Rejected",
            "attempt": entry.code,
            "timestamp": datetime.now().isoformat()
        }

    db.reference("/code_logs").push(log_entry)

    return JSONResponse(content={**log_entry, "active": alarm_active})

# ✅ NEW route: Disarm directly (used by React for instant disarm)
@app.post("/disarm")
def disarm_alarm():
    global alarm_active
    alarm_active = False
    return {"status": "Alarm disarmed"}

# --- Alarm status route for Arduino ---
@app.get("/alarm-status")
def get_alarm_status():
    return JSONResponse(content={"active": alarm_active})