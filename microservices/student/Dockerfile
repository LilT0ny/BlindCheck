FROM python:3.12-slim
WORKDIR /app

# Install Dependencies (Common)
COPY common/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy Common Code
COPY common/ common/

# Copy Service Code
COPY microservices/student/ .

# Create uploads directory (mount point)
RUN mkdir -p uploads

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]