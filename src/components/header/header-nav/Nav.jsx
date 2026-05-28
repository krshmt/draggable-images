import "./styles.css"
import { forwardRef } from "react"
import { Link } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa"

const links = [
    { to: "/", label: "Projets" },
    { to: "/a-propos", label: "À propos" },
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
                    <Link to={link.to} onClick={(event) => handleClick(event, link.to)}>
                        {link.label}
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
