import React, { Component } from 'react'

export class Chat extends Component {
    render() {
        return (
            <div style={{margin: "10px 10px"}}>
                <p><span style={{textDecoration: "underline", fontWeight: "bolder"}}>{this.props.chat.sent_by}</span>: {this.props.chat.text}</p>
            </div>
        )
    }
}

export default Chat
