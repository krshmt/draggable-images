import "./styles.css"
import { forwardRef } from "react";

const Button = forwardRef(function Button({ circleRef, isOpen, onClick }, ref){
    return (
        <button
            ref={ref}
            className="menu-cercle"
            type="button"
            aria-controls="header-navigation"
            aria-expanded={isOpen}
            onClick={onClick}
        >
            <div className="menu">
                <p>{isOpen ? "Close" : "Menu"}</p>
            </div>
            <div className="cercle" ref={circleRef}>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
        </button>
    )
})

export default Button;
