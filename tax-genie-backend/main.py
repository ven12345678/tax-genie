from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from parser import process_csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    contents = await file.read()
    
    try:
        df, saved_path = process_csv(contents)
        return {
            "rows": df.shape[0],
            "message": "CSV processed and saved",
            "saved_file": saved_path
        }
    except Exception as e:
        return {
            "error": str(e)
        }
