from gpiozero import Robot
import pysher
import time
from datetime import datetime
import logging
import sys
import json

class Robby:
    def __init__(self):
        self.robot = Robot(left=(8,7), right=(9,10))
        self.activeCommands = set() # track what commands are currently pressed
        self.commands = [] # track history of commands to reverse
        self.returning = False

    def reverse_commands(self):
        numCommands = len(self.commands)
        if numCommands == 0:
            return

        print(self.commands)

        self.returning = True
        for i in range(numCommands - 1):
            # execute command for certain duration
            last_command = self.commands[numCommands - 1 - i]
            command_entry = self.commands[numCommands - 2 - i]
            duration = (last_command['time'] - command_entry['time']).total_seconds()
            command = command_entry['command']
            if command == 'FORWARD':
                self.robot.backward(1)
            elif command == 'BACKWARD':
                self.robot.forward(1)
            elif command == 'LEFT':
                self.robot.right(1)
            elif command == 'RIGHT':
                self.robot.left(1)
            else:
                continue
            time.sleep(duration)

        self.returning = False

    def handle_command(self, message):
        if self.returning:
            return

        # convert to object
        message = json.loads(message)
        command = message['command']

        # process commands
        if message['pressed']:
            self.commands.append({"command": command, 'time': datetime.now()})
            if not message['controller']:
                self.activeCommands.add(command)
            if command == 'FORWARD':
                self.robot.forward(1)
            elif command == 'BACKWARD':
                self.robot.backward(1)
            elif command == 'LEFT':
                self.robot.left(1)
            elif command == 'RIGHT':
                self.robot.right(1)
            elif command == 'RESET':
                self.commands.clear()
            elif command == 'RETURN':
                # buffer with stop command to get timestamp
                self.commands.append({'command': 'STOP', 'time': datetime.now()})
                self.reverse_commands()        
        # check if should stop robot
        else:
            if command in self.activeCommands:
                self.activeCommands.remove(command)
            if len(self.activeCommands) == 0:
                self.commands.append({'command': 'STOP', 'time': datetime.now()})
                self.robot.stop()


if __name__ == '__main__':
    # Add a logging handler so we can see the raw communication data
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    ch = logging.StreamHandler(sys.stdout)
    root.addHandler(ch)

    # robot instance
    robby = Robby()

    # pusher instance
    pusher = pysher.Pusher('18daa371eebed30fcef8', cluster='us3')

    def handle_command(message):
        robby.handle_command(message)

    def connect_handler(data):
        print("Connected to pusher!")
        channel = pusher.subscribe('buggy')
        channel.bind('command', handle_command)

    pusher.connection.bind('pusher:connection_established', connect_handler)
    pusher.connect()

    while True:
        time.sleep(1)

