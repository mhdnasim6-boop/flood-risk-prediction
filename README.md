# flood-risk-prediction
# 🌊 Flood Risk Prediction System

A Machine Learning powered Flood Risk Prediction System built using **FastAPI**, **Pydantic**, **Scikit-Learn**, **JavaScript**, and **Docker**. The application predicts flood risk based on rainfall and geographical subdivision information, provides uncertainty estimates, and visualizes the prediction results through an interactive web interface.

---

## 🚀 Features

* Flood Risk Prediction using Machine Learning
* Interactive Web Interface
* FastAPI REST API Backend
* Pydantic Data Validation
* Dynamic Subdivision Dropdown
* Prediction Probability Estimation
* Confidence & Uncertainty Metrics
* Risk Categorization:

  * LOW
  * MEDIUM
  * HIGH
* Visualization Dashboard
* Dockerized Deployment
* Swagger API Documentation

---

## 🏗️ Project Architecture

```text
User Input
     │
     ▼
Frontend (HTML/CSS/JavaScript)
     │
     ▼
FastAPI Backend
     │
     ▼
Pydantic Validation
     │
     ▼
Prediction Engine
     │
     ▼
Flood Risk Model
     │
     ▼
Prediction + Confidence + Uncertainty
     │
     ▼
Visualization & Results
```

---

## 📂 Project Structure

```text
flood-risk-prediction/
│
├── app/
│   ├── main.py
│   ├── predictor.py
│   ├── model_loader.py
│   ├── schemas.py
│   │
│   ├── templates/
│   │   └── index.html
│   │
│   └── static/
│       ├── app.js
│       └── style.css
│
├── models/
│   ├── flood_model.pkl
│   ├── label_encoder.pkl
│   ├── historical_profiles.pkl
│   ├── overall_profile.pkl
│   ├── train_thresholds.pkl
│   └── global_threshold.pkl
│
├── Dockerfile
├── requirements.txt
├── README.md
└── .gitignore
```

---

## 📊 Input Parameters

| Parameter   | Description              |
| ----------- | ------------------------ |
| Rainfall    | Rainfall in millimeters  |
| Month       | Month (1–12)             |
| Year        | Year                     |
| Subdivision | Geographical subdivision |

---

## 📈 Output

The system returns:

* Flood Probability (%)
* Risk Category
* Confidence Score (%)
* Uncertainty Score (%)
* Rainfall Threshold

Example:

```json
{
    "probability": 82.35,
    "confidence": 74.50,
    "uncertainty": 25.50,
    "risk": "HIGH",
    "threshold": 414.98
}
```

---

## 🛠️ Tech Stack

### Backend

* FastAPI
* Pydantic
* Uvicorn

### Machine Learning

* Scikit-Learn
* NumPy
* Pandas
* Joblib

### Frontend

* HTML
* CSS
* JavaScript

### Deployment

* Docker

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/mhdnasim6-boop/flood-risk-prediction.git

cd flood-risk-prediction
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

#### macOS / Linux

```bash
source venv/bin/activate
```

#### Windows

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## ▶️ Run Application

```bash
uvicorn app.main:app --reload
```

Application:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t flood-risk-prediction .
```

### Run Container

```bash
docker run -p 8000:8000 flood-risk-prediction
```

Access:

```text
http://localhost:8000
```

---

## 🔍 API Endpoint

### Predict Flood Risk

```http
POST /predict
```

Request:

```json
{
    "rainfall": 500,
    "month": 7,
    "year": 2024,
    "subdivision": "Kerala"
}
```

Response:

```json
{
    "probability": 82.35,
    "confidence": 74.50,
    "uncertainty": 25.50,
    "risk": "HIGH",
    "threshold": 414.98
}
```

---

## 📸 Screenshots

Add screenshots of:

* Home Page
* <img width="1416" height="773" alt="Screenshot 2026-06-20 at 11 49 57 PM" src="https://github.com/user-attachments/assets/56127a52-1b8a-430c-837c-07724e59edb2" />

* Prediction Form
* <img width="1439" height="642" alt="Screenshot 2026-06-20 at 11 51 18 PM" src="https://github.com/user-attachments/assets/8a4e114a-0f9a-4f3e-8c6a-c56b05e62d65" />

* Risk Visualization
* <img width="1439" height="785" alt="Screenshot 2026-06-20 at 11 51 28 PM" src="https://github.com/user-attachments/assets/6956a448-6491-4ab5-a1fe-00a2a1634699" />

* Swagger Documentation
* <img width="1439" height="777" alt="Screenshot 2026-06-20 at 11 50 15 PM" src="https://github.com/user-attachments/assets/fc4a69f9-c3bc-4d6f-a2ea-b3ca576200d4" />


Example:

```text
assets/homepage.png
assets/prediction_result.png
assets/swagger_docs.png
```

---

## 🎯 Future Improvements

* Real-Time Weather API Integration
* GIS-Based Flood Mapping
* SHAP Explainability
* Historical Trend Analysis
* Cloud Deployment
* Advanced Uncertainty Quantification
* Interactive Geographic Visualizations

---

## 👨‍💻 Author

**Muhammed Nasimudheen**


---

## 📜 License

This project is developed for educational and research purposes.
