import React from 'react'
import logo from './logo.svg';
import './App.css';
import Pusher from 'react-pusher';
import Gamepad from 'react-gamepad'

const commands = {
  FORWARD: 'FORWARD',
  BACKWARD: 'BACKWARD',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  STOP: 'STOP',
  RESET: 'RESET',
  RETURN: 'RETURN'
}

const keyMap = {
  38: commands.FORWARD,
  40: commands.BACKWARD,
  37: commands.LEFT,
  39: commands.RIGHT,
  27: commands.RESET,
  32: commands.RETURN
}

class App extends React.Component {
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
      this.sendCommand({
        command: keyMap[event.keyCode],
        pressed: true
      });
    }
  }

  handleKeyUp = (event) => {
    if (keyMap.hasOwnProperty(event.keyCode)) {
      this.sendCommand({
        command: keyMap[event.keyCode],
        pressed: false
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
    let threshold = .9;
    if (axisName == 'LeftStickX' && value >= 1 * threshold) {
      this.sendCommand({
        command: commands.RIGHT,
        pressed: true,
        controller: true
      });
    }
    else if (axisName == 'LeftStickY' && value >= 1 * threshold) {
      this.sendCommand({
        command: commands.FORWARD,
        pressed: true,
        controller: true
      });
    }
    else if (axisName == 'LeftStickX' && value <= -1 * threshold) {
      this.sendCommand({
        command: commands.LEFT,
        pressed: true,
        controller: true
      });
    }
    else if (axisName == 'LeftStickY' && value <= -1 * threshold) {
      this.sendCommand({
        command: commands.BACKWARD,
        pressed: true,
        controller: true
      });
    }
    else if (value == 0) {
      this.sendCommand({
        command: 'STOP',
        pressed: false,
        controller: true
      });
    }
  }

  render() {
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
          <p></p>
        </Gamepad>

        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
