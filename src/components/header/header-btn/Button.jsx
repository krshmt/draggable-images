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
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={onClick}
        >
            <div className="menu" aria-hidden="true">
                <span className="menu-label menu-label--menu">Menu</span>
                <span className="menu-label menu-label--close">Close</span>
            </div>
            <div className="cercle" ref={circleRef}>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
        </button>
    )
})

export default Button;
