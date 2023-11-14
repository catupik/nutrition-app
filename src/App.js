import { useEffect, useState } from "react";
import "./App.css";
import video from "./video.mp4";
import Nutrients from "./Nutrients";
import { LoaderPage } from "./Loader/LoaderPage";
import Swal from "sweetalert2";
import { useCallback } from "react";

function App() {
  const MY_ID = "4f3d1de3";
  const MY_KEY = "349826585484e4c981464703957401c6";
  const APP_URL = "https://api.edamam.com/api/nutrition-details";

  const [mySearch, setMySearch] = useState();
  const [wordSubmitted, setWordSubmitted] = useState("");
  const [myAnalysis, setMyAnalysis] = useState("");
  const [stateLoader, setStateLoader] = useState(false);

  const fetchData = useCallback(async (ingr) => {
    setStateLoader(true);
    const response = await fetch(
      `${APP_URL}?app_id=${MY_ID}&app_key=${MY_KEY}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingr: ingr }),
      }
    );

    if (response.ok) {
      setStateLoader(false);
      const data = await response.json();
      setMyAnalysis(data);
    } else {
      setStateLoader(false);
      wrongIngredients();
    }
  }, []);

  const analyzeMyFood = (e) => setMySearch(e.target.value);

  const finalSearch = (e) => {
    e.preventDefault();
    if (mySearch && mySearch.trim() !== "") {
      setWordSubmitted(mySearch);
    } else {
      newAlert();
      // alert("Please enter valid ingredients!");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (wordSubmitted !== "") {
      let ingr = wordSubmitted.split(/[,;\n,\r]/);
      fetchData(ingr);
    }
  }, [wordSubmitted, fetchData]);

  const labelTransformations = {
    "Total lipid (fat)": "Fat",
    "Fiber, total dietary": "FIber",
    "Carbohydrate, by difference": "Carbohydrate",
    "Sugars, total including NLEA": "Sugars",
  };

  const primaryLabels = [
    "Energy",
    "Total lipid (fat)",
    "Carbohydrate, by difference",
    "Fiber, total dietary",
    "Sugars, total including NLEA",
    "Protein",
  ];
  const excludedLabels = [
    "Fatty acids, total saturated",
    "Fatty acids, total trans",
    "Fatty acids, total monounsaturated",
    "Fatty acids, total polyunsaturated",
  ];

  const isPrimaryLabel = (label) => primaryLabels.includes(label);
  const isExcludedLabel = (label) => excludedLabels.includes(label);
  const transformLabel = (label) => {
    return labelTransformations[label] || label;
  };

  const newAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter valid ingredients!",
    });
  };
  const wrongIngredients = () => {
    Swal.fire("", "Wrong ingredients entered?", "question");
  };

  return (
    <div className="App">
      {stateLoader && <LoaderPage />}
      <div className="container">
        <video playsInline autoPlay muted loop>
          <source src={video} type="video/mp4" />
        </video>
        <h1>Analyze what you eat</h1>
        <div  className="container">
          <form className="container" onSubmit={finalSearch}>
            <input
              placeholder="LIST YOUR INGREDIENTS"
              onChange={analyzeMyFood}
            />
            <button type="submit">Analyze</button>
          </form>
        </div>
        <div className="blocks">
          <div className="block">
            <h3>Main nutrients</h3>
            {myAnalysis?.totalNutrients &&
              Object.values(myAnalysis.totalNutrients)
                .filter(({ label }) => isPrimaryLabel(label))
                .map(({ label, quantity, unit }, index) => (
                  <Nutrients
                    key={index}
                    label={transformLabel(label)}
                    quantity={quantity.toFixed(2)}
                    unit={unit}
                  />
                ))}
          </div>

          <div className="block">
            <h3>Vitamins and minerals</h3>
            {myAnalysis?.totalNutrients &&
              Object.values(myAnalysis.totalNutrients)
                .filter(
                  ({ label }) =>
                    !isPrimaryLabel(label) && !isExcludedLabel(label)
                )
                .map(({ label, quantity, unit }, index) => (
                  <Nutrients
                    key={index}
                    label={label}
                    quantity={quantity.toFixed(2)}
                    unit={unit}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
