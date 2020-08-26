import React, { Component } from 'react'

export class addChat extends Component {
    state =
    {
        text: '',
        from: '',

        placeholder: 'Enter a chat!'
    }
    
    onChange = (e) => this.setState({[e.target.name]: e.target.value});
    onSubmit = (e) => {
        e.preventDefault();
        if(this.state.text !== '' && this.state.from !== ''){
            this.props.newChat(this.state.text, this.state.from);
            this.setState({text: '', placeholder: "Enter a chat!"});
        }else if(this.state.text === ''){
            this.setState({placeholder: 'Chat cannot be empty!'});
        }else if(this.state.from === ''){
            this.setState({placeholder: 'You must set a username!'});
        }
    }

    render() {
        return (
            <form style={formStyle} onSubmit={this.onSubmit}>
                {/* <label for="from" style={{flex: "0.7", fontSize: "20px"}}> Chat as: </label> */}
                <input
                    type = "text"
                    name = "from"
                    style = {{flex: "2", fontSize: "20px"}}
                    placeholder="Set a username..."
                    size="1"
                    value = {this.state.from}
                    onChange = {this.onChange}
                />
                <input 
                    type="text" 
                    name="text"
                    style={{flex:"10", fontSize: "20px"}}
                    size="1"
                    placeholder= {this.state.placeholder}
                    value={this.state.text}
                    onChange = {this.onChange}
                />
                <input 
                    type="submit" 
                    style={{flex:"0.5"}} 
                    value="Send Chat"
                />
            </form>
        )
    }
}

const formStyle = {
    margin: "10px 0px",
    display: "flex",
    width: "100%",
    fontSize: "20px",
    // border: "1px solid black"
}

export default addChat
