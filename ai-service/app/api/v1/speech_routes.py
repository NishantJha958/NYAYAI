from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import tempfile
from app.services.stt_service import stt_service
import logging

router = APIRouter(
    prefix="/speech",
    tags=["speech"]
)

logger = logging.getLogger(__name__)

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Accepts an audio file and returns the transcribed text using faster-whisper.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Save the uploaded file to a temporary file
    temp_file_fd, temp_file_path = tempfile.mkstemp(suffix=".webm")
    os.close(temp_file_fd) # Close the file descriptor, we'll open it with shutil
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"Processing audio file: {file.filename}")
        
        # Call the STT service
        transcribed_text = stt_service.transcribe(temp_file_path)
        
        return {"text": transcribed_text}
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
