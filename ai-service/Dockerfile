# Dùng Python bản Slim (Debian) để dễ cài driver âm thanh
FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    portaudio19-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy file yêu cầu và cài đặt thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code vào
COPY . .

# Mở cổng 5000
EXPOSE 5000

# Chạy app
CMD ["python", "app.py"]