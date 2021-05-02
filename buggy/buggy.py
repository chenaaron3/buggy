from gpiozero import Robot, Motor
import pysher
import time
from datetime import datetime
import logging
import sys
import json
from bluedot import BlueDot

class Robby:
    def __init__(self):
        self.left_motor = Motor(8,7)
        self.right_motor = Motor(9,10)

    def handle_command(self, message):
        # convert to object
        message = json.loads(message)
        x_axis = message['x_axis']
        y_axis = message['y_axis']

        self.move(x_axis, y_axis)

    def stop(self):
        self.move(0, 0)

    def move(self, x_axis, y_axis):
        # forward
        if y_axis > 0:
            # right
            if x_axis > 0:
                self.left_motor.forward(1)
                self.right_motor.forward(.5)
            # straight
            elif x_axis == 0:
                self.left_motor.forward(1)
                self.right_motor.forward(1)
            # left
            elif x_axis < 0:
                self.left_motor.forward(.5)
                self.right_motor.forward(1)
        # sharp turn
        elif y_axis == 0:
            # right turn
            if x_axis > 0:
                strength = x_axis
                self.left_motor.forward(strength)
                self.right_motor.backward(strength)
            # stop
            elif x_axis == 0:
                self.left_motor.stop()
                self.right_motor.stop()
            # left turn
            elif x_axis < 0:
                strength = abs(x_axis)
                self.left_motor.backward(strength)
                self.right_motor.forward(strength)
        # backwards
        elif y_axis < 0:
            # right
            if x_axis > 0:
                self.left_motor.backward(1)
                self.right_motor.backward(.5)
            # straight
            elif x_axis == 0:
                self.left_motor.backward(1)
                self.right_motor.backward(1)
            # left
            elif x_axis < 0:
                self.left_motor.backward(.5)
                self.right_motor.backward(1)

def clamp(x, minimum, maximum):
    return max(minimum, min(x, maximum))

if __name__ == '__main__':
    # Add a logging handler so we can see the raw communication data
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    ch = logging.StreamHandler(sys.stdout)
    root.addHandler(ch)

    # robot instance
    robby = Robby()

    #bluedot instance
    bd = BlueDot()

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

    position = (0, 0)
    def bluedot_handler(pos):
        global position
        lastPosition = position
        position = (clamp(round(bd.position.x * 2), -1, 1), clamp(round(bd.position.y * 2), -1, 1))
        if position != lastPosition:
            robby.move(position[0], position[1])

    bd.when_pressed = bluedot_handler
    bd.when_moved = bluedot_handler
    bd.when_released = robby.stop

    while True:
        time.sleep(1)

