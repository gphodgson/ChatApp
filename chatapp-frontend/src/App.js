import React, { Component } from 'react'
import Axios from 'axios';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './components/layout/Header';

import Chats from './components/Chats';
import AddChat from './components/addChat';

export class App extends Component {
  state = 
  {
    chats: []
  }

  newChat = (text, sent_by) => 
  {
    Axios.get('https://gh-api.com:3002/addChat?text='+text+"&sent_by="+sent_by)
    .then(res => this.setState({chats: [...this.state.chats, res.data]}))
    // this.setState({chats: [...this.state.chats, {id: uuid(), text, sent_by}]})
  }

  updateChats = async () => {
    Axios.get('https://gh-api.com:3002/getChats')
    .then(res => this.setState({chats: res.data}));
  }

  componentDidMount() 
  {
    this.updateChats();
    setInterval(this.updateChats, 1000)
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <Route path="/projects/chatapp" render={props => (
            <React.Fragment>
              <div style={{height: "80vh", border: "1px solid black", overflowX: "hidden", overflowY:"auto", display:"flex", flexDirection: "column-reverse"}}>
                <div >
                  <Chats chats={this.state.chats}/>
                </div>
              </div>
              <AddChat className="chatBox" newChat={this.newChat}/>
            </React.Fragment>
          )}></Route>
        </div>
      </Router>
    )
  }
}

export default App

