FROM node:22-bookworm

RUN apt-get update && apt-get install -y \
    libreoffice \
    python3 \
    python3-pip \
    python-is-python3 \
    poppler-utils \
    ghostscript \
    qpdf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN python3 -m pip install --break-system-packages \
    PyMuPDF \
    pdf2docx \
    python-docx \
    python-pptx \
    openpyxl \
    pandas

ENV NODE_ENV=production
ENV LIBREOFFICE_PATH=soffice
ENV PYTHON_PATH=python3

CMD ["npm", "start"]
