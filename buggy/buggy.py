from gpiozero import Robot
import pysher
from time import sleep

# Add a logging handler so we can see the raw communication data
import logging
import sys
root = logging.getLogger()
root.setLevel(logging.INFO)
ch = logging.StreamHandler(sys.stdout)
root.addHandler(ch)

def connect_handler(data):
    print("Connected to pusher!")
    channel = pusher.subscribe('buggy')
    channel.bind('command', handle_command)

def handle_command(message):
    print(message)

if __name__ == '__main__':
    # robby = Robot(left=(8,7), right=(9,10))
    pusher = pysher.Pusher('18daa371eebed30fcef8', secret='9dfd8f8695e23c19a538', cluster='us3')

    pusher.connection.bind('pusher:connection_established', connect_handler)
    pusher.connect()

    print(pusher)

    while True:
        sleep(1)