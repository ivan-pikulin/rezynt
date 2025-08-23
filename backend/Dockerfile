FROM python:3.12-slim

WORKDIR /app

# Install dependencies and wkhtmltopdf
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    wget \
    xvfb \
    fontconfig \
    libfreetype6 \
    libjpeg62-turbo \
    libpng16-16 \
    libx11-6 \
    libxcb1 \
    libxext6 \
    libxrender1 \
    libssl1.1 \
    libglib2.0-0 \
    ca-certificates \
    && wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb \
    && apt-get install -y ./wkhtmltox_0.12.6-1.buster_amd64.deb \
    && rm ./wkhtmltox_0.12.6-1.buster_amd64.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Create virtual environment and install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Make migration script executable
RUN chmod +x /app/app/scripts/migrate.sh

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
