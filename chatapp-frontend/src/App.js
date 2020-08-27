import React, { Component } from 'react'
import dotenv from 'dotenv';
import Axios from 'axios';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';

import io from 'socket.io-client';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Chats from './components/Chats';
import AddChat from './components/addChat';

export class App extends Component {
  state = 
  {
    chats: []
  }

  socket = io("https://gh-api.com");

  newChat = (text, sent_by) => 
  {
    Axios.get(process.env.REACT_APP_API_URI + 'addChat?text='+text+"&sent_by="+sent_by)
    .then(res => this.setState({chats: [...this.state.chats, res.data]}))
    
    this.socket.emit('sent');
  }

  updateChats = async () => {
    Axios.get(process.env.REACT_APP_API_URI + 'getChats')
    .then(res => this.setState({chats: res.data}));
    this.socket.emit('updated');
  }

  componentDidMount() 
  {
    dotenv.config();

    // this.socket = io(process.env.REACT_APP_SOCKET);
    this.socket.on('update', async () => {
      this.updateChats();
    });

    this.updateChats();
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <Route path={process.env.REACT_APP_HOME_PATH} render={props => (
            <React.Fragment>
              <div style={{height: "80vh", border: "1px solid black", overflowX: "hidden", overflowY:"auto", display:"flex", flexDirection: "column-reverse"}}>
                <div >
                  <Chats chats={this.state.chats}/>
                </div>
              </div>
              <AddChat className="chatBox" newChat={this.newChat}/>
            </React.Fragment>
          )}></Route>
          <Footer />
        </div>
      </Router>
    )
  }
}

export default App

