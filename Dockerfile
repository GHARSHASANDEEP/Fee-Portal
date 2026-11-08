FROM node:22-slim
WORKDIR /app
COPY . .
# Hugging Face Spaces expects port 7860. /tmp is writable for the SQLite file.
ENV PORT=7860 DB_PATH=/tmp/data.db NODE_ENV=production
EXPOSE 7860
CMD ["node", "--no-warnings", "src/server.js"]
