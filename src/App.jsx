import React, { useEffect } from "react";
import "./App.css";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

function App() {
  useEffect(() => {
    gsap.registerPlugin(Draggable);

    // Animation d'entrée pour toutes les images en même temps
    gsap.fromTo(
      ".container-draggable",
      {
        scale: 0, // Valeur de départ
        opacity: 0, // Valeur de départ
      },
      {
        scale: 1, // Valeur finale
        opacity: 1, // Valeur finale
        duration: 1, // Durée de l'animation
        ease: "power1.out", // Effet d'élasticité
      }
    );

    // Configuration de Draggable
    Draggable.create(".image-draggable", {
      bounds: ".container-draggable",
      inertia: true,
    });
  }, []);

  return (
    <>
      <div className="container-root">
        <div className="container-draggable">
          <img className="image-draggable image1" src="https://orva.lemouvementassociatif-cvl.org/wp-content/uploads/2025/05/image.png" alt="" />
          <img className="image-draggable image2" src="https://orva.lemouvementassociatif-cvl.org/wp-content/uploads/2025/05/image2.png" alt="" />
          <img className="image-draggable image3" src="https://orva.lemouvementassociatif-cvl.org/wp-content/uploads/2025/05/image3.png" alt="" />
          <img className="image-draggable image4" src="https://orva.lemouvementassociatif-cvl.org/wp-content/uploads/2025/05/image4.png" alt="" />
          <img className="image-draggable image5" src="https://orva.lemouvementassociatif-cvl.org/wp-content/uploads/2025/05/image5.png" alt="" />
          <img className="image-draggable image6" src="https://orva.lemouvementassociatif-cvl.org/wp-content/uploads/2025/05/image6.png" alt="" />
        </div>
      </div>
    </>
  );
}

export default App;
