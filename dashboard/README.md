# Portfolio Dashboard

A React-based dashboard for portfolio and department analytics.

---

## Features
- Interactive charts and dashboards
- Department and portfolio filtering
- Responsive sidebar navigation
- CSV data import (demo included)

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker](https://www.docker.com/) (for containerized setup)

---

## Local Installation (npm)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/NandhuRajRK/BL-Dashboad.git
   cd BL-Dashboad/dashboard
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm start
   ```
   - The app will be available at [http://localhost:3000](http://localhost:3000)
   - Hot-reloads on code changes

4. **Run tests:**
   ```sh
   npm test
   ```

---

## Docker Installation

1. **Build the Docker image:**
   ```sh
   docker build -t portfolio-dashboard .
   ```

2. **Run the container:**
   ```sh
   docker run -p 3000:3000 portfolio-dashboard
   ```
   - Access the app at [http://localhost:3000](http://localhost:3000)

> **Note:** If you use Docker Compose, add a `docker-compose.yml` file as needed.

---

## Project Structure
```
dashboard/
  ├── public/           # Static files and HTML
  ├── src/              # React components and logic
  ├── package.json      # npm dependencies and scripts
  ├── README.md         # This documentation
  └── ...
```

---

## Troubleshooting
- If you see `EADDRINUSE: port 3000 already in use`, stop other apps using that port or change the port in `.env` or `package.json`.
- For Windows users: If you see CRLF/LF warnings, it's safe to ignore for most cases.
- If dependencies fail to install, ensure your Node.js and npm versions are up to date.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE) 