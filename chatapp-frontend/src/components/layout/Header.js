import React from 'react'

export default function Header() {
    return (
        <div style = {headerStyle}>
            <header>Chat App</header>
        </div>
    )
}

const headerStyle = {
    background: "#5c5c5c",
    textAlign: "center",
    textDecoration: "underline",
    fontSize: "40px",
    padding: "10px",
    color: "#fff",

}
