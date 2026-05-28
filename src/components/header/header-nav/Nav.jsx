import "./styles.css"
import { forwardRef } from "react"
import { Link } from "react-router-dom"

const links = [
    { to: "/", label: "Projects" },
    { to: "/a-propos", label: "About" },
    { to: "/contact", label: "Contact" },
]

const Nav = forwardRef(function Nav({ onNavigate }, ref){
    const handleClick = (event, to) => {
        event.preventDefault()
        onNavigate(to)
    }

    return(
        <nav ref={ref} id="header-navigation">
            {links.map((link) => (
                <div className="lien" key={link.to}>
                    <Link
                        to={link.to}
                        aria-label={link.label}
                        onClick={(event) => handleClick(event, link.to)}
                    >
                        <span className="nav-link-text" aria-hidden="true">
                            <span className="nav-link-text__primary">{link.label}</span>
                            <span className="nav-link-text__clone">{link.label}</span>
                        </span>
                    </Link>
                </div>
            ))}
            <div className="mail">
                <p href="mailto:tourekris16@gmail.com">
                    tourekris16@gmail.com
                </p>
            </div>
        </nav>
    )
})

export default Nav;
