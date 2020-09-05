import React from 'react'

export default function Footer() {
    return (
        <div>
            <footer style={footerStyle}>Created By: Geoff Hodgson | Created on August 21, 2020 | <a style={linkStyle} href="https://geoffhodgson.com">geoffhodgson.com</a> | <a style={linkStyle} href="https://github.com/payne1134/ChatApp">Github</a></footer>
        </div>
    )

}

const footerStyle =
{
    margin: "10px 0px",
    color: "#bababa",
    borderTop: "1px dotted #d4d4d4",
    textAlign: "center",
}

const linkStyle =
{
    textDecoration: "underline",
    color: "#bababa",
}