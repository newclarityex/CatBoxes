import { useEffect, useRef, useState } from "react";



function App() {
  const [count, setCount] = useState(1 as number);
  const possibleLocations = useRef(new Set() as Set<number>);
  const [catMovements, setCatMovements] = useState([] as [number, number][]);

  //Boxes array
  let boxes = new Array(count).fill(0);

  //We need to generate a cat in each box
  useEffect(() => {
    possibleLocations.current = new Set(boxes.map((_, i) => i));
  }, [count]);

  //Logic for adjustment boxes of cat movements
  const catSteps = () => {
    console.log("possibleLocations", possibleLocations.current);
    let newPossibleLocations = new Set() as Set<number>;
    let newCatMovements = [] as [number, number][];
    possibleLocations.current.forEach((location) => {
      let possibleSteps = [] as number[];
      if (location - 1 >= 0) possibleSteps.push(location - 1);
      if (location + 1 < count) possibleSteps.push(location + 1);
      possibleSteps.forEach((step) => {
        newPossibleLocations.add(step);
        newCatMovements.push([location, step]);
      });
    });
    console.log("newPossibleLocations", newPossibleLocations);
    possibleLocations.current = newPossibleLocations;
    setCatMovements(newCatMovements);
  };

  const handleBox = (index: number) => {
    possibleLocations.current.delete(index);
    catSteps();
  };

  return (
    <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center font-mono">
      <h1 className="text-6xl">Try to catch a cat</h1>
      <div className="flex gap-24 flex-row mt-16 ">
        <button
          className="text-4xl w-40 text-center"
          disabled={count <= 1}
          onClick={() => setCount(count - 1)}
        >
          Remove
        </button>
        <p className="text-3xl w-40 text-center">{count}</p>
        <button
          className="text-4xl w-40 text-center"
          onClick={() => setCount(count + 1)}
        >
          Add
        </button>
      </div>
      <div className="flex gap-3 flex-row mt-32">
        {boxes.map((_, i) => (
          <div>
            <button className="text-2xl" key={i} onClick={() => handleBox(i)}>
            <img src="box-test.svg" className="w-12 h-12"/>{i + 1}
            </button>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
