import pandas as pd
from io import BytesIO
import os
import uuid

def process_csv(file_bytes):
    df = pd.read_csv(BytesIO(file_bytes))
    
    if 'Type' not in df.columns:
        df['Type'] = 'Expense'

    # Make sure the uploads folder exists
    os.makedirs("uploads", exist_ok=True)

    # Save to a unique CSV file
    filename = f"uploads/processed_{uuid.uuid4()}.csv"
    df.to_csv(filename, index=False)

    return df, filename
