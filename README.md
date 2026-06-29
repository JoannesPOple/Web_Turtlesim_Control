# Web_Turtlesim_Control
This is a crash-proof web interface that automates and teleoperates a ROS 2 simulation stack directly from a browser. It utilizes a Node.js Express backend to safely launch or kill background processes (like Rosbridge and Turtlesim/Gazebo) via UI buttons. On the frontend, `roslibjs` transmits real-time velocity commands over WebSockets.
