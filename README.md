# 🤖 Aether-Shield: Autonomous Self-Healing DevOps Agent

Aether-Shield is an event-driven, closed-loop AI Coding Agent designed to automatically intercept production environment runtime crashes, diagnose root causes using LLM semantic reasoning, and commit fully functional code patches directly back to the repository autonomously.

## 📊 System Architecture

The agent operates as a continuous automated remediation lifecycle:
1. **Intercept:** Live microservices send runtime error logs via specialized HTTP POST webhooks.
2. **Analyze:** Google Gemini (`gemini-2.5-flash`) processes the crash stack trace against structural requirements to isolate initialization failures.
3. **Remediate:** The agent interfaces with the GitHub API to dynamically inject a robust singleton connection pattern, resolving the root exception.
4. **Report:** An automated diagnostic report containing a system breakdown and commit hash details is dispatched instantly to the team's Discord operations channel.

## 🛠️ Built With
* **Workflow Engine:** n8n (Self-Hosted via Render & PostgreSQL)
* **AI Core:** Google Gemini API
* **Runtime Environment:** Node.js / ioredis
* **CI/CD Target:** GitHub API Integration
* **Alerting Layer:** Discord Webhooks

## 📁 Repository Structure
* `redis.js`: The core configuration module managed and auto-patched by the Aether-Shield agent.
* `server.js`: The main application entry point that executes the underlying microservice initialization sequence.
* `package.json`: Manages the runtime dependencies (`ioredis`, etc.).
* `.gitignore`: Prevents temporary folders like `node_modules` from clogging your source control tracking.

---

## 🚀 How to Deploy Your Own Instance

### 1. Clone the Codebase Target
```bash
git clone [https://github.com/msuhaib-03/aether-shield.git](https://github.com/msuhaib-03/aether-shield.git)
cd aether-shield
npm install

```

### 2. Import the Automation Engine
Spin up a self-hosted instance of n8n backed by a persistent database storage layer.
Download the aether-shield-workflow.json file included in this repository.
Open your n8n canvas, click Import From File, and upload the template.

### 3. Connect Infrastructure Environment Variables
Configure your n8n environment nodes with the following access layers:

GEMINI_API_KEY: Authorized access to Google AI Studio.
GITHUB_TOKEN: A Personal Access Token (PAT) with repository read/write permissions.
DISCORD_WEBHOOK_URL: Your designated Slack or Discord logging channel endpoint.

### 🧪 Simulating an Incident Trigger
To test the autonomous remediation engine live, clear your n8n canvas execution window and dispatch a simulated crash payload using your terminal:

curl -X POST https://YOUR-PRODUCTION-URL/webhook/YOUR-WEBHOOK-ID \
  -H "Content-Type: application/json" \
  -d '{
    "service": "auth-microservice",
    "environment": "production",
    "error_log": "TypeError: Cannot read connect of undefined at redis.js:42",
    "file_targeted": "redis.js"
  }'
