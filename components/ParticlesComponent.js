import React, { useCallback } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";

const ParticlesComponent = () => {
  const init = useCallback(async (engine) => {
    await loadFull(engine);
  });

  return (
    <div id="particlesWrapper">
      <Particles
        options={{
          particles: {
            color: {
              value: "#fff",
            },
            number: {
              value: 20,
            },
            opacity: {
              value: { min: 0.3, max: 1 },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
            move: {
              direction: "bottom-right",
              enable: true,
              speed: { min: 1, max: 2 },
              straight: false,
            },
          },
        }}
        init={init}
      />
      <style jsx>{`
        #particlesWrapper {
          height: 100vh;
          position: absolute;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default React.memo(ParticlesComponent, (prevProps, newProps) => {
  console.log("Tried to refresh particles");
  return true;
});
