FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY sync_orange_book.py .
CMD ["python", "sync_orange_book.py"]
