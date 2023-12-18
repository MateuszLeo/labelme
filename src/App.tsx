import { observer } from "mobx-react-lite";
import { PointTuple } from "./Element";
import { Labeler } from "./Labeler";

const shelves: PointTuple[][] = [
  [[28, 108], [109, 87], [107, 133], [20, 143]],
  [[194, 141], [357, 131], [358, 171], [193, 169]],
  [[195, 248], [349, 287], [349, 324], [193, 275]],
  [[356, 117], [624, 97], [624, 312], [348, 257]],
  [[350, 271], [622, 328], [624, 389], [348, 307]],
];

export const App = observer(function App() {
  return <Labeler shelves={shelves} onChange={console.log} imageSrc={"/focal.jpg"} />;
});
