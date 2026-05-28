import "./styles.css"
import { forwardRef } from "react"
import { Link } from "react-router-dom"
import { ImLinkedin } from "react-icons/im";

const email = "tourekris16@gmail.com"

const links = [
    { to: "/", label: "Projects" },
    { to: "/a-propos", label: "About" },
    { href: `mailto:${email}`, label: "Contact" },
]

const Nav = forwardRef(function Nav({ onNavigate, onClose }, ref){
    const handleClick = (event, to) => {
        event.preventDefault()
        onNavigate(to)
    }

    const renderLinkText = (label) => (
        <span className="nav-link-text" aria-hidden="true">
            <span className="nav-link-text__primary">{label}</span>
            <span className="nav-link-text__clone">{label}</span>
        </span>
    )

    return(
        <nav ref={ref} id="header-navigation">
            {links.map((link) => (
                <div className="lien" key={link.to ?? link.href}>
                    {link.href ? (
                        <a
                            href={link.href}
                            aria-label={link.label}
                            onClick={() => onClose?.()}
                        >
                            {renderLinkText(link.label)}
                        </a>
                    ) : (
                        <Link
                            to={link.to}
                            aria-label={link.label}
                            onClick={(event) => handleClick(event, link.to)}
                        >
                            {renderLinkText(link.label)}
                        </Link>
                    )}
                </div>
            ))}
            <div className="mail">
                <a href={`mailto:${email}`} onClick={() => onClose?.()}>
                    {email}
                </a>
                <a className="social-link" href="https://www.linkedin.com/in/kris-toure/" target="_blank" rel="noopener noreferrer">
                    <ImLinkedin />
                </a>
            </div>
        </nav>
    )
})

export default Nav;
