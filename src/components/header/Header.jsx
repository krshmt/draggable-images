import "./styles.css"
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import Button from "./header-btn/Button";
import Nav from "./header-nav/Nav";

gsap.registerPlugin(CustomEase);

const navOpenEase = CustomEase.create(
	"navOpenEase",
	"M0,0 C0.18,0 0.22,1.34 0.62,1.34 0.82,1.34 0.86,1 1,1"
);
const navCloseEase = CustomEase.create(
	"navCloseEase",
	"M0,0 C0.16,0 0.18,-0.34 0.36,-0.34 0.72,-0.34 0.8,1 1,1"
);

function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const [shouldRenderNav, setShouldRenderNav] = useState(false);
	const buttonRef = useRef(null);
	const circleRef = useRef(null);
	const navRef = useRef(null);
	const navTweenRef = useRef(null);
	const openFrameRef = useRef(null);
	const rotationRef = useRef(0);
	const navigate = useNavigate();

	const animateButton = useCallback(() => {
		if (!circleRef.current) return;

		rotationRef.current += 90;

		gsap.to(circleRef.current, {
			"--menu-button-rotation": `${rotationRef.current}deg`,
			duration: 0.6,
			ease: "power3.out",
		});
	}, []);

	const animateOpen = useCallback(() => {
		const nav = navRef.current;
		if (!nav) return;

		navTweenRef.current?.kill();
		gsap.set(nav, {
			transformOrigin: "right top",
			overflow: "hidden",
		});

		navTweenRef.current = gsap.fromTo(
			nav,
			{
				scale: 0.8,
				opacity: 0,
			},
			{
				scale: 1,
				opacity: 1,
				duration: 0.5,
				ease: navOpenEase,
				onComplete: () => {
					navTweenRef.current = null;
				},
			}
		);
	}, []);

	const openNav = useCallback(() => {
		setIsOpen(true);
		setShouldRenderNav(true);

		if (openFrameRef.current) {
			window.cancelAnimationFrame(openFrameRef.current);
		}

		openFrameRef.current = window.requestAnimationFrame(() => {
			openFrameRef.current = null;
			animateOpen();
		});
	}, [animateOpen]);

	const closeNav = useCallback((onComplete) => {
		if (openFrameRef.current) {
			window.cancelAnimationFrame(openFrameRef.current);
			openFrameRef.current = null;
		}

		setIsOpen(false);

		const nav = navRef.current;
		if (!nav) {
			setShouldRenderNav(false);
			onComplete?.();
			return;
		}

		navTweenRef.current?.kill();
		navTweenRef.current = gsap.to(nav, {
			scale: 0.8,
			opacity: 0,
			duration: 0.5,
			ease: navCloseEase,
			onComplete: () => {
				navTweenRef.current = null;
				setShouldRenderNav(false);
				onComplete?.();
			},
		});
	}, []);

	const handleMenuClick = useCallback(() => {
		animateButton();

		if (isOpen) {
			closeNav();
			return;
		}

		openNav();
	}, [animateButton, closeNav, isOpen, openNav]);

	const handleNavigate = useCallback(
		(to) => {
			closeNav(() => navigate(to));
		},
		[closeNav, navigate]
	);

	const handleBackdropInteraction = useCallback(
		(event) => {
			event.preventDefault();
			event.stopPropagation();

			if (isOpen) {
				closeNav();
			}
		},
		[closeNav, isOpen]
	);

	useEffect(() => {
		if (!shouldRenderNav) return undefined;

		const handlePointerDown = (event) => {
			const target = event.target;

			if (
				navRef.current?.contains(target) ||
				buttonRef.current?.contains(target)
			) {
				return;
			}

			if (isOpen) {
				closeNav();
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [closeNav, isOpen, shouldRenderNav]);

	useEffect(() => {
		return () => {
			if (openFrameRef.current) {
				window.cancelAnimationFrame(openFrameRef.current);
			}

			navTweenRef.current?.kill();
		};
	}, []);

	  return (
		<>
			{shouldRenderNav && (
				<div
					className={`nav-backdrop${isOpen ? " is-open" : ""}`}
					aria-hidden="true"
					onPointerDown={handleBackdropInteraction}
					onMouseDown={handleBackdropInteraction}
					onMouseUp={handleBackdropInteraction}
					onClick={handleBackdropInteraction}
					onTouchStart={handleBackdropInteraction}
					onTouchEnd={handleBackdropInteraction}
				/>
			)}
			<header className="site-header">
				<div className="logo">
				</div>
				<div className="header-menu">
					<Button
						ref={buttonRef}
						circleRef={circleRef}
						isOpen={isOpen}
						onClick={handleMenuClick}
					/>
					{shouldRenderNav && (
						<Nav ref={navRef} onNavigate={handleNavigate} onClose={closeNav} />
					)}
				</div>
			</header>
		</>
	  )
}
export default Header;
