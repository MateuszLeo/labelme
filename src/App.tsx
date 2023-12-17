import { observer } from "mobx-react-lite";
import { Labeler } from "./Labeler";
import { PointTuple } from "./UIState";

const shelves: PointTuple[][] = [
  [[300, 300], [500, 300], [500, 1000], [300, 1000]],
  [[300, 300], [500, 300], [500, 1000], [300, 1000]],
  [[300, 300], [500, 300], [500, 1000], [300, 1000]],
  [[300, 300], [500, 300], [500, 1000], [300, 1000]],
];

export const App = observer(function App() {
  return <Labeler shelves={shelves} onChange={console.log} imageSrc={"/shelf.jpeg"} />;
});
