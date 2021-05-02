import React from 'react'
import logo from './logo.svg';
import './App.css';
import Pusher from 'react-pusher';
import Gamepad from 'react-gamepad'
import ScriptTag from 'react-script-tag';

const commands = {
  FORWARD: 'FORWARD',
  BACKWARD: 'BACKWARD',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  STOP: 'STOP'
}

const keyMap = {
  38: commands.FORWARD,
  40: commands.BACKWARD,
  37: commands.LEFT,
  39: commands.RIGHT,

  87: commands.FORWARD,
  83: commands.BACKWARD,
  65: commands.LEFT,
  68: commands.RIGHT
}

function clamp(val, min, max) {
  return val > max ? max : val < min ? min : val;
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.xAxis = 0;
    this.yAxis = 0;
  }

  // Add keyboard handlers
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  sendCommand = (body) => {
    fetch(`/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  // Keyboard handlers
  handleKeyDown = (event) => {
    if (event.repeat) return;

    if (keyMap.hasOwnProperty(event.keyCode)) {
      let command = keyMap[event.keyCode];
      console.log("keydown", command)
      if (command == commands.FORWARD) {
        this.yAxis = 1;
      }
      else if (command == commands.BACKWARD) {
        this.yAxis = -1;
      }
      else if (command == commands.LEFT) {
        this.xAxis = -1;
      }
      else if (command == commands.RIGHT) {
        this.xAxis = 1;
      }

      this.sendCommand({
        x_axis: this.xAxis,
        y_axis: this.yAxis
      });
    }
  }

  handleKeyUp = (event) => {
    if (keyMap.hasOwnProperty(event.keyCode)) {
      let command = keyMap[event.keyCode];
      console.log("keyup", command)
      if (command == commands.FORWARD) {
        this.yAxis = 0;
      }
      else if (command == commands.BACKWARD) {
        this.yAxis = 0;
      }
      else if (command == commands.LEFT) {
        this.xAxis = 0;
      }
      else if (command == commands.RIGHT) {
        this.xAxis = 0;
      }

      this.sendCommand({
        x_axis: this.xAxis,
        y_axis: this.yAxis
      });
    }
  }

  // Gamepad handlers
  connectHandler(gamepadIndex) {
    console.log(`Gamepad ${gamepadIndex} connected !`)
  }

  disconnectHandler(gamepadIndex) {
    console.log(`Gamepad ${gamepadIndex} disconnected !`)
  }

  buttonChangeHandler(buttonName, down) {
    console.log(buttonName, down)
  }

  axisChangeHandler = (axisName, value, previousValue) => {
    console.log(axisName, value)
    let oldXAxis = this.xAxis;
    let oldYAxis = this.yAxis;

    let threshold = .25;
    if (axisName == 'LeftStickX' && value >= 1 * threshold) {
      this.xAxis = 1;
    }
    else if (axisName == 'LeftStickY' && value >= 1 * threshold) {
      this.yAxis = 1;
    }
    else if (axisName == 'LeftStickX' && value <= -1 * threshold) {
      this.xAxis = -1;
    }
    else if (axisName == 'LeftStickY' && value <= -1 * threshold) {
      this.yAxis = -1;
    }
    else if (value == 0) {
      this.xAxis = 0;
      this.yAxis = 0;
    }

    if (this.xAxis != oldXAxis || this.yAxis != oldYAxis) {
      this.sendCommand({
        x_axis: this.xAxis,
        y_axis: this.yAxis
      });
    }
  }

  onClick = () => {
    navigator.bluetooth.requestDevice({
      // filters: [...] <- Prefer filters to save energy & show relevant devices.
      acceptAllDevices: true
    })
      .then(device => {
        console.log('> Requested ' + device.name + ' (' + device.id + ')');
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });
  }

  render() {
    console.log(process.env.PUBLIC_URL + '/jsmpeg.min.js')

    return (
      <div className="App">
        <Pusher
          channel="buggy"
          event="command"
          onUpdate={(message) => { console.log(message) }}
        />
        <Gamepad
          onConnect={this.connectHandler}
          onDisconnect={this.disconnectHandler}
          onButtonChange={this.buttonChangeHandler}
          onAxisChange={this.axisChangeHandler}
        >
          <span></span>
        </Gamepad>

        <header className="App-header">
          <canvas id="video-canvas" ></canvas>
          <button onClick={this.onClick}>
            hehexd
          </button>
          <p>
            USE ARROW KEYS OR WASD TO MOVE
          </p>
          <ScriptTag isHydrating={false} type="text/javascript" src={process.env.PUBLIC_URL + '/jsmpeg.min.js'} onLoad={() => {
            const $ = window.$;
            var canvas = document.getElementById('video-canvas');
            var url = 'ws://raspberrypi:8082/';
            var player = new window.JSMpeg.Player(url, { canvas: canvas, audio: false, videoBufferSize: 102410248 / 2048 });
          }} />
        </header>
      </div>
    );
  }
}

export default App;
