import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// Response type for /code
type CodeResponse = {
  status: string;
  attempt: string;
  timestamp: string;
  active: boolean;
};

// Response type for /alarm-status
type AlarmStatusResponse = {
  active: boolean;
};

function App() {
  const [securityCode, setSecurityCode] = useState("");
  const [message, setMessage] = useState("");
  const [alarmStatus, setAlarmStatus] = useState<boolean | null>(null);

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityCode(event.target.value);
  };

  // Handle button click to disarm alarm
  const handleDisarmClick = () => {
    console.log("Button clicked. Sending code:", securityCode);

    axios
      .post<CodeResponse>("http://localhost:8000/code", { code: securityCode })
      .then((response) => {
        const data = response.data;
        console.log("Backend response:", data);

        if (data.status === "Code Accepted" && data.active === false) {
          setMessage("Alarm disarmed successfully.");

          // Immediately tell backend to shut off alarm (LED + buzzer)
          axios
            .post("http://localhost:8000/disarm")
            .then((res) => {
              console.log("Disarm POST sent successfully:", res.data);
            })
            .catch((err) => {
              console.error("Disarm POST failed:", err);
            });
        } else if (data.status === "Code Rejected") {
          setMessage("Invalid code. Try again.");
        } else {
          setMessage("Alarm is still active.");
        }

        setAlarmStatus(data.active);
      })
      .catch((error) => {
        console.log("Error occurred:", error);
        setMessage("An error occurred. Please try again.");
      });
  };

  // Poll backend every 5s for live alarm status
  useEffect(() => {
    const fetchStatus = () => {
      axios
        .get<AlarmStatusResponse>("http://localhost:8000/alarm-status")
        .then((res) => {
          setAlarmStatus(res.data.active);
        });
    };

    fetchStatus(); // initial call
    const interval = setInterval(fetchStatus, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div
        className="card shadow-lg border-primary"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="card-body p-4">
          <h1 className="text-center mb-4 text-primary fw-bold">
            Security Panel
          </h1>

          {/* Live alarm status */}
          {alarmStatus !== null && (
            <div
              className={`alert ${
                alarmStatus ? "alert-danger" : "alert-success"
              } text-center`}
              role="alert"
            >
              {alarmStatus ? "Alarm is ACTIVE" : "Alarm is INACTIVE"}
            </div>
          )}

          {/* Input for code */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Enter Security Code:
            </label>
            <input
              type="password"
              className="form-control form-control-lg text-center"
              value={securityCode}
              placeholder="Enter code"
              onChange={handleInputChange}
            />
          </div>

          {/* Button */}
          <button
            className="btn btn-success btn-lg w-100 mb-3"
            onClick={handleDisarmClick}
          >
            Disarm Alarm
          </button>

          {/* Feedback message */}
          {message && (
            <div
              className={`alert ${
                message.includes("successfully")
                  ? "alert-success"
                  : "alert-danger"
              } text-center`}
              role="alert"
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
