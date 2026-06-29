# ROS 2 Automation Web UI Master Control Dashboard

A lightweight, crash-proof HMI (Human-Machine Interface) web application designed to orchestrate and teleoperate ROS 2 simulation stacks directly from any standard modern web browser. This interface completely eliminates the requirement of multiple Linux terminal setups by handling background node processes and translating raw WebSocket payloads into native ROS 2 velocity primitives.

---

## 🛠️ System Architecture

The stack consists of three logical operational layers designed to support high-reliability background service rendering:

1. **Frontend UI Client:** A localized HTML5 webpage calling `roslibjs` via CDN to compile manual control vectors into standardized JSON structures sent over persistent browser WebSockets.
2. **Orchestration Backend Server:** A Node.js Express script utilizing explicit global try-catch frameworks (`uncaughtException`) and targeted subshell routing (`/bin/bash`) to safely spin up, track, and kill core ROS executables without dropouts.
3. **Robot Translation Layer:** A localized `rosbridge_server` instances translating incoming network streams into standard ROS 2 binary message types (`geometry_msgs/msg/Twist`) dispatched directly to active simulation blocks.

---

## 🚀 Installation & Prerequisites

Ensure your host system is running an active Ubuntu Desktop installation compiled with **ROS 2 (Humble, Jazzy, or Iron)**.

### 1. Install Node.js Dependencies
Navigate to your project folder workspace directory and prepare the localized dependencies:
```bash
mkdir -p web_turtlesim_control/public
cd web_turtlesim_control
npm init -y
npm install express