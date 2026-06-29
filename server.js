var express = require('express');
var exec = require('child_process').exec;
var path = require('path');

var app = express();
var PORT = 3000;

var processes = { rosbridge: null, turtlesim: null };
var processLogs = [];

// CRITICAL: Global catch to prevent ANY unhandled error from crashing the server
process.on('uncaughtException', function (err) {
    console.error('SERVER WARNING (Prevented Crash):', err.message || err);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function addLog(source, text) {
    var timestamp = new Date().toLocaleTimeString();
    var logLine = '[' + timestamp + '] [' + source.toUpperCase() + '] ' + text.trim();
    console.log(logLine);
    processLogs.push(logLine);
    if (processLogs.length > 30) {
        processLogs.shift();
    }
}

app.get('/api/logs', function(req, res) {
    res.json({ logs: processLogs });
});

app.post('/api/launch', function(req, res) {
    try {
        var target = req.body.target;

        if (processes[target]) {
            addLog('System', target + ' is already running.');
            return res.json({ status: 'running' });
        }

        var command = '';
        if (target === 'rosbridge') {
            command = 'source /opt/ros/$ROS_DISTRO/setup.bash && ros2 launch rosbridge_server rosbridge_websocket_launch.xml';
        } else if (target === 'turtlesim') {
            command = 'export DISPLAY=:0 && source /opt/ros/$ROS_DISTRO/setup.bash && ros2 run turtlesim turtlesim_node';
        }

        addLog('System', 'Launching ' + target + '...');
        
        var proc = exec(command, { shell: '/bin/bash' });
        processes[target] = proc;

        if (proc.stdout) {
            proc.stdout.on('data', function(data) {
                addLog(target, data.toString());
            });
        }

        if (proc.stderr) {
            proc.stderr.on('data', function(data) {
                addLog(target, data.toString());
            });
        }

        proc.on('close', function(code) {
            addLog('System', target + ' process stopped (Exit Code: ' + code + ')');
            processes[target] = null;
        });

        res.json({ status: 'started' });
    } catch (routeErr) {
        addLog('System', 'Launch Error: ' + routeErr.message);
        res.json({ status: 'error', error: routeErr.message });
    }
});

app.post('/api/kill', function(req, res) {
    try {
        var target = req.body.target;

        if (target === 'all') {
            addLog('System', 'Killing all background nodes...');
            if (processes.turtlesim) { try { processes.turtlesim.kill('SIGINT'); } catch(e){} processes.turtlesim = null; }
            if (processes.rosbridge) { try { processes.rosbridge.kill('SIGINT'); } catch(e){} processes.rosbridge = null; }
            
            exec('pkill -f turtlesim_node; pkill -f rosbridge_websocket', { shell: '/bin/bash' });
            addLog('System', 'System purge complete.');
            return res.json({ status: 'killed' });
        }

        if (processes[target]) {
            try { processes[target].kill('SIGINT'); } catch(e){}
            processes[target] = null;
            if (target === 'turtlesim') exec('pkill -f turtlesim_node', { shell: '/bin/bash' });
            if (target === 'rosbridge') exec('pkill -f rosbridge_websocket', { shell: '/bin/bash' });
            addLog('System', 'Stopped ' + target);
            res.json({ status: 'killed' });
        } else {
            res.json({ status: 'idle' });
        }
    } catch (killErr) {
        res.json({ status: 'error', error: killErr.message });
    }
});

app.listen(PORT, function() {
    console.log('>> Web Control dashboard active at http://localhost:3000');
});