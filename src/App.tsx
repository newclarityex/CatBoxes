import { useEffect, useRef, useState } from "react";
import { Transition } from 'react-transition-group';

function App() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(1 as number);
  const [possibleLocations, setPossibleLocations] = useState(
    new Set() as Set<number>
  );
  const [catMovements, setCatMovements] = useState(
    [] as {
      from: number;
      to: number;
      ref: null | HTMLDivElement;
    }[]
  );

  const boxRefs = useRef(
    {} as {
      [key: number]: HTMLDivElement | null;
    }
  );

  //Boxes array
  let boxes = new Array(count).fill(0);

  //We need to generate a cat in each box
  useEffect(() => {
    setPossibleLocations(new Set(boxes.map((_, i) => i)));
  }, [count]);

  //Logic for adjustment boxes of cat movements
  const catSteps = () => {
    let newPossibleLocations = new Set() as Set<number>;
    let newCatMovements = [] as {
      from: number;
      to: number;
      ref: null | HTMLDivElement;
    }[];
    possibleLocations.forEach((location) => {
      let possibleSteps = [] as number[];
      if (location - 1 >= 0) possibleSteps.push(location - 1);
      if (location + 1 < count) possibleSteps.push(location + 1);
      possibleSteps.forEach((step) => {
        newPossibleLocations.add(step);
        newCatMovements.push({
          from: location,
          to: step,
          ref: null,
        });
      });
    });
    setPossibleLocations(newPossibleLocations);
    setCatMovements(newCatMovements);
    if (newPossibleLocations.size === 0) {
      setOpen(true);
    }
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const [animating, setAnimating] = useState(false);
  const handleAnimation = () => {
    catMovements.forEach(async (catMovement) => {
        if (catMovement.ref) {
            setAnimating(true);
            const element = catMovement.ref;
            if (!element) return;
            element.style.display = `block`;
            await delay(10); 
            element.style.transitionDuration = `0s`;
            // Get original position
            const originalPosition = boxRefs.current[catMovement.from]?.getBoundingClientRect();
            // Move to original position
            element.style.top = `${originalPosition?.top}px`;
            element.style.left = `${originalPosition?.left}px`;
            element.style.transform = `translateY(0)`;
            element.style.opacity = `0`;
            await delay(10);
            element.style.transitionDuration = `0.5s`;
            await delay(50);
            // Move up and fade in
            element.style.opacity = `0.2`;
            element.style.transform = `translateY(-100%)`;
            await delay(500);
            // Move to new position
            const newPosition = boxRefs.current[catMovement.to]?.getBoundingClientRect();
            element.style.top = `${newPosition?.top}px`;
            element.style.left = `${newPosition?.left}px`;
            await delay(500);
            // Move down
            element.style.transform = `translateY(0)`;
            element.style.opacity = `0`;
            await delay(500);
            element.style.display = `none`;
            setAnimating(false);
        }
    });
  };

  useEffect(() => {
    handleAnimation();
  }, [catMovements]);

  const handleBox = (index: number) => {
    possibleLocations.delete(index);
    setPossibleLocations(new Set(possibleLocations));
    catSteps();
  };

  const restart = () => {
    setOpen(false);
    setPossibleLocations(new Set(boxes.map((_, i) => i)));
  };

  const duration = 300;
  const transitionStyles = {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
    exiting: { opacity: 1 },
    exited: { opacity: 0 },
    unmounted: { opacity: 0 },
  };

  return (
    <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center font-mono">
    <Transition in={open} timeout={300}>
        {(state) => (<div
          id="modal"
          className="w-full h-full absolute bg-black/40 flex justify-center items-center transition-opacity duration-300"
          style={{
            ...transitionStyles[state],
            pointerEvents: state === "exited" ? "none" : "all",
          }}
        >
          <div className="bg-white p-4 flex flex-col gap-20 items-center rounded-lg">
            <h1 className="text-center">You caught a Schrodinger's kitty!</h1>
            <img className="h-16 w-16" src="/BlobCatHotSip.gif" />
            <div className="flex gap-60">
              <button onClick={() => restart()}>Start Over</button>
              <a
                href="https://cataas.com/cat/says/you%20caught%20me%20:("
                target="_blank"
              >
                View Kitty
              </a>
            </div>
          </div>
        </div>)}
    </Transition>  

      {catMovements.map((catMovement, i) => {
        return (
          <div
            key={`movement-${i}`}
            className="absolute transition-all text-3xl"
            ref={(ref) => (catMovement.ref = ref)}
            style={{
              display: "none",
              opacity: 0,
            }}
          >
            🐱
          </div>
        );
      })}
      <h1 className="text-6xl">
        Try to catch a cat <img src="meow_box.png" className="inline w-16" />
      </h1>
      <div className="flex gap-24 flex-row mt-16 ">
        <button
          className="text-4xl w-40 text-center"
          disabled={count <= 1 || animating}
          onClick={() => setCount(count - 1)}
        >
          Remove
        </button>
        <p className="text-3xl w-40 text-center">{count}</p>
        <button
          className="text-4xl w-40 text-center"
          disabled={count > 10 || animating}
          onClick={() => setCount(count + 1)}
        >
          Add
        </button>
      </div>
      <div className="flex gap-3 flex-row mt-32">
        {boxes.map((_, i) => (
          <div key={`box-${i}`} ref={(ref) => (boxRefs.current[i] = ref)}>
            <button
              className="text-2xl"
              onClick={() => handleBox(i)}
              disabled={animating}
            >
              <img src="box-test.svg" className="w-12 h-12" />
              {i + 1}
              {possibleLocations.has(i) ? "🐱" : ""}
            </button>
          </div>
        ))}
      </div>
      <div className="fixed bottom-4">
        <p>
          Made with &hearts; by{" "}
          <a href="https://github.com/newclarityex">Kira</a> and{" "}
          <a href="https://github.com/SleepySonya">Sonya</a>. Boxes by{" "}
          <a href="https://discord.com/users/189110347943116800">Purple</a>.
        </p>
      </div>
    </div>
  );
}

export default App;
