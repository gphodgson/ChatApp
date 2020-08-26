import React, { Component } from 'react'
import Chat from './Chat';

export class Chats extends Component {
    render() {
        return this.props.chats.map((chat) => (
            <Chat chat={chat} key={chat.chat_id}/>
        ));
    }
}

export default Chats
