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
        if (!catMovement.ref) return;
        const element = catMovement.ref;
        if (!element) return;
        element.style.display = `block`;
        element.style.transitionDuration = `0s`;
        await delay(20); 
        // Get center of the element
        const originalPosition = boxRefs.current[catMovement.from]?.getBoundingClientRect();
        if (!originalPosition) return;
        const originalCenter = {
            x: originalPosition?.left + originalPosition?.width / 2,
            y: originalPosition?.top + originalPosition?.height / 2,
        };
        // Move to original position
        element.style.top = `${originalCenter.y}px`;
        element.style.left = `${originalCenter.x}px`;
        element.style.transform = `translateY(0)`;
        element.style.opacity = `0`;
        await delay(20);
        element.style.transitionDuration = `0.5s`;
        await delay(20);
        // Move up and fade in
        element.style.opacity = `0.4`;
        element.style.transform = `translateY(-100%)`;
        await delay(500);
        // Move to new position
        const newPosition = boxRefs.current[catMovement.to]?.getBoundingClientRect();
        if (!newPosition) return;
        const newCenter = {
            x: newPosition?.left + newPosition?.width / 2,
            y: newPosition?.top + newPosition?.height / 2,
        };
        element.style.top = `${newCenter.y}px`;
        element.style.left = `${newCenter.x}px`;
        await delay(500);
        // Move down
        element.style.transform = `translateY(0)`;
        element.style.opacity = `0`;
        await delay(500);
        element.style.display = `none`;
        setAnimating(false);
    });
  };

  const killedCat = useRef(null as null | HTMLDivElement);
  const killCat = async (index: number) => {
    if (!killedCat.current) return;
    const originalPosition = boxRefs.current[index]?.getBoundingClientRect();
    if (!originalPosition) return;
    const originalCenter = {
        x: originalPosition?.left + originalPosition?.width / 2,
        y: originalPosition?.top + originalPosition?.height / 2,
    };
    killedCat.current.style.display = `block`;
    killedCat.current.style.transitionDuration = `0s`;
    await delay(20);
    killedCat.current.style.filter = `blur(0px)`;
    killedCat.current.style.top = `${originalCenter.y}px`;
    killedCat.current.style.left = `${originalCenter.x}px`;
    killedCat.current.style.transform = `translateY(0)`;
    killedCat.current.style.opacity = `0`;
    await delay(20);
    killedCat.current.style.transitionDuration = `0.5s`;
    await delay(20);
    killedCat.current.style.opacity = `1`;
    killedCat.current.style.transform = `translateY(-100%)`;
    await delay(500);
    killedCat.current.style.filter = `blur(2px)`;
    killedCat.current.style.opacity = `0`;
    await delay(500);
    return;
  };

  useEffect(() => {
    handleAnimation();
}, [catMovements]);

  const handleBox = async (index: number) => {
    possibleLocations.delete(index);
    setAnimating(true);
    await killCat(index);
    setPossibleLocations(new Set(possibleLocations));
    catSteps();
  };

  const restart = () => {
    setOpen(false);
    setAnimating(false);
    setPossibleLocations(new Set(boxes.map((_, i) => i)));
  };

  const transitionStyles = {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
    exiting: { opacity: 1 },
    exited: { opacity: 0 },
    unmounted: { opacity: 0 },
  };

  return (
    <>
    <div className="-z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 fixed w-full h-full"></div>
    <div className="w-full h-full flex flex-col md:justify-evenly items-center font-mono px-8">
    <Transition in={open} timeout={300}>
        {(state) => (<div
          id="modal"
          className="w-full h-full absolute bg-black/40 flex justify-center items-center transition-opacity duration-300 z-20"
          style={{
            ...transitionStyles[state],
            pointerEvents: state === "exited" ? "none" : "all",
          }}
        >
          <div className="bg-fuchsia-900 px-12 py-8 flex flex-col gap-20 items-center rounded-lg shadow-xl text-white">
            <h1 className="text-center font-semibold text-2xl">You caught Schrodinger's kitty!</h1>
            <img className="h-16 w-16" src="/BlobCatHotSip.gif" />
            <div className="flex gap-40 text-xl underline underline-offset-8">
              <button onClick={() => restart()} className="hover:opacity-80">Start Over</button>
              <a
                href="https://cataas.com/cat/says/you%20caught%20me%20:("
                target="_blank"
                className="hover:opacity-80"
              >
                View Kitty
              </a>
            </div>
          </div>
        </div>)}
    </Transition>  

    <div ref={killedCat} className="absolute transition-all text-5xl" style={{
        display: `none`,
        opacity: 0,
    }}>
        <div className="-translate-x-1/2 -translate-y-1/2">
            🐱
        </div>
    </div>

      {catMovements.map((catMovement, i) => {
        return (
          <div
            key={`movement-${i}`}
            className="absolute transition-all text-5xl"
            ref={(ref) => (catMovement.ref = ref)}
            style={{
              display: "none",
              opacity: 0,
              transitionDuration: "0s",
            }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
                🐱
            </div>
          </div>
        );
      })}
      <h1 className="text-3xl font-semibold text-white text-center my-8">
        Catch Schrodinger's Cat <img src="meow_box.png" className="inline w-16" />
      </h1>
      <div className="my-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Rules: </h2>
        <ol className="text-xl text-white list-decimal relative ml-20">
            <li>There is a cat hiding among the boxes.</li>
            <li>You can click on a box to check it for cats.</li>
            <li>The cat will move to an adjacent box after each check.</li>
            <li>Eliminate every possible location for the cat to win!</li>
        </ol>
      </div>
      <div className="flex gap-4 flex-row my-8">
        {boxes.map((_, i) => (
          <div key={`box-${i}`} ref={(ref) => (boxRefs.current[i] = ref)}>
            <button
              className="text-2xl"
              onClick={() => handleBox(i)}
              disabled={animating}
            >
            <img className={`absolute max-h-20 max-w-36 ${possibleLocations.has(i) && !animating ? 'opacity-100' : 'opacity-0'}`} src='cat-face.png'/>
                <img className="max-h-20 max-w-36" src={animating ? `open-box.png` : `closed-box.png`}/>
              {/* <div className={`transition-opacity duration-500 ${possibleLocations.has(i) && !animating ? 'opacity-100' : 'opacity-0'}`}>
                🐱
              </div> */}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-12 md:gap-24 flex-row mt-16 text-xl text-white">
        <button
          className="w-36 text-center border-white border-2 rounded-lg p-2 hover:opacity-80"
          disabled={count > 10 || animating}
          onClick={() => setCount(count + 1)}
        >
          Add Box
        </button>
        <button
          className="w-36 text-center border-white border-2 rounded-lg p-2 hover:opacity-80"
          disabled={count <= 1 || animating}
          onClick={() => setCount(count - 1)}
        >
          Remove Box
        </button>
      </div>
      <div className="text-xl md:text-2xl text-white px-8 text-center my-12">
        <p>
          Made with &hearts; by{" "}
          <a href="https://github.com/newclarityex">Kira</a> and{" "}
          <a href="https://github.com/SleepySonya">Sonya</a>. Boxes by{" "}
          <a href="https://discord.com/users/189110347943116800">Purple</a>.
        </p>
      </div>
    </div>
    </>
  );
}

export default App;
