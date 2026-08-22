import os
from groq import Groq
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class STTService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def transcribe(self, audio_file_path: str) -> str:
        """
        Transcribes the given audio file using Groq's whisper-large-v3 model.
        """
        try:
            with open(audio_file_path, "rb") as file:
                logger.info(f"Transcribing audio {audio_file_path} via Groq...")
                transcription = self.client.audio.transcriptions.create(
                    file=(os.path.basename(audio_file_path), file.read()),
                    model="whisper-large-v3-turbo",
                    response_format="text"
                )
                return str(transcription).strip()
        except Exception as e:
            logger.error(f"Error transcribing via Groq: {e}")
            raise e

# Singleton instance
stt_service = STTService()
